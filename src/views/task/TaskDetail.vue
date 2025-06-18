<template>
    <TaskLayout>
        <!-- 📌 메인 -->
        <template #main>
        <TaskHeaderSection :taskId="taskId" />
       <TaskMainTab :taskId="taskId" @openModal="openModal" />
        </template>

        <!-- 📌 사이드바 -->
        <template #sidebar>
        <SidebarCommentSection :taskId="taskId" />
        </template>

        <!-- 세부일정 생성 모달 -->
    <DetailCreateModal v-show="showModal" @close="showModal = false" />
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
const showModal = ref(false);

const openModal = () => {
  showModal.value = true;
  setTimeout(() => {
    console.log("모달 열림: ", showModal.value);
  }, 2000);
};


</script>
