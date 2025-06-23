<template>
    <div class="comment-tab">
        <div class="comment-filter">
            <label># 세부일정</label>
            <select class="select_box">
                <option>Value</option>
            </select>
        </div>

        <div class="comment-list" ref="commentListRef">
            <!-- 댓글 -->
            <div
                v-for="(comment, index) in comments"
                :key="comment.id"
                class="comment-item"
            >
            <div class="comment-header">
              <div class="writer-with-modify">
                <img
                :src="userStore.profileImage"
                alt="프로필 이미지"
                class="profile-img"
                />
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
import { ref, watch, computed, onUpdated, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import axios from 'axios' 
import api from '@/api';

const route = useRoute();
const userStore = useUserStore();
// 댓글 삭제 구현
const isDeleteModalOpen = ref(false);
const deleteTargetId = ref(null);

const comments = ref([]);



// 코멘트 생성 시, 스크롤 맨 아래로 이동
const commentListRef = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (commentListRef.value) {
      commentListRef.value.scrollTop = commentListRef.value.scrollHeight
    }
  })
}

const fetchComments = async (id)=> {
  try {
    const res = await api.get(`/comment/task/${id}`);
    comments.value = convertToTree(res.data.data);
    nextTick(() => scrollToBottom())
    
  } catch (error) {
    const status = error.response?.status;
    const message = error.code;

    if (status === 403) {
      alert(message);
      route.push('/');
    }
  }
};

// 대댓글 부모 구조를 위한 변환
function convertToTree(flatList) {
  const map = {}
  const tree = []

  flatList.forEach(comment => {
    map[comment.commentId] = { ...comment, replies: [] }
  })

  flatList.forEach(comment => {
    const node = map[comment.commentId]
    if (comment.parentCommentId) {
      const parent = map[comment.parentCommentId]
      if (parent) parent.replies.push(node)
    } else {
      tree.push(node)
    }
  })

  return tree
}


const dropdownIndex = ref(null)

const toggleDropdown = (id) => {
dropdownIndex.value = dropdownIndex.value === id ? null : id
}

const handleClickOutside = (event) => {

  const dropdowns = document.querySelectorAll('.comment-dropdown, .icon-button')

  const clickedInside = Array.from(dropdowns).some((el) =>
    el.contains(event.target)
  )

  if (!clickedInside) {
    dropdownIndex.value = null
  }
}

// 댓글 삭제 모달 창 함수 + api 요청 만들기
const openDeleteModal = (id) => {
  console.log(id);
  deleteTargetId.value = id;   
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  deleteTargetId.value = null;
};

const deleteComment = async () => {
  try {
    await api.patch(`/comment/${deleteTargetId.value}/delete`)
    closeDeleteModal()
    fetchComments(taskId)
    emit('comment-updated')
  } catch (error) {
    const status = error.response?.status;
    const message = error.code;

    if (status === 403) {
      alert(message);
      route.push('/');
    }

    if (status === 409) {
      alert(message);
      route.push(`/task/${taskId}`);
    }

    // 400번 예외는 프로젝트 페이지 만들어지면 연결
  }
}

const updateNoticeComment = async (id) => {
  try {
    const res = await api.patch(`/comment/${id}/notice`)
    alert(res.data?.message);
    fetchComments(taskId)
    emit('comment-updated')
  } catch (error) {
    const status = error.response?.status;
    const message = error.code;
  }
};


onMounted(() => {
  window.addEventListener('click', handleClickOutside)

  if (taskId.value) {
    fetchComments(taskId.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})

onUpdated(() => {
  nextTick(() => scrollToBottom())
})
// 댓글 수정 emit
const emit = defineEmits(['edit-comment', 'set-reply']);

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const taskId = computed(() => props.task?.taskId)

const onEditComment = (comment) => {
  emit('edit-comment', {
    id: comment.commentId,
    content: comment.content,
    isNotice: false
  });
};

const emitSetReply = (commentId, name) => {
  emit('set-reply', commentId, name)
}


// key 혹은 taskId 변화를 감지해서 재조회
watch(() => props.taskId, (newId) => {
  if (newId) fetchComments(newId)
})

</script>

<style scoped>
.comment-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-left: 5%;
  padding-top: 3%;
  height: 100%;
  max-height: calc(100vh - 100px); /* 필요시 적절히 조절 */
  flex-direction: column;
  gap: 2%;
  overflow: hidden; /* 중요: 내부 스크롤을 위해 */
  /* background-color: yellowgreen; */
  /* background-color: yellow; */
  background-color: rgba(242, 242, 255, 0.73);
}

.comment-filter {
  display: flex;
  flex-direction: row;
  gap: 10px;
  /* width: 100%; */
  /* border-bottom: 1px solid black;; */
  /* flex: 0 0 auto; */
  /* background-color: #00cfc1; */
}

/* 세부일정 선택 input */
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
  flex: 1;
  overflow-y: auto;
  /* padding-right: 12px; */
  padding-right: 5%;
  padding-bottom: 15px;
}
/* comment list 스크롤 */
.comment-list::-webkit-scrollbar {
  width: 6px;
}

.comment-list::-webkit-scrollbar-track {
  background: transparent; /* 배경 없애기 */
}

.comment-list::-webkit-scrollbar-thumb {
  background-color: rgba(132, 132, 132, 0.5);  /* 흐릿한 검정 */
  border-radius: 10px;
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

.profile-img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
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
  color: rgb(60, 60, 60);
  font-weight: bold;
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
