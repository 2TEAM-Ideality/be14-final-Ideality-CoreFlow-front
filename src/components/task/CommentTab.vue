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
                <span class="comment-writer">{{ comment.commentWriter }}</span>
                </div>

                <div class="comment-box">
                <span class="comment-content">{{ comment.content }}</span>

                <div class="comment-icons">
                    <img src="@/assets/icons/message.svg" alt="message" class="icon" />
                    <!-- 댓글 드롭다운 열기 -->
                    <!-- 댓글 드롭다운 열기 버튼 -->
                    <button
                      v-if="comment.commentWriter === currentUserName"
                      @click="toggleDropdown(`comment-${comment.commentId}`)"
                      class="icon-button"
                    >
                      <img src="@/assets/icons/ellipsis-vertical.svg" alt="more" />
                    </button>
                </div>
                
                <!-- 댓글 드롭다운 -->
                <div v-if="dropdownIndex === `comment-${comment.commentId}`" class="comment-dropdown">
                    <button>댓글 수정</button>
                    <button>댓글 삭제</button>
                    <button class="highlight">공지로 등록하기</button>
                </div>
                </div>

                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <div class="reply-header">
                        <span class="comment-writer">ㄴ {{ reply.commentWriter }}</span>
                    </div>

                    <div class="comment-box">
                        <span class="comment-content">{{ reply.content }}</span>
                        <div class="comment-icons">
                        <img 
                        src="@/assets/icons/message.svg" 
                        alt="message" 
                        class="icon" 
                        @click="replyTargetId = comment.commentId"/>
                        <!-- 대댓글 드롭다운 열기 버튼 -->
                        <button
                          v-if="reply.commentWriter === currentUserName"
                          @click="toggleDropdown(`reply-${reply.commentId}`)"
                          class="icon-button"
                        >
                          <img src="@/assets/icons/ellipsis-vertical.svg" alt="more" />
                        </button>

                        </div>
                        <!-- 대댓글 드롭다운 -->
                        <!-- 대댓글에 대한 부모처리는 내일 가서 물어볼 것-->
                        <div v-if="dropdownIndex === `reply-${reply.commentId}`" class="comment-dropdown">
                          <button>댓글 수정</button>
                          <button>댓글 삭제</button>
                          <button class="highlight">공지로 등록하기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import axios from 'axios' 

const route = useRoute();
const userStore = useUserStore();
const taskId = ref(route.params.taskId);

const currentUserName = computed(() => {
  return `${userStore.deptName}_${userStore.jobRankName}_${userStore.name}`
});

const comments = ref([]);
const replyTargetId = ref(null);

const fetchComments = async (id)=> {
  try {
    const res = await axios.get(`http://localhost:5000/api/comment/task/${id}`, {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`
      }
    });
    comments.value = convertToTree(res.data.data);
  } catch (e) {
    console.error('댓글 조회 실패');
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

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  fetchComments(taskId.value);
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.comment-tab {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-left: 40px;
  padding-right: 24px;

  min-height: 100%;
  overflow: visible;
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
  min-height: 400px;         /* 고정 높이 */
  overflow-y: scroll;        /* 항상 스크롤바 표시 (윈도우 기준) */
  padding-right: 12px;        /* 스크롤 너비 여유 */
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
  font-size: 14px;
}

.comment-icons {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  cursor: pointer;
}

.icon-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.icon-button img {
  width: 16px;
  height: 16px;
  display: inline-block;
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
  font-size: 14px;
  font-weight: bold;
}

/* 대댓글 */
.reply-item {
  padding-left: 24px;
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
</style>
