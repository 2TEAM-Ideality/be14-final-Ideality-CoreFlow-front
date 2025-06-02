<template>
    <BreadCrumb :items="[
    { text: '프로젝트', to: '/' },
    { text: '프로젝트이름', to: '/project/:id' },
    // { text: '템플릿 편집' }  // 마지막 항목은 링크 없음
    ]" />
    <ProjectLayout>
        <div>여기에 프로젝트 상세 내용 삽입</div>
    </ProjectLayout>
</template>

<script setup>
import BreadCrumb from '@/components/common/BreadCrumb.vue';
import ProjectLayout from '@/components/layout/ProjectLayout.vue'
</script>