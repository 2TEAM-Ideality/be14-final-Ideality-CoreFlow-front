<template>
    <div v-if="fileItems.length === 0" class="empty-message">
        📄 해당 프로젝트에 대한 산출물이 없습니다.
    </div>
    <div v-else>
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

const userStore = useUserStore()
const router = useRouter()

const attachmentList = ref([])
const deptList = ref([])
const searchQuery = ref('')
const sortLabel = ref('오름차순')
const selectedDept = ref('부서 전체')
const placeholderMsg = ref("자료 이름 검색")

const customHeaders = [
  { title: '파일명', key: 'name' },
  { title: '관련 태스크', key: 'task' },
  { title: '파일 유형', key: 'type' },
  { title: '등록자', key: 'author' },
  { title: '등록일', key: 'date' },
  { title: '링크', key: 'link' }
]

const fileItems = computed(() =>
  attachmentList.value.map(att => ({
    name: att.originName,
    task: att.taskName,
    type: att.fileType,
    author: att.uploader,
    date: att.uploadAt?.split('T')[0],
    link: att.url,
    selected: false
  }))
)

// 데이터 요청
const fetchAttachments = () => api.get(`/api/project/${projectId}/attachment/list`)
const fetchDeptList = () => api.get('/api/dept/all')

// 초기 로드
onMounted(async () => {
  if (!userStore.accessToken) {
    router.push('/login')
    return
  }
  try {
    const [attachments, depts] = await Promise.all([
      fetchAttachments(),
      fetchDeptList()
    ])
    attachmentList.value = attachments.data.data
    deptList.value = depts.data.data
  } catch (err) {
    console.error('자료 로딩 실패:', err)
  }
})
</script>


