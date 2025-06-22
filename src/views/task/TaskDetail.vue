<template>
    <TaskLayout>
        <template #main>
        <!-- selectTask.id가 있는 경우에만 렌더링 -->
            <!-- taskId 기준으로 렌더링 -->
             <div class="task-main">
                <TaskHeaderSection 
                v-if="originTaskValue.selectTask?.taskId" 
                :task="originTaskValue.selectTask" 
                />

                <TaskMainTab 
                v-if="originTaskValue.selectTask?.taskId" 
                :taskData="originTaskValue" 
                :detailList = "detailList"
                />
             </div>
        </template>

        <template #sidebar>
            <SidebarCommentSection :taskId="taskId" />
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
import api from '@/api.js'

const userStore = useUserStore();
const route = useRoute()
const taskId = route.params.taskId
const originTaskValue = ref({
    selectTask: {},
    deptNames: [],
    prevTasks: [],
    nextTasks: []
})

const detailList = ref([]);


const fetchTask = async (id) => {
    try {
        const res = await axios.get(`http://localhost:5000/api/task/detail/${id}`, {
        headers: {
            Authorization: `Bearer ${userStore.accessToken}`
        }
        })
        originTaskValue.value = res.data.data
        console.log(originTaskValue.value);
    } catch (error) {
        if (error.response?.status === 403) {
        alert(error.response.data.message || '권한이 없습니다.')
        // 예: router.push('/project/list')
        }
    }
}

const fetchDetailList = async (parentTaskId) => {
  try {
    const res = await api.get('/api/work/detailList', {
      params: {
        parentTaskId
      }
    });
    console.log('상세 태스크 목록:', res.data.data);
    detailList.value = res.data.data;
  } catch (error) {
    console.error('상세 태스크 조회 실패:', error);
    return [];
  }
};


onMounted(async () => {
    await fetchTask(taskId);
    await fetchDetailList(taskId);
})
</script>


<style scoped>
.task-main{
    padding: 2% 5% 5% 7%;
}


</style>
