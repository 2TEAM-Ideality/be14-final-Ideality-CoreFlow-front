<template>
    <div class="comment-tab">
        <div class="comment-filter">
            <label># 세부일정</label>
            <select class="select_box">
                <option>Value</option>
            </select>
        </div>

        <div class="comment-list">
            <!-- 댓글 -->
            <div
                v-for="(comment, index) in comments"
                :key="comment.id"
                class="comment-item"
            >
            <div class="comment-header">
              <div class="writer-with-modify">
                <span class="comment-writer">{{ comment.deptName + '_' + comment.name }}</span>
                <span class="modify-comment" v-if="comment.isModify">(수정됨)</span>
              </div>
            </div>

                <div class="comment-box">
                  <span class="comment-content">{{ comment.content }}</span>

                <!-- 아이콘들 공통 스타일 icon 적용 -->
                <div class="comment-icons">
                  <button @click="emitSetReply(comment.commentId, comment.deptName + '_' + comment.name)">
                    <img src="@/assets/icons/message.svg" alt="message" class="icon" />
                  </button>
                  <!-- 댓글 드롭다운 열기 -->
                  <button
                    v-if="comment.userId === userStore.id"
                    @click="toggleDropdown(`comment-${comment.commentId}`)"
                    class="icon-button"
                  >
                    <img src="@/assets/icons/ellipsis-vertical.svg" alt="more" class="icon" />
                  </button>
                </div>
                
                  <!-- 댓글 드롭다운 -->
                  <div v-if="dropdownIndex === `comment-${comment.commentId}`" class="comment-dropdown">
                      <button @click="onEditComment(comment)">댓글 수정</button>
                      <button @click="openDeleteModal(comment.commentId)">댓글 삭제</button>
                      <button class="highlight" 
                      @click="updateNoticeComment(comment.commentId)">공지로 등록하기</button>
                  </div>
                </div>

                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <div class="reply-header">
                      <div class="writer-with-modify">
                        <span class="comment-writer">ㄴ {{ reply.deptName + '_' + reply.name }}</span>
                        <span class="modify-comment" v-if="reply.isModify">(수정됨)</span>
                      </div>
                    </div>

                      <div class="comment-box">
                        <span class="comment-content">{{ reply.content }}</span>
                        <div class="comment-icons">
                          <button @click="emitSetReply(comment.commentId, comment.deptName + '_' + comment.name)">
                            <img src="@/assets/icons/message.svg" alt="message" class="icon" />
                          </button>
                          <!-- 대댓글 드롭다운 열기 -->
                          <button
                            v-if="reply.userId === userStore.id"
                            @click="toggleDropdown(`reply-${reply.commentId}`)"
                            class="icon-button"
                          >
                            <img src="@/assets/icons/ellipsis-vertical.svg" alt="more" class="icon" />
                          </button>
                      </div>
                        <!-- 대댓글 드롭다운 -->
                        <!-- 대댓글에 대한 부모처리는 내일 가서 물어볼 것-->
                        <div v-if="dropdownIndex === `reply-${reply.commentId}`" class="comment-dropdown">
                          <button @click="onEditComment(reply)">댓글 수정</button>
                          <button @click="openDeleteModal(reply.commentId)">댓글 삭제</button>
                          <button class="highlight" 
                          @click="updateNoticeComment(reply.commentId)">공지로 등록하기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

  <!-- 모달 창 -->
  <template v-if="isDeleteModalOpen">
    <div class="modal-overlay">
      <div class="modal-box">
        <h2 class="modal-title">댓글 삭제</h2>
        <p class="modal-message">댓글을 정말로 삭제하시겠습니까?</p>
        <div class="modal-buttons">
          <button class="modal-cancel" @click="closeDeleteModal">취소</button>
          <button class="modal-confirm" @click="deleteComment">확인</button>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import api from '@/api';

const route = useRoute();
const userStore = useUserStore();
const isDeleteModalOpen = ref(false);
const deleteTargetId = ref(null);
const comments = ref([]);

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit-comment', 'set-reply']);

const taskId = computed(() => props.task?.taskId); // ✅ 안전하게 computed로 감싸줌

// 댓글 불러오기
const fetchComments = async (id)=> {
  try {
    const res = await api.get(`/api/comment/task/${id}`);
    comments.value = convertToTree(res.data.data);
  } catch (error) {
    const status = error.response?.status;
    const message = error.code;
    if (status === 403) {
      alert(message);
      route.push('/');
    }
  }
};

// ✅ taskId가 준비될 때만 댓글 fetch 실행
watch(
  () => taskId.value,
  (newTaskId) => {
    if (newTaskId) {
      fetchComments(newTaskId);
    }
  },
  { immediate: true }
);

// 나머지 기존 로직 그대로 유지
const convertToTree = (flatList) => { /* 생략 */ }
const toggleDropdown = (id) => { /* 생략 */ }
const handleClickOutside = (event) => { /* 생략 */ }
const openDeleteModal = (id) => { /* 생략 */ }
const closeDeleteModal = () => { /* 생략 */ }
const deleteComment = async () => { /* 생략 */ }
const updateNoticeComment = async (id) => { /* 생략 */ }

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

const onEditComment = (comment) => {
  emit('edit-comment', {
    id: comment.commentId,
    content: comment.content,
    isNotice: false
  });
};

const emitSetReply = (commentId, name) => {
  emit('set-reply', commentId, name);
};
</script>

<style scoped>
.comment-tab {
  height: 100%;
  max-height: calc(100vh - 100px); /* 필요시 적절히 조절 */
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-left: 40px;
  padding-right: 12px;
  overflow: hidden; /* 중요: 내부 스크롤을 위해 */
}

.comment-filter {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.select_box {
  width: 100%;
  max-width: 300px;
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid #818181;
  border-radius: 6px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url('@/assets/icons/chevron-down.svg');
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
}

.comment-list {
  min-height: 400px;         /* 댓글이 없어도 공간 확보 */
  max-height: 400px;         /* 댓글이 많을 경우 최대 높이까지만 */
  overflow-y: auto;          /* 스크롤 가능하게 */
  padding-right: 12px;
}

.comment-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  min-height: fit-content;
  margin-top: 16px;
}

.comment-box {
  position: relative;
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #aaa;
  border-radius: 8px;
  overflow: visible;
  box-sizing: border-box;
}

.comment-content {
  display: block;
  padding-right: 60px;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 13px;
}

.comment-icons {
  position: absolute;
  top: 0;        /* 🔥 꼭대기에 붙임 */
  right: 0;      /* 🔥 오른쪽 끝 */
  display: flex;
  gap: 4px;
  align-items: flex-start; /* 🔥 수직 기준 꼭대기 */
  padding: 8px;   /* 아이콘 간 여백 확보 */
  z-index: 2;
}

.icon {
  width: 12px;
  height: 12px;
  display: block;            /* inline-block 말고 완전 block */
  object-fit: contain;
  cursor: pointer;
}

/* 아이콘 버튼 기본화 */
.icon-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.comment-dropdown {
  position: absolute;
  top: 28px; /* 아이콘 기준 아래로 */
  right: 0;
  width: 160px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.comment-dropdown button {
  background: none;
  border: none;
  font-size: 13px;
  text-align: left;
  padding: 4px 6px;
  cursor: pointer;
  color: #333;
}

.comment-dropdown .highlight {
  color: #d92d20;
  font-weight: bold;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-writer {
  font-size: 13px;
}

/* 대댓글 */
.reply-item {
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
  min-height: fit-content;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reply-prefix {
  font-size: 16px;
  color: #999;
}

/* ✅ 반응형 */
@media (max-width: 768px) {
  .comment-tab {
    padding-left: 16px;
    padding-right: 16px;
  }

  .comment-box {
    padding: 12px;
  }

  .comment-content {
    padding-right: 48px;
  }

  .comment-dropdown {
    right: auto;
    left: 0;
  }

  .comment-icons {
    top: 10px;
    right: 10px;
  }

  .reply-item {
    padding-left: 16px;
  }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 7000;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  width: 360px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #111;
}

.modal-message {
  font-size: 15px;
  color: #4a4a4a;
  margin-bottom: 24px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-cancel {
  background: none;
  border: none;
  font-size: 14px;
  color: #00cfc1; 
  cursor: pointer;
}

.modal-confirm {
  background-color: #00cfc1;
  color: white;
  border: none;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.modify-comment {
  font-size: 13px;
  color: #888;
}

.writer-with-modify {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
