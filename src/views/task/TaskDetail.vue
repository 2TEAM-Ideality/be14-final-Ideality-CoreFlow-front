<template>
    <TaskLayout>
        <!-- 📌 메인 -->
        <template #main>
        <TaskHeaderSection :taskId="taskId" />
       <TaskMainTab :taskId="taskId" @openModal="showModal = true" />
        </template>

        <!-- 📌 사이드바 -->
        <template #sidebar>
        <SidebarCommentSection :taskId="taskId" />
        </template>

        <!-- 세부일정 생성 모달 -->
    <DetailCreateModal v-if="showModal" @close="showModal = false" />
    </TaskLayout>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'

import TaskLayout from '@/components/layout/TaskLayout.vue'
import TaskHeaderSection from '@/components/task/TaskHeaderSection.vue'
import TaskMainTab from '@/components/task/TaskMainTab.vue'
import SidebarCommentSection from '@/components/task/SidebarCommentSection.vue'
import DetailCreateModal from '@/components/details/DetailCreateModal.vue'; // 모달 컴포넌트 import

const route = useRoute()
const taskId = route.params.taskId

// showModal 상태를 상위 부모에서 관리
const showModal = ref(false)  // 모달 열기/닫기 상태
// openModal 메서드로 showModal을 true로 설정

// showModal 값이 true로 설정되었을 때 모달이 조건부로 렌더링되도록 확인
console.log('showModal:', showModal.value);  // showModal 값 확인
</script>
