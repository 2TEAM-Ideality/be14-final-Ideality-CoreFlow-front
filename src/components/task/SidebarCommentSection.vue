<template>
  <div class="task-sidebar">
    <!-- 상단 탭 메뉴 (고정) -->
    <!-- <div class="comment-tab-menu">
      <button
        v-for="tab in commentTabs"
        :key="tab.name"
        :class="{ active: selectedTab === tab.name }"
        @click="selectedTab = tab.name"
      >
        {{ tab.label }}
      </button>
    </div> -->
    <v-tabs v-model="selectedTab" color="black" align-tabs="start" class="comment-tab-menu">
      <v-tab
        v-for="tab in commentTabs"
        :key="tab.name"
        :value="tab.name"
        style="width: 50px;"
      >
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <!-- 중간: 탭 내용 영역 (스크롤 가능) -->
    <div class="comment-panel">
      <CommentTab
        v-if="selectedTab === 'comment'"
        :task="props.task"
        :key="`comment-${refreshKey}`"
        @edit-comment="handleEditComment"
        @set-reply="handleSetReply"
        @comment-updated="refreshKey++"
      />
        <!-- :taskId="taskId" -->

      <NoticeTab
        v-if="selectedTab === 'notice'"
        :key="`notice-${refreshKey}`"
        @edit-comment="handleEditComment"
        @set-reply="handleSetReply"
        @comment-updated="refreshKey++"
      />
    </div>

    <!-- 하단: 댓글 입력창 (고정) -->
    <div class="comment-input">
        <!-- :taskId="taskId" -->

      <TaskCommentInput
        :projectId="task.projectId"
        :replyTargetId="replyTargetId"
        :replyTargetUser="replyTargetUser"
        :editData="editData"
        @reset-reply="resetReply"
        @comment-updated="refreshKey++"
      />
    </div>
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

const editData = ref(null)
const replyTargetId = ref(null)
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
  height: 100%;           
  min-height: 0;          
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.comment-tab-menu button.active {
  font-weight: bold;
  color: #000;
  border-color: #000;
}

/* 중간 패널: 스크롤 가능 */
.comment-panel {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  min-height: 0;   
  flex-direction: column;
  gap: 12px;
}

/* 입력창 하단 고정 */
.comment-input {
  flex-shrink: 0;
  background-color: rgb(255, 255, 255);
}
/* 스크롤바 숨기기 */
.comment-panel::-webkit-scrollbar {
  display: none;
}
.comment-panel {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
