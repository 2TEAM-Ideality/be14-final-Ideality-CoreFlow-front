<template>
    <TaskLayout>
        <!-- 📌 메인 -->
        <template #main>
        <TaskHeaderSection :taskId="taskId" />
        <TaskMainTab :taskId="taskId" />
        </template>

        <!-- 📌 사이드바 -->
        <template #sidebar>
        <SidebarCommentSection :taskId="taskId" />
        </template>
    </TaskLayout>
</template>

<script setup>
import { useRoute } from 'vue-router'

import TaskLayout from '@/components/layout/TaskLayout.vue'
import TaskHeaderSection from '@/components/task/TaskHeaderSection.vue'
import TaskMainTab from '@/components/task/TaskMainTab.vue'
import SidebarCommentSection from '@/components/task/SidebarCommentSection.vue'

const route = useRoute()
const taskId = route.params.taskId
</script>
