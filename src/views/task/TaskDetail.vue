<template>
    <TaskLayout>
        <template #main>
        <!-- selectTask.id가 있는 경우에만 렌더링 -->
            <!-- taskId 기준으로 렌더링 -->
            <TaskHeaderSection 
            v-if="originTaskValue.selectTask?.taskId" 
            :task="originTaskValue.selectTask" 
            />

            <TaskMainTab 
            v-if="originTaskValue.selectTask?.taskId" 
            :taskData="originTaskValue" 
            />
        </template>

        <template #sidebar>
            <SidebarCommentSection :task="originTaskValue.selectTask" />
        </template>
    </TaskLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import TaskLayout from '@/components/layout/TaskLayout.vue';
import TaskHeaderSection from '@/components/task/TaskHeaderSection.vue';
import TaskMainTab from '@/components/task/TaskMainTab.vue';
import SidebarCommentSection from '@/components/task/SidebarCommentSection.vue';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import api from '@/api';

const route = useRoute()
const taskId = route.params.taskId
const originTaskValue = ref({
    selectTask: {},
    deptNames: [],
    prevTasks: [],
    nextTasks: []
})

const userStore = useUserStore();

const fetchTask = async (id) => {
    try {
        const res = await api.get(`/task/detail/${id}`);
        originTaskValue.value = res.data.data
        console.log(originTaskValue.value);
    } catch (error) {
        if (error.response?.status === 403) {
        alert(error.response.data.message || '권한이 없습니다.')
        // 예: router.push('/project/list')
        }
    }
}

onMounted(async () => {
    await fetchTask(taskId);
})
</script>
