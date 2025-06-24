<template>
    <div class="task-header">
        <!-- <p class="breadcrumb">프로젝트 > {{ task.projectName }} > TASK {{ task.taskId }} : {{ task.taskName }}</p> -->

        <div class="task-header-box">
        <h1 class="task-title">
            <v-icon :color="statusMeta.color" size="32" class="mr-1">{{ statusMeta.icon }}</v-icon>
            TASK {{ task.taskId }} : {{ task.taskName }}
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
const route = useRoute()

const props = defineProps({
    task: {
        type: Object,
        required: true
    }
})

console.log(props.task)

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
const statusMeta = computed(() => {
    switch (props.task.status) {
        case 'PENDING':
            return { text: '시작전', color: 'grey', icon: 'mdi-play-circle-outline' }
        case 'PROGRESS':
            return { text: '진행중', color: 'blue', icon: 'mdi-progress-clock' }
        case 'COMPLETED':
            return { text: '완료', color: 'green', icon: 'mdi-check-circle-outline' }
        case 'DELETED':
            return { text: '삭제됨', color: 'red', icon: 'mdi-delete-outline' }
        case 'CANCELLED':
            return { text: '취소됨', color: 'orange', icon: 'mdi-cancel' }
        default:
            return { text: '기타', color: 'default', icon: 'mdi-alert-circle-outline' }
    }
})
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
