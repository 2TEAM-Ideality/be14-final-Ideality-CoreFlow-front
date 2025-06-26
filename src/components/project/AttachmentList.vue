<template>
    <div v-if="fileItems.length === 0" class="empty-message">
        <!-- 📄 해당 프로젝트에 대한 산출물이 없습니다. -->
         <EmptyState
          icon="mdi-file-document-outline"
          message="📄 해당 프로젝트에 대한 산출물이 없습니다."
          subMessage="작성하려면 아래 버튼을 클릭하세요."
          buttonText="산출물 업로드"
          buttonLink="/approval"
        />
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
import EmptyState from '@/components/common/EmptyState.vue'
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

const attachmentList = ref([])
const deptList = ref([])

//  검색
const searchQuery = ref('')
const sortLabel = ref('오름차순')
const selectedDept = ref('부서 전체')
const placeholderMsg = ref("자료 이름 검색")

const customHeaders = [
  { title: '파일명', key: 'name' },
  { title: '관련 태스크', key: 'taskName' },
  { title: '파일 유형', key: 'type' },
  { title: '등록자', key: 'author' },
  { title: '등록일', key: 'date' },
  { title: '파일', key: 'link' }
]

const fileItems = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  const deptFilter = selectedDept.value;
  
  let filtered = attachmentList.value.filter(att => {
    return (
      att.originName?.toLowerCase().includes(keyword) ||
      att.taskName?.toLowerCase().includes(keyword) ||
      att.uploader?.toLowerCase().includes(keyword)
    )
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
    task: att.taskName,
    type: att.fileType,
    author: att.uploader,
    date: att.uploadAt?.split('T')[0],
    link: att.url,
    selected: false
  }))
})


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
    console.log("✅ 자료 목록 확인", attachmentList.value)
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
*{
    text-align: left;
}
.list-container {
    display:flex;
    flex-direction: column;
    gap: 20px;
}
</style>