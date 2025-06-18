<!-- 예: FileListView.vue -->
<template>
<ListForm :headers="customHeaders" :items="fileItems" />
</template>

<script setup>
import ListForm from '@/components/common/ListForm.vue'

// 테이블 헤더로 넣을 값
const customHeaders = [
{ title: '파일명', key: 'name' },
{ title: '관련 태스크', key: 'task' },
{ title: '파일 유형', key: 'type' },
{ title: '등록자', key: 'author' },
{ title: '등록일', key: 'date' },
{ title: '링크', key: 'link' } // 다운로드 아이콘 표시 용도
]

// 내용 리스트
const fileItems = [
{
    name: '제품기획서.pdf',
    task: '제품 기획 회의',
    type: 'PDF',
    author: '기획팀 김하늘',
    date: '2025-05-01',
    link: 'https://example.com/file1.pdf',
    selected: false
},
{
    name: '원단스펙시트.xlsx',
    task: '원단 스펙 확정',
    type: 'XLSX',
    author: '소재팀 이지수',
    date: '2025-05-02',
    selected: false
}
]
</script>