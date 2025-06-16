<template>
    <div class="task-header">
        <p class="breadcrumb">프로젝트 > 25ss 퍼셜 자켓 > TASK {{ taskId }} : 봉제 공정</p>

        <div class="task-header-box">
        <span class="status-badge">진행중</span>
        <h1 class="task-title">TASK {{ taskId }} : 봉제 공정</h1>
        </div>

        <!-- <div class="tab-row">
        <div class="tab-menu">
            <router-link
            v-for="tab in tabs"
            :key="tab.name"
            :to="tab.route"
            class="tab-button"
            :class="{ active: $route.name === tab.name }"
            >
            {{ tab.label }}
            </router-link>
        </div>
        <button class="schedule-button">+ 세부일정 생성</button>
        </div> -->
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const taskId = route.params.taskId

const tabs = [
{ name: 'TaskInfo', label: '태스크 정보', route: `/task/${taskId}` },
{ name: 'TaskDetails', label: '세부 일정', route: `/task/${taskId}/detail` },
{ name: 'TaskAttachment', label: '자료 검색', route: `/task/${taskId}/attachments` },
{ name: 'TaskApproval', label: '결재 내역', route: `/task/${taskId}/approval` }
]
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
background-color: #EBF2FF;
color: #307CFF;
font-size: 12px;
padding: 4px 10px;
border-radius: 6px;
line-height: 1;
}

.task-title {
font-size: 22px;
font-weight: 700;
margin: 0;
}
</style>
