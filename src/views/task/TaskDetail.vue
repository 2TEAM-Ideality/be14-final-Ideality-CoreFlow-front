<template>
    

    <TaskLayout>
        <template #main>
          <!-- 상단 Breadcrumb -->
          <BreadCrumb :items="[
            { text: '프로젝트', to: '/project/list' },
            { text: targetProjectName, to: `/project/${targetProjectId}` },
            { text: taskName, to:`/task/${taskId}`}
          ]" />
            <!-- selectTask.id가 있는 경우에만 렌더링 -->
            <!-- taskId 기준으로 렌더링 -->
            <div class="task-main">
                <TaskHeaderSection 
                v-if="originTaskValue.selectTask?.taskId" 
                :task="originTaskValue.selectTask" 
                :detailList = "detailList"
                />

                <TaskMainTab 
                v-if="originTaskValue.selectTask?.taskId" 
                :taskData="originTaskValue" 
                :detailList = "detailList"
                />

                <DetailTab v-show="false" :taskData="originTaskValue" />
            </div>
        </template>

        <template #sidebar>
            <SidebarCommentSection 
              :task="originTaskValue.selectTask"
            />
        </template>
    </TaskLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BreadCrumb from '@/components/common/BreadCrumb.vue'
import TaskLayout from '@/components/layout/TaskLayout.vue';
import TaskHeaderSection from '@/components/task/TaskHeaderSection.vue';
import TaskMainTab from '@/components/task/TaskMainTab.vue';
import SidebarCommentSection from '@/components/task/SidebarCommentSection.vue';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import api from '@/api.js'

const userStore = useUserStore();
const route = useRoute()
const targetProjectId = ref(null)
const targetProjectName = ref('')

const taskName = ref('')
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
      // 테스크 정보 가져오기
        const res = await api.get(`/api/task/detail/${id}`);
        originTaskValue.value = res.data.data
        taskName.value = originTaskValue.value.selectTask.taskName

        console.log("📁 테스크 정보 조회 성공", originTaskValue.value, taskName.value);

        targetProjectId.value = originTaskValue.value.selectTask.projectId
        targetProjectName.value = originTaskValue.value.selectTask.projectName
        console.log("📁해당 태스크의 대상 프로젝트는: ", targetProjectId.value, targetProjectName.value)

    } catch (error) {
        if (error.response?.status === 403) {
        alert(error.response.data.message || '권한이 없습니다.')
        // 예: router.push('/project/list')
        }
    }
}

const fetchDetailList = async (parentTaskId) => {
  try {
    const res = await api.get(`/api/work/detailList?parentTaskId=${parentTaskId}`);
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
    padding: 7% 5% 5% 7%;
}


</style>