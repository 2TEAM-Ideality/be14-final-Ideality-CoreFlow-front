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
    </div>
</template>

<script>
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


</script>

<style scoped>
</style>