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
            @click="clickInviteModal('member')" prepend-icon="mdi-account-group">
            팀원 초대
        </v-btn>  
        </div>
        
        <ListForm :headers="customHeaders" :items="memberItems" />

        <!-- 팀원 초대 선택 모달 -->
        <ParticipantSelectModal
        v-if="showInviteModal"
        :type="inviteType"
        :user-list="inviteList"
        :selected-approver="[]"
        :project-id="props.taskData.selectTask.projectId"
        :selectedMembers="selectedMembers"
        @close="showInviteModal = false"
        @select="handleUserSelect"
        />

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


const props = defineProps({
    taskData: {
        type: Object,
        required: true
    }
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const projectId = props.taskData.selectTask.projectId;
console.log(projectId);
const participantList = ref([])
const deptList = ref([])

const searchQuery = ref('')
const sortLabel = ref('오름차순')
const selectedDept = ref('부서 전체')
const placeholderMsg = ref('이름, 직책, 직급 검색')

const showInviteModal = ref(false)
const inviteList = ref([])
const inviteType = ref('member')
const selectedMembers = ref([])

const customHeaders = [
{ title: '부서', key: 'deptName' },
{ title: '직급', key: 'jobRankName' },
{ title: '역할', key: 'roleId' },
{ title: '이름', key: 'name' }
]

console.log(props.taskData);
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
        const res = await api.get(`/api/task/${props.taskData.selectTask.taskId}/participant`)
        const participants = res.data?.data ?? [] // ✅ 바로 배열

        participantList.value = participants

        const uniqueDeptNames = [...new Set(participants.map(p => p.deptName))]
        deptList.value = uniqueDeptNames.map((name, index) => ({
        deptId: index,
        deptName: name
        }))
    } catch (err) {
        console.error('멤버 목록 로딩 실패:', err)
    }
}


const fetchInvitableMembers = async () => {
    try {
        // 전체 프로젝트 참여자 조회
        const res = await api.get(`/api/projects/${props.taskData.selectTask.projectId}/participants`)
        const allUsers = res.data?.data?.participants ?? []

        // 현재 태스크 참여자 ID 목록
        const taskParticipants = participantList.value.map(p => p.userId)

        // 허용된 부서 (소문자 기준)
        const allowedDeptNames = props.taskData.deptNames?.map(d => d.trim().toLowerCase()) ?? []

        // 조건에 따라 필터링
        inviteList.value = Array.from(
            new Map(
                allUsers
                .filter(user => {
                    const dept = user.deptName?.trim().toLowerCase() || ''
                    const isNotTaskMember = !taskParticipants.includes(user.userId)
                    const isNotLeaderOrDirector = user.roleId !== '팀장' && user.roleId !== '디렉터'
                    const isInAllowedDept = allowedDeptNames.includes(dept)

                    return isNotTaskMember && isNotLeaderOrDirector && isInAllowedDept
                })
                .map(user => [user.userId, user]) // ✅ userId 기준으로 중복 제거
            ).values()
        )


        console.log('✅ 초대 가능한 팀원 목록:', inviteList.value)
    } catch (err) {
        console.error('❌ 초대 멤버 조회 실패:', err)
    }
}




const handleUserSelect = async (selectedUsers) => {
selectedMembers.value = selectedUsers || []
try {
    const payload = selectedUsers.map(user => ({
    userId: user.userId ?? user.id,
    deptName: user.deptName
    }))
    await api.post(`/api/task/${props.taskData.selectTask.taskId}/participants/team-member`, payload)
    alert('팀원 초대가 완료되었습니다.')
    await fetchParticipants()
    await fetchInvitableMembers()
} catch (error) {
    console.error('❌ 팀원 초대 실패', error)
    // alert('팀원 초대에 실패했습니다.')

    if (error.response.status === 403) {
    alert(error.response.data?.message || '접근 권한이 없습니다.')
    } else {
    alert('팀원 초대에 실패했습니다.')
    }
}
showInviteModal.value = false
}

onMounted(async () => {
if (!userStore.accessToken) {
    router.push('/login')
    return
}
await fetchParticipants()           // ⬅ 먼저 태스크 참여자 로드
await fetchInvitableMembers()      // ⬅ 그 후 전체 중에서 초대 대상 필터링
})

const clickInviteModal = () => {
inviteType.value = 'member'
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
width: 100%;
display: flex;
flex-direction: column;
gap: 20px;
margin-top: 20px;
}
.list-header {
width: 100%;
display: flex;
flex-direction: row;
justify-content: space-between;
gap: 12px;
}
.empty-message {
padding: 24px;
font-size: 16px;
}
::v-deep(td:first-child),
::v-deep(th:first-child) {
display: none !important;
}
</style>
