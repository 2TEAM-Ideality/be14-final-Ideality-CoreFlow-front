<template>
<div class="task-layout">
    <div class="layout-body">
    <!-- 좌측 7 -->
    <div class="main-content">
        <h1 class="page-title">TASK {{ taskId }} : 봉제 공정</h1>

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

        <router-view />
    </div>

    <!-- 우측 3 -->
    <div class="sidebar">
        <CommentTab :taskId="taskId" />
        <TaskCommentInput :taskId="taskId" />
    </div>
    </div>
</div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import CommentTab from '@/components/task/CommentTab.vue'
import TaskCommentInput from '@/components/task/TaskCommentInput.vue'

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
.task-layout {
  padding: 40px 200px;
}

.layout-body {
  display: grid;
  grid-template-columns: 7fr 3fr; /* ← 7:3 구조 */
  gap: 40px;
  position: relative;
  min-height: 600px;
}

/* 가운데 세로 구분선 */
.layout-body::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 70%;
  width: 1px;
  background-color: rgba(0, 0, 0, 0.1);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-left: 32px;
}

.tab-menu {
  display: inline-block;
  gap: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ddd; /* ✅ 전체 탭 바 밑줄 */
}

.tab-button {
  display: inline-block;
  padding-bottom: 4px;
  font-size: 15px;
  color: #444;
  text-decoration: none;
  cursor: pointer;
}

.tab-button.active {
  font-weight: bold;
  color: #000;
  border-bottom: 2px solid #000;
}
</style>