<template>
  <div class="list-container">
    <SearchBar
      v-model:query="searchQuery"
      :filter-label="selectedDept || '부서 전체'"
      :sort-label="sortLabel"
      :dept-list="deptList"
      :placeholder="placeholderMsg"
      @filter-click="handleDeptFilter"
      @sort-click="toggleSort"
    />
    <ListForm :headers="customHeaders" :items="memberItems" />
  </div>
</template>

<script setup>
import SearchBar from '@/components/common/SearchBar.vue'
import ListForm from '@/components/common/ListForm.vue'
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

const fetchParticipants = () => api.get(`/api/projects/${projectId}/participants`)

onMounted(async () => {
  if (!userStore.accessToken) {
    router.push('/login')
    return
  }

  try {
    const res = await fetchParticipants()
    participantList.value = res.data.data.participants

    // 부서 목록 중복 제거 및 deptId 부여
    const uniqueDeptNames = [...new Set(participantList.value.map(p => p.deptName))]

    deptList.value = uniqueDeptNames.map((name, index) => ({
      deptId: index,
      deptName: name
    }))
  } catch (err) {
    console.error('멤버 목록 로딩 실패:', err)
  }
})

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


</style>

