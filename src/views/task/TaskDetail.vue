<template>
<BasicLayout>
<!-- 📌 좌측 메인 콘텐츠 슬롯 -->
<template #main>
    <div class="task-main">
    <p class="breadcrumb">프로젝트 > 25ss 퍼셜 자켓 > TASK {{ taskId }} : 봉제 공정</p>

    <div class="task-header-box">
        <span class="status-badge">진행중</span>
        <h1 class="task-title">TASK {{ taskId }} : 봉제 공정</h1>
    </div>

    <div class="tab-row">
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
    </div>

    <router-view />
    </div>
</template>

<!-- 📌 우측 사이드바 슬롯 -->
<template #sidebar>
    <div class="task-sidebar">
    <div class="comment-tab-menu">
        <button
        v-for="tab in commentTabs"
        :key="tab.name"
        :class="{ active: selectedTab === tab.name }"
        @click="selectedTab = tab.name"
        >
        {{ tab.label }}
        </button>
    </div>

    <div class="comment-panel">
        <CommentTab v-if="selectedTab === 'comment'" :taskId="taskId" />
        <NoticeTab v-if="selectedTab === 'notice'" :taskId="taskId" />
    </div>

    <hr class="comment-divider" />
    <TaskCommentInput :taskId="taskId" />
    </div>
</template>
</BasicLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import BasicLayout from '@/components/layout/BasicLayout.vue'
import CommentTab from '@/components/task/CommentTab.vue'
import NoticeTab from '@/components/task/NoticeTab.vue'
import TaskCommentInput from '@/components/task/TaskCommentInput.vue'

const route = useRoute()
const taskId = route.params.taskId

const tabs = [
{ name: 'TaskInfo', label: '태스크 정보', route: `/task/${taskId}` },
{ name: 'TaskDetails', label: '세부 일정', route: `/task/${taskId}/detail` },
{ name: 'TaskAttachment', label: '자료 검색', route: `/task/${taskId}/attachments` },
{ name: 'TaskApproval', label: '결재 내역', route: `/task/${taskId}/approval` }
]

const selectedTab = ref('comment')

const commentTabs = [
{ name: 'comment', label: '댓글' },
{ name: 'notice', label: '공지' }
]
</script>

<style scoped>
    .breadcrumb {
    color: #999;
    margin-bottom: 0;
    font-size: 12px;
    }

    .task-main {
    display: flex;
    flex-direction: column;
    gap: 24px;
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

    .tab-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    }

    .tab-menu {
    display: flex;
    gap: 24px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0px;
    }

    .tab-button {
    font-size: 15px;
    color: #444;
    text-decoration: none;
    padding-bottom: 4px;
    border-bottom: 2px solid transparent;
    transition: 0.2s;
    }

    .tab-button.active {
    font-weight: bold;
    color: #000;
    border-color: #000;
    }

    .schedule-button {
    background-color: #00cfc1;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 6px 40px;
    font-size: 14px;
    cursor: pointer;
    }

    .task-sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    }

    .comment-tab-menu {
    display: flex;
    gap: 50px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0px;
    }

    .comment-tab-menu button {
    background: none;
    border: none;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    padding-bottom: 4px;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    }

    .comment-tab-menu button.active {
    font-weight: bold;
    color: #000;
    border-color: #000;
    }

    .comment-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    }

    .comment-divider {
    border: none;
    height: 1px;
    background-color: #eee;
    margin: 8px 0;
    }
</style>
