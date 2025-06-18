<template>
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
            <CommentTab
            v-if="selectedTab === 'comment'"
            :taskId="taskId"
            @edit-comment="handleEditComment"
            @set-reply="handleSetReply"
            />

            <NoticeTab
            v-if="selectedTab === 'notice'"
            :taskId="taskId"
            @edit-comment="handleEditComment"
            @set-reply="handleSetReply"
            />
        </div>

        <TaskCommentInput
        :taskId="taskId"
        :replyTargetId="replyTargetId"
        :editData="editData"
        @reset-reply="replyTargetId = null"
        />

    </div>
</template>

<script setup>
import { ref } from 'vue'
import CommentTab from './CommentTab.vue'
import NoticeTab from './NoticeTab.vue'
import TaskCommentInput from './TaskCommentInput.vue'

const props = defineProps({
  taskId: {
    type: [Number, String],
    required: true
  }
})

const editData = ref(null);
const replyTargetId = ref(null);

const handleEditComment = (data) => {
  editData.value = data
}

const handleSetReply = (parentId) => {
  replyTargetId.value = parentId
}

const selectedTab = ref('comment')

const commentTabs = [
  { name: 'comment', label: '댓글' },
  { name: 'notice', label: '공지' }
]
</script>

<style scoped>
.task-sidebar {
display: flex;
flex-direction: column;
gap: 32px;
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
</style>