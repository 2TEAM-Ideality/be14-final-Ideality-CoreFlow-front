<template>
    <div class="task-layout">
        <!-- 좌측 콘텐츠 -->
        <div class="main-content">
            <router-view />
        </div>

        <!-- 우측 댓글/공지 -->
        <div class="sidebar">
            <CommentTab :taskId="taskId" />
            <TaskCommentInput :taskId="taskId" />
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import TaskInfoTab from '@/components/task/TaskInfoTab.vue'
import CommentTab from '@/components/task/CommentTab.vue'
import TaskCommentInput from '@/components/task/TaskCommentInput.vue'

const route = useRoute()
const taskId = route.params.taskId
</script>