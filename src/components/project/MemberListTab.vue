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
    
    <ListForm :headers="customHeaders" :items="memberItems" />

    <ParticipantSelectModal
        v-if="showInviteModal"
        :type="inviteType"
        :user-list="inviteList"
        :selected-approver=null
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


const customHeaders = [
    { title: '부서', key: 'deptName' },
    { title: '직책', key: 'jobRoleName' },
    { title: '직급', key: 'jobRankName' },
    { title: '역할', key: 'roleId' },
    { title: '이름', key: 'name' }    
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
    name: member.name,
    deptName: member.deptName,
    jobRoleName: member.jobRoleName,
    jobRankName: member.jobRankName,
    roleId: member.roleId,
    selected: false
  }))
})

const fetchParticipants = async () => {
  try {

    const res = await  api.get(`/api/projects/${projectId}/participants`)
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
  try{
    const res = await api.get(`/api/projects/${projectId}/invitable-user`)

    inviteList.value = res.data.data;
    console.log('✅ 초대 대상 리스트 확인', inviteList.value)
  }catch( err){
    console.error('초대 목록 로딩 실패:', err)
  }
  
}
// 초대 가능 유저 
function handleUserSelect(selectedUsers){
  if(inviteType.value === 'leader'){
    selectedLeaders.value = selectedUsers || []
  }else{
    selectedMembers.value = selectedUsers || []
  }
  showInviteModal = false
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

