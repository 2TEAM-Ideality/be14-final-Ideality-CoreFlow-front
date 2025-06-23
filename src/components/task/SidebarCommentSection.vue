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
        <!-- comment / notice / input 에 모두 task 객체 전달 -->
        <CommentTab
          v-if="selectedTab === 'comment'"
          :key="`comment-${refreshKey}`"
          :task="task"
          @edit-comment="handleEditComment"
          @set-reply="handleSetReply"
          @comment-updated="refreshKey++" 
        />

        <NoticeTab
          v-if="selectedTab === 'notice'"
          :key="`notice-${refreshKey}`" 
          :task="task"
          @edit-comment="handleEditComment"
          @set-reply="handleSetReply"
          @comment-updated="refreshKey++"
        />
        </div>

        <TaskCommentInput
          :task="task"
          :replyTargetId="replyTargetId"
          :replyTargetUser="replyTargetUser"
          :editData="editData"
          @reset-reply="resetReply"
          @comment-updated="refreshKey++"
        />

    </div>
</template>

<script setup>
import { ref } from 'vue'
import CommentTab from './CommentTab.vue'
import NoticeTab from './NoticeTab.vue'
import TaskCommentInput from './TaskCommentInput.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

// 예시: task.taskId, task.projectId 등에서 꺼내서 사용 가능

const editData = ref(null);
const replyTargetId = ref(null);
const replyTargetUser = ref('')
const refreshKey = ref(0)

const resetReply = () => {
  replyTargetId.value = null
  replyTargetUser.value = ''
}

const handleEditComment = (data) => {
  editData.value = data
}

const handleSetReply = (commentId, userName) => {
  replyTargetId.value = commentId
  replyTargetUser.value = userName
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