<template>
  <div v-if="fileItems.length === 0" class="empty-message">
      <EmptyState
          icon="mdi-file-document-outline"
          message="📄 해당 프로마젝트에 대한 산출물이 없습니다."
          subMessage="작성하려면 아래 버튼을 클릭하세요."
          buttonText="산출물 업로드"
          :buttonLink="{
            path: '/approval/create',
            query: {
                taskId: taskId,
                type: 'output'
              }
          }"
      />
  </div>
  <div v-else class="list-container">
      <SearchBar
          v-model:query="searchQuery"
          :filter-label="selectedDept || '부서 전체'"
          :sort-label="sortLabel"
          :dept-list="uniqueDeptList"
          :placeholder="placeholderMsg"
          @filter-click="handleDeptFilter"
          @sort-click="toggleSort"
      />
      <ListForm :headers="customHeaders" :items="fileItems" />
  </div>
</template>

<script setup>
import EmptyState from '@/components/common/EmptyState.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import ListForm from '@/components/common/ListForm.vue'
import api from '@/api.js'
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const projectId = route.params.id

const userStore = useUserStore()
const router = useRouter()

const attachmentList = ref([])

// 검색
const searchQuery = ref('')
const sortLabel = ref('오름차순')
const selectedDept = ref('부서 전체')
const placeholderMsg = ref("자료 이름 검색")

const customHeaders = [
{ title: '파일명', key: 'name' },
{ title: '관련 타스크', key: 'taskName' },
{ title: '단부 부서', key: 'deptName' },
{ title: '파일 유형', key: 'type' },
{ title: '등록자', key: 'author' },
{ title: '등록일', key: 'date' },
{ title: '파일', key: 'link' }
]

const uniqueDeptList = computed(() => {
const allDepts = attachmentList.value.flatMap(att => att.deptNameList || [])
return Array.from(new Set(allDepts))
})

const fileItems = computed(() => {
const keyword = searchQuery.value.trim().toLowerCase()
const deptFilter = selectedDept.value

let filtered = attachmentList.value.filter(att => {
  const matchKeyword =
    att.originName?.toLowerCase().includes(keyword) ||
    att.taskName?.toLowerCase().includes(keyword) ||
    att.uploader?.toLowerCase().includes(keyword)

  const matchDept =
    deptFilter === '부서 전체' || (att.deptNameList || []).includes(deptFilter)

  return matchKeyword && matchDept
})

// 정렬
filtered = filtered.sort((a, b) => {
  const nameA = a.originName?.toLowerCase() || ''
  const nameB = b.originName?.toLowerCase() || ''
  return sortLabel.value === '오름차순'
    ? nameA.localeCompare(nameB)
    : nameB.localeCompare(nameA)
})

// 매핑
return filtered.map(att => ({
  name: att.originName,
  taskName: att.taskName,
  deptName: (att.deptNameList || []).join(', '),
  type: att.fileType,
  author: att.uploader,
  date: att.uploadAt?.split('T')[0],
  link: `/task/${att.taskId}`,
  selected: false
}))
})

// 데이터 요청
const fetchAttachments = () => api.get(`/api/project/${projectId}/attachment/list`)

// 초기 로드
onMounted(async () => {
if (!userStore.accessToken) {
  router.push('/login')
  return
}
try {
  const attachments = await fetchAttachments()
  attachmentList.value = attachments.data.data
  console.log("✅ 자료 목록 확인", attachmentList.value)
} catch (err) {
  console.error('자료 로드 실패:', err)
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
*{
text-align: left;
}
.list-container {
display:flex;
flex-direction: column;
gap: 20px;
}
</style>
