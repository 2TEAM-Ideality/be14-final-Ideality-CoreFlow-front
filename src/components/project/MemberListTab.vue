<template>
  <div class="list-container">
    <div class="list-header">
      <SearchBar
      v-model:query="searchQuery"
      :filter-label="selectedDept || '부서 전체'"
      :sort-label="sortLabel"
      :dept-list="deptList"
      :placeholder="placeholderMsg"
      @filter-click="handleDeptFilter"
      @sort-click="toggleSort"
      />
      <v-btn variant="tonal" color="#7578ee" 
        @click="clickInviteModal('leader')"
        prepend-icon="mdi-account-tie">
        팀장 초대</v-btn>  
      <v-btn variant="tonal" color="#7578ee" 
        @click="clickInviteModal('member')" prepend-icon="mdi-account-group">
        팀원 초대</v-btn>  
    </div>
    
    <ListForm 
    :headers="customHeadersWithActions" 
    :items="memberItems"
    @delete="handleDeleteParticipant"
    />

    <!-- 팀장 & 팀원 초대 선택 모달 -->
    <ParticipantSelectModal
        v-if="showInviteModal"
        :type="inviteType"
        :user-list="inviteList"
        :selected-approver=[]
        :selectedLeaders = "selectedLeaders"
        :selectedMembers = "selectedMembers"
        @close="showInviteModal = false"
        @select="handleUserSelect"
    />

    <!-- <v-dialog v-model="showInviteModal" max-width="600px" persistent>
      <v-card style="padding: 5%; ">
        <v-card-title class="text-h6 font-weight-bold" >
          참여자 초대
        </v-card-title>
        <v-tabs v-model="activeTab" class="mt-3 mb-2" color="warning">
          <v-tab value="leader">팀장</v-tab>
          <v-tab value="member">팀원</v-tab>
        </v-tabs>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showInviteModal = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
  </div>
</template>

<script setup>
import SearchBar from '@/components/common/SearchBar.vue'
import ListForm from '@/components/common/ListForm.vue'
import ParticipantSelectModal from '@/components/approval/ParticipantSelectModal.vue'
import api from '@/api.js'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const projectId = route.params.id
const participantList = ref([])
const deptList = ref([])

const searchQuery = ref('')
const sortLabel = ref('오름차순')
const selectedDept = ref('부서 전체')
const placeholderMsg = ref('이름, 직책, 직급 검색')

// 참여자 초대 관련
const showInviteModal = ref(false)
const activeTab = ref('leader') // leader, member
const inviteList = ref([])
const inviteType = ref('leader')

const selectedLeaders = ref(null)
const selectedMembers = ref([])


const customHeadersWithActions = [
  { title: '부서', key: 'deptName' },
  { title: '직급', key: 'jobRankName' },
  { title: '역할', key: 'roleId' },
  { title: '이름', key: 'name' },
  { title: '관리', key: 'actions', sortable: false }
]


const memberItems = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  const deptFilter = selectedDept.value

  let filtered = participantList.value.filter(member => {
    const matchesKeyword =
      member.name?.toLowerCase().includes(keyword) ||
      member.jobRoleName?.toLowerCase().includes(keyword) ||
      member.jobRankName?.toLowerCase().includes(keyword)

    const matchesDept =
      deptFilter === '부서 전체' || member.deptName === deptFilter

    return matchesKeyword && matchesDept
  })

  filtered = filtered.sort((a, b) => {
    const nameA = a.name?.toLowerCase() || ''
    const nameB = b.name?.toLowerCase() || ''
    return sortLabel.value === '오름차순'
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA)
  })

  return filtered.map(member => ({
    userId: member.userId ?? member.id,   // 삭제 요청 목적
    name: member.name,
    deptName: member.deptName,
    jobRankName: member.jobRankName,
    roleId: member.roleId,
    selected: false
  }))
})

const fetchParticipants = async () => {
  try {

    const res = await api.get(`/api/projects/${projectId}/participants`)
    participantList.value = res.data.data.participants

    // 부서 목록 중복 제거 및 deptId 부여
    const uniqueDeptNames = [...new Set(participantList.value.map(p => p.deptName))]

    deptList.value = uniqueDeptNames.map((name, index) => ({
      deptId: index,
      deptName: name
    }))
    
  }catch( err ){
    console.error('멤버 목록 로딩 실패:', err)
  }
  
}

// 초대 가능한 팀원 조회 
const fetchInviteLeaderList = async () => {
  try {
    const res = await api.get(`/api/projects/${projectId}/invitable-user`)

    inviteList.value = res.data.data
      // 1) 아직 참여하지 않은 사용자만
      .filter(user => user.participation === false)
      // 2) deptName이 admin(공백·대소문자 무관)이면 제외
      .filter(user => {
        const d = user.deptName?.trim().toLowerCase() || ''
        return d !== 'admin'
      })

    console.log('✅ 초대 대상 리스트 (참여 X, admin 제외)', inviteList.value)
  } catch (err) {
    console.error('초대 목록 로딩 실패:', err)
  }
}



// 팀원 & 팀장 초대 요청 처리 
async function handleUserSelect(selectedUsers) {
  if (inviteType.value === 'leader') {
    selectedLeaders.value = selectedUsers || []

    console.log(projectId, '✅ 프로젝트 팀장 초대 요청', selectedUsers)

    try {
      // 서버가 요구하는 형식: List<RequestInviteUserDTO>
      const payload = selectedUsers.map(user => ({
        userId: user.userId ?? user.id,
        deptName: user.deptName
      }))

      await api.post(`/api/projects/${projectId}/participants/team-leader`, payload)

      alert('팀장 초대가 완료되었습니다.')
      await fetchParticipants() // 초대 후 목록 새로고침
      await fetchInviteLeaderList() // 초대 후 초대 대상 새로고침

    } catch (error) {
      if (error.response.status === 403) {
        alert(error.response.data?.message || '접근 권한이 없습니다.')
      } else {
        alert('팀원 초대에 실패했습니다.')
      }
    }

  } else {
    selectedMembers.value = selectedUsers || []
    console.log(projectId, '✅ 프로젝트 팀원 초대 요청', selectedUsers)
    // /api/porjects/{projectId}/participants/team-member
    try {
      const payload = selectedUsers.map(user => ({
        userId: user.userId ?? user.id,
        deptName: user.deptName
      }))

      await api.post(`/api/projects/${projectId}/participants/team-member`, payload)

      alert('팀원 초대가 완료되었습니다.')
      await fetchParticipants() // 초대 후 목록 새로고침
      await fetchInviteLeaderList() // 초대 후 초대 대상 새로고침

    } catch (error) {
      if (error.response.status === 403) {
        alert(error.response.data?.message || '접근 권한이 없습니다.')
      } else {
        alert('팀원 초대에 실패했습니다.')
      }

    }
  }

  showInviteModal.value = false
}




onMounted(async () => {
  if (!userStore.accessToken) {
    router.push('/login')
    return
  }

  try {
    await fetchParticipants()
    await fetchInviteLeaderList()
    
  } catch (err) {
    console.error(err)
  }
})

const clickInviteModal = (type) => {
  inviteType.value = type
  showInviteModal.value = true

}

const toggleSort = () => {
  sortLabel.value = sortLabel.value === '오름차순' ? '내림차순' : '오름차순'
}

const handleDeptFilter = (dept) => {
  selectedDept.value = dept
}


// 참여자 삭제 
const handleDeleteParticipant = async (participant) => {
  const confirmed = confirm(`${participant.name}  ${participant.userId}님을 삭제하시겠습니까?`)
  if (!confirmed) return

  try {
    await api.delete(`/api/projects/${projectId}/participants/${participant.userId}`)
    alert('삭제가 완료되었습니다.')
    await fetchParticipants()
    await fetchInviteLeaderList()
  } catch (err) {
    console.error('삭제 실패:', err)
    alert('삭제 중 오류가 발생했습니다.')
  }
}


</script>

<style scoped>
* {
  text-align: left;
}
.list-container {
  width:100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.empty-message {
  padding: 24px;
  font-size: 16px;
}
::v-deep(td:first-child),
::v-deep(th:first-child) {
  display: none !important;
}

.list-header {
  width: 100%;
  display: flex; 
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
}
</style>

