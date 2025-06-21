<template>
  <div class="comment-tab">
    <div class="comment-filter">
      <select class="select_box" v-model="sortOrder">
        <option value="asc">오름차순</option>
        <option value="desc">내림차순</option>
      </select>
    </div>

    <div class="comment-list">
      <div
        v-for="comment in comments"
        :key="comment.commentId"
        class="comment-item"
      >
        <div class="comment-header">
          <div class="writer-with-modify">
                <span class="comment-writer">📌 {{ comment.deptName + '_' + comment.name }}</span>
                <span class="modify-comment" v-if="comment.isModify">(수정됨)</span>
              </div>
        </div>

        <div class="comment-box">
          <span class="comment-content">{{ comment.content }}</span>

          <div class="comment-icons">
            <button
              v-if="comment.userId === userStore.id"
              @click="toggleDropdown(`comment-${comment.commentId}`)"
              class="icon-button"
            >
              <img src="@/assets/icons/ellipsis-horizontal.svg" alt="more" class="icon" />
            </button>
          </div>

          <div v-if="dropdownIndex === `comment-${comment.commentId}`" class="comment-dropdown">
            <button @click="onEditComment(comment)">공지 수정</button>
            <button @click="openDeleteModal(comment.commentId)">공지 삭제</button>
          </div>
        </div>
      </div>
    </div>

    <template v-if="isDeleteModalOpen">
      <div class="modal-overlay">
        <div class="modal-box">
          <h2 class="modal-title">공지 삭제</h2>
          <p class="modal-message">공지를 정말로 삭제하시겠습니까?</p>
          <div class="modal-buttons">
            <button class="modal-cancel" @click="closeDeleteModal">취소</button>
            <button class="modal-confirm" @click="deleteComment">확인</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import axios from 'axios'

const route = useRoute();
const userStore = useUserStore();
const taskId = ref(route.params.taskId);

const isDeleteModalOpen = ref(false);
const deleteTargetId = ref(null);
const dropdownIndex = ref(null);
const sortOrder = ref('asc');
const comments = ref([]);

// 댓글 fetch + 정렬 적용
const fetchComments = async (id) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/comment/task/${id}/notice`, {
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    });
    comments.value = convertToTree(res.data.data);
    sortComments();
  } catch (error) {
    if (error.response?.status === 403) {
      alert(error.code);
      route.push('/');
    }
  }
};

function convertToTree(flatList) {
  const map = {};
  const tree = [];
  flatList.forEach(comment => {
    map[comment.commentId] = { ...comment, replies: [] };
  });
  flatList.forEach(comment => {
    const node = map[comment.commentId];
    if (comment.parentCommentId) {
      const parent = map[comment.parentCommentId];
      if (parent) parent.replies.push(node);
    } else {
      tree.push(node);
    }
  });
  return tree;
}

const toggleDropdown = (id) => {
  dropdownIndex.value = dropdownIndex.value === id ? null : id;
};

const handleClickOutside = (event) => {
  const dropdowns = document.querySelectorAll('.comment-dropdown, .icon-button');
  const clickedInside = Array.from(dropdowns).some(el => el.contains(event.target));
  if (!clickedInside) dropdownIndex.value = null;
};

const openDeleteModal = (id) => {
  deleteTargetId.value = id;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  deleteTargetId.value = null;
};

const deleteComment = async () => {
  try {
    await axios.patch(`http://localhost:5000/api/comment/${deleteTargetId.value}/delete`, {}, {
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    });
    closeDeleteModal();
    await fetchComments(taskId.value);
  } catch (error) {
    const status = error.response?.status;
    if (status === 403 || status === 409) {
      alert(error.code);
      route.push('/');
    }
  }
};

const emit = defineEmits(['edit-comment']);

const props = defineProps({
  taskId: { type: [String, Number], required: true }
});

const onEditComment = (comment) => {
  emit('edit-comment', {
    id: comment.commentId,
    content: comment.content,
    isNotice: true
  });
};

const sortComments = () => {
  const sorted = [...comments.value].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder.value === 'asc' ? timeA - timeB : timeB - timeA;
  });
  comments.value = sorted;
};

watch(sortOrder, sortComments);

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
  fetchComments(taskId.value);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});
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
  justify-content: flex-end; 
  align-items: center;
  padding-right: 12px;
}

.select_box {
  width: 120px;         
  padding: 6px 8px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  appearance: none;
  background-image: url('@/assets/icons/chevron-down.svg');
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
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
gap: 6px;
flex-shrink: 0;
min-height: fit-content;
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
font-size: 12px;
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
z-index: 9999;
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
z-index: 9999;
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
