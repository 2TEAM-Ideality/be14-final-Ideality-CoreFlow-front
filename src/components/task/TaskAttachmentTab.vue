<!-- 예: FileListView.vue -->
<template>
    <div class="attachment-box">
        <SearchBar
            v-model:query="searchKeyword"
            :filterLabel="selectedTypeLabel"
            :sortLabel="sortLabel"
            :deptList="fileTypeList"
            placeholder="파일명을 입력하세요"
            @filter-click="handleTypeFilter"
            @sort-click="handleSort"
        />
        <div class="list-box">
            <ListForm :headers="customHeaders" :items="fileItems" />
        </div>
    </div>
</template>

<script setup>
import ListForm from '@/components/common/ListForm.vue'
import SearchBar from '../common/SearchBar.vue'
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import { useUpdateStore } from '@/stores/updateStore'

import api from '@/api';


const route = useRoute();
const userStore = useUserStore();
const updateStore = useUpdateStore()


// 테이블 헤더로 넣을 값
const customHeaders = [
{ title: '파일명', key: 'name' },
{ title: '파일 유형', key: 'type' },
{ title: '등록자', key: 'author' },
{ title: '등록일', key: 'date' },
{ title: '링크', key: 'link' } // 다운로드 아이콘 표시 용도
]

// mime로 저장되는 파일 타입 -> 적용
function mapFileType(mime) {
    switch (mime) {
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
        return 'DOCX'
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
        return 'XLSX'
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
        return 'PPTX'
    case 'application/pdf':
        return 'PDF'
    case 'text/plain':
        return 'TXT'
    case 'image/png':
        return 'PNG'
    case 'image/jpeg':
        return 'JPG'
    case 'application/zip':
        return 'ZIP'
    // 필요 시 더 추가 가능
    default:
        return '기타'
    }
}

// 날짜 형식 맞춰주기
function formatDate(isoDateStr) {
    const date = new Date(isoDateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}`
}

const taskId = ref(route.params.taskId);
// 실제 화면에 보일 것
const fileItems = ref([]);

// api에서 보여질 것 
const originItems = ref([]);

const fetchAttachment = async () => {
    try {
        const res = await api.get(`/api/task/${taskId.value}/attachment/list`)

        console.log(res);
        originItems.value = res.data.data;

        // fileItems.value = originItems.value.map(item => ({
        //     name: item.originName,
        //     type: mapFileType(item.fileType),
        //     author: `${item.deptName} ${item.userName}`,
        //     date: formatDate(item.uploadAt),
        //     link: item.url,
        //     attachmentId: item.attachmentId, // 화면에는 안 보여도 보관
        //     userId: item.userId
        // }))
        applyFilters();
    } catch (error) {
        console.log(error);
    }
}


// 검색 필터
// 상단 변수 세팅
const searchKeyword = ref('')
const selectedType = ref('전체') // 파일 유형 필터
const sortLabel = ref('최신순')

const fileTypeList = [
    { deptId: 1, deptName: 'PDF' },
    { deptId: 2, deptName: 'XLSX' },
    { deptId: 3, deptName: 'DOCX' },
    { deptId: 4, deptName: 'TXT' },
    { deptId: 5, deptName: 'PPTX' }
]

function handleTypeFilter(typeName) {
    selectedType.value = typeName
    applyFilters()
}

function handleSort() {
    sortLabel.value =
        sortLabel.value === '최신순' ? '오래된순' : '최신순'
    applyFilters()
}

function applyFilters() {
    let filtered = [...originItems.value]

    // 1. 검색어 필터 (파일명)
    // 1. 검색어 필터
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.normalize('NFC').toLowerCase()
        filtered = filtered.filter(item =>
            item.originName.normalize('NFC').toLowerCase().includes(keyword)
        )
    }

    // 2. 파일 유형 필터
    if (selectedType.value !== '전체') {
        filtered = filtered.filter(
            item => mapFileType(item.fileType) === selectedType.value
        )
    }

    // 3. 정렬
    if (sortLabel.value === '최신순') {
        filtered.sort((a, b) => new Date(b.uploadAt) - new Date(a.uploadAt))
    } else {
        filtered.sort((a, b) => new Date(a.uploadAt) - new Date(b.uploadAt))
    }

    // 4. 가공해서 최종 리스트
    fileItems.value = filtered.map(item => ({
    name: item.originName,
    type: mapFileType(item.fileType),
    author: `${item.deptName} ${item.userName}`,
    date: formatDate(item.uploadAt),
    link: item.url,
    attachmentId: item.attachmentId,
    userId: item.userId
    }))
}
    
watch(searchKeyword, () => {
    applyFilters()
})


watch(
  () => updateStore.shouldRefreshSearchHistory,
  (val) => {
    if (val) {
      fetchAttachment()             // 실제 다시 불러오기
      updateStore.acknowledgeSearchHistoryUpdate() // 신호 초기화
    }
  }
)


onMounted(async () => {
    await fetchAttachment();
    applyFilters();
    }
);
</script>

<style scoped>
.attachment-box {
    margin-top: 32px;
}

.list-box {
    margin-top:40px;
}
</style>