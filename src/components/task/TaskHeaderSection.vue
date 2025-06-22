<template>
    <div class="task-header">
        <p class="breadcrumb">프로젝트 > {{ task.projectName }} > TASK {{ task.taskId }} : {{ task.taskName }}</p>

        <div class="task-header-box">
            <span :class="['status-badge', statusClass]">
                {{ statusText }}
            </span>
        <h1 class="task-title">
            <v-icon :color="statusMeta.color" size="32" class="mr-1">{{ statusMeta.icon }}</v-icon>
            TASK {{ task.taskId }} : {{ task.taskName }}
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

const statusTextMap = {
    PENDING: '시작전',
    PROGRESS: '진행중',
    COMPLETE: '완료'
}

const statusClassMap = {
    PENDING: 'badge-pending',
    PROGRESS: 'badge-progress',
    COMPLETE: 'badge-complete'
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
font-size: 13px;
padding: 6px 10px;
border-radius: 6px;
line-height: 1;
margin-left: 40px;
}

.task-title {
font-size: 22px;
font-weight: 700;
margin: 0;
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
