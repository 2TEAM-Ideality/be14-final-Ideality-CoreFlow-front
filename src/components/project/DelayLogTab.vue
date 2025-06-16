<template>
    <div v-if="fileItems.length === 0" class="empty-message">
        📄 해당 프로젝트에 대한 지연 사유서가 없습니다.
    </div>
    <div v-else class="list-container">
        <SearchBar
            v-model:query="searchQuery"
            :filter-label="selectedDept || '부서 전체'"
            :sort-label="sortLabel"
            :dept-list="deptList"
            :placeholder="placeholderMsg"
            @filter-click="handleDeptFilter"
            @sort-click="toggleSort"
        />
        <ListForm :headers="customHeaders" :items="fileItems" />
    </div>
</template>

<script setup>
import SearchBar from '@/components/common/SearchBar.vue'
import ListForm from '@/components/common/ListForm.vue'
import api from '@/api.js'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useRoute } from 'vue-router'

const route = useRoute()
const projectId = route.params.id

const userStore = useUserStore()
const router = useRouter()

const delayList = ref([])
const deptList = ref([])


//  검색
const searchQuery = ref('')
const sortLabel = ref('오름차순')
const selectedDept = ref('부서 전체')
const placeholderMsg = ref("지연사유서 검색")



const customHeaders = [
  { title: '지연 사유 번호', key: 'id' },
  { title: '관련 태스크', key: 'taskName' },
  { title: '요청자', key: 'approverName' },
  { title: '직위', key: 'approverJobRank' },
  { title: '직책', key: 'approvalJobRole' },
  { title: '지연 사유', key: 'delayReason' },
  { title: '요청 지연일', key: 'delayDays' },
  { title: '등록일자', key: 'createdDate' },
  { title: '파일', key: 'url' }
]

const fileItems = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  const deptFilter = selectedDept.value;

  let filtered = delayList.value.filter(item => {
    return (
      item.taskName?.toLowerCase().includes(keyword) ||
      item.approverName?.toLowerCase().includes(keyword) ||
      item.delayReason?.toLowerCase().includes(keyword)
    )
  })

  // 정렬
  filtered = filtered.sort((a, b) => {
    const nameA = a.taskName?.toLowerCase() || ''
    const nameB = b.taskName?.toLowerCase() || ''
    return sortLabel.value === '오름차순'
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA)
  })

  return filtered.map(item => ({
    id: item.id,
    taskName: item.taskName,
    approverName: item.approverName,
    approverJobRank: item.approverJobRank,
    approvalJobRole: item.approvalJobRole,
    delayReason: item.delayReason,
    delayDays: item.delayDays + '일',
    createdDate: item.createdDate, // 이미 LocalDate로 나옴
    url: item.url
  }))
})




// 지연 사유서 가져오기
const fetchDelayList = () => {
  return api.get(`/api/approval/project/${projectId}/delay/list`)
}
const fetchDeptList = () => api.get('/api/dept/all')


// 초기 로드
onMounted(async () => {
  if (!userStore.accessToken) {
    router.push('/login')
    return
  }
  try {
    const [delays, depts] = await Promise.all([
      fetchDelayList(),
      fetchDeptList()
    ])
    delayList.value = delays.data.data
    deptList.value = depts.data.data
  } catch (err) {
    console.error('자료 로딩 실패:', err)
  }
})

const toggleSort = () => {
  sortLabel.value = sortLabel.value === '오름차순' ? '내림차순' : '오름차순'
}
</script>

<style scoped>
.empty-message {
    text-align: center;
}
</style>