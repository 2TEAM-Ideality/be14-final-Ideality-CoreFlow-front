<template>
    <div class="task-header">
        <!-- <p class="breadcrumb">프로젝트 > {{ task.projectName }} > TASK {{ task.taskId }} : {{ task.taskName }}</p> -->

        <div class="task-header-box">
        <h1 class="task-title">
            <TaskButton 
            :task="props.task"
            :status="props.task.status"
            :id="props.task.taskId" 
            @menuAction="handleMenuAction"
            :detailList="props.detailList"
            />
            {{ task.taskName }}
            <span :class="['status-badge', statusClass]">
                {{ statusText }}
            </span>
        </h1>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TaskButton from '@/components/project/TaskButton.vue'
import { useTaskStore } from '@/stores/taskStore'
import api from '@/api.js'
// import { useDialog } from 'vuetify' // 또는 커스텀 모달 핸들링 방법

const taskStore = useTaskStore()

const route = useRoute()


const props = defineProps({
    task: {
        type: Object,
        required: true
    },
    detailList : {
        type: Array
    }
})

console.log(props.task)

// 상태 변경 요청에 따른 처리 
async function handleMenuAction({ id, action }) {
  console.log("✅ TaskButton에서 받은 액션:", id, action)

  switch (action) {
    case '태스크 시작 확정':
        try {
            const res = await api.patch(`/api/task/progress/${id}`);
            if (res.status === 200) {
            console.log('✅ 태스크 시작 요청 완료', res.data.data);
            // 해당 태스크 상태 로컬에서도 반영
            const task = props.task;
            if (task.taskId === id) {
                task.status = 'PROGRESS';
            }
            } else {
            console.warn('❌ 태스크 시작 실패:', res.status);
            }
        } catch (err) {
            console.error('❌ 태스크 시작 중 에러:', err);
        }
        break;
    case '태스크 완료 확정':
        try {
            console.log('✅ 태스크 정보 확인', props.task)
            if(props.task.progressRate !== 100.0){
                alert("세부일정이 완료되지 않았습니다.")
            }
            const res = await api.patch(`/api/task/complete/${id}`);
            if (res.status === 200) {
            console.log('✅ 태스크 완료 요청 완료', res.data.data);
            // 해당 태스크 상태 로컬에서도 반영
            const task = props.task;
            if (task.taskId === id) {
                task.status = 'COMPLETED';
            }
            } else {
            console.warn('❌ 태스크 시작 실패:', res.status);
            }
        } catch (err) {
            console.error('❌ 태스크 시작 중 에러:', err);
        }
        break;
    case '태스크 중단 확정':
    //   taskStore.completeTask(taskId) // 또는 중단용 API로 교체
      break

    case '삭제 확정':
    //   deleteTask(taskId)
      break

    case '상세 보기':
    //   openDetailModal(taskId)
      break

    // 선택 전 단계에선 단순 로그만 찍고 모달 열기만 처리해도 됨
    case '태스크 시작':
    case '태스크 중단':
    case '삭제':
      console.log('⚠️ 선택만 된 상태:', action)
      break

    default:
      console.warn('⚠️ 알 수 없는 액션:', action)
  }
}

const statusTextMap = {
    PENDING: '시작전',
    PROGRESS: '진행중',
    COMPLETED: '완료'
}

const statusClassMap = {
    PENDING: 'badge-pending',
    PROGRESS: 'badge-progress',
    COMPLETED: 'badge-complete'
}

const statusText = computed(() => statusTextMap[props.task.status] || '알 수 없음')
const statusClass = computed(() => statusClassMap[props.task.status] || '')

// 아이콘
</script>

<style scoped>
.task-header {
display: flex;
flex-direction: column;
gap: 24px;
margin-bottom: 30px;
}

.breadcrumb {
color: #999;
margin-bottom: 0;
font-size: 12px;
}

.task-header-box {
display: flex;
flex-direction: column;
align-items: flex-start;
gap: 4px;
}

.status-badge {
  display: inline-block; 
  font-size: 13px;
  padding: 3px ;
  border-radius: 15px;
  min-width: 60px;
  text-align: center;
  margin-left: 10px;
}

.task-title {
    display: flex;
    flex-direction: row;
    gap: 5px;
    font-size: 22px;
    font-weight: 700;
    margin: 0;
    align-items: center;
}

/* 상태별 스타일 */
.badge-pending {
background-color: #f1f1f1;
color: #666;
}

.badge-progress {
background-color: #EBF2FF;
color: #307CFF;
}

.badge-complete {
background-color: #DFFFE2;
color: #28a745;
}
</style>
