<template>
    <div class="notice-tab">
        <div class="notice-filter">
            <select class="select_box">
                <option>오름차순</option>
                <option>내림차순</option>
            </select>
        </div>
        
        <div class="notice-list">
            <!-- 댓글 -->
            <div
            v-for="(notice, index) in notice"
            :key="notice.id"
            class="notice-item">

                <div class="notice-header">
                    <span class="notice-writer">📌 {{ notice.commentWriter }}</span>
                </div>

                <div class="notice-box">
                    <span class="notice-content">{{ notice.content }}</span>

                    <div class="notice-icon">
                        <!-- 공지 드롭다운 열기 -->
                        <button
                        v-if="notice.userId === userStore.id"
                        @click="toggleDropdown(`notice-${notice.commentId}`)"
                        class="icon-button">
                            <img src="@/assets/icons/ellipsis-horizontal.svg" alt="more" class="icon" />
                        </button>
                    </div>

                    <!-- 댓글 드롭다운 -->
                    <div v-if="dropdownIndex === `notice-${notice.commentId}`" class="notice-dropdown">
                        <button @click="onEditComment(comment)">공지 수정</button>
                        <button @click="openDeleteModal(comment.commentId)">공지 삭제</button>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import axios from 'axios'

const route = useRoute();
const userStore = useUserStore();
const taskId = ref(route.params.taskId);
const notices = ref([]);

// 공지 삭제 구현
const isDeleteModalOpen = ref(false);
const deleteTargetId = ref(null);

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

onMounted(() => {
    window.addEventListener('click', handleClickOutside)
    fetchComments(taskId.value);
})

onBeforeUnmount(() => {
    window.removeEventListener('click', handleClickOutside)
})

// 여기서부터 api
const fetchNotice = async (id) => {

};
</script>

<style scoped>
.notice-tab {
  height: 100%;
  max-height: calc(100vh - 100px); /* 필요시 적절히 조절 */
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-left: 40px;
  padding-right: 12px;
  overflow: hidden; /* 중요: 내부 스크롤을 위해 */
}

.notice-filter {
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

.notice-list {
  min-height: 400px;         /* 댓글이 없어도 공간 확보 */
  max-height: 400px;         /* 댓글이 많을 경우 최대 높이까지만 */
  overflow-y: auto;          /* 스크롤 가능하게 */
  padding-right: 12px;
}

.notice-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  min-height: fit-content;
}

.notice-box {
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

.notice-content {
  display: block;
  padding-right: 60px;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 14px;
}

.notice-icon {
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

.notice-dropdown {
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

.notice-dropdown button {
  background: none;
  border: none;
  font-size: 13px;
  text-align: left;
  padding: 4px 6px;
  cursor: pointer;
  color: #333;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-writer {
  font-size: 14px;
}
</style>