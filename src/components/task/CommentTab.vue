<template>
    <div class="comment-tab">
        <div class="comment-filter">
        <label># 세부일정</label>
        <select class="select_box">
            <option>Value</option>
            <!-- 옵션 추가 가능 -->
        </select>
        </div>

        <div class="comment-list">
        <div
            v-for="(comment, index) in comments"
            :key="comment.id"
            class="comment-item"
        >
            <div class="comment-header">
            <span class="comment-writer">{{ comment.writer }}</span>
            <!-- <div class="comment-actions">
                <button @click="toggleDropdown(comment.id)">
                <img src="@/assets/icons/ellipsis-horizontal.svg" alt="more" width="16" />
                </button>
                <div
                v-if="dropdownIndex === comment.id"
                class="comment-dropdown"
                >
                <button>댓글 수정</button>
                <button>댓글 삭제</button>
                <button class="highlight">공지로 등록하기</button>
                </div>
            </div> -->
            </div>

            <div class="comment-box">
                <span class="comment-content">{{ comment.content }}</span>

                <div class="comment-icons">
                    <img src="@/assets/icons/message.svg" alt="message" class="icon" />
                    <button @click="toggleDropdown(comment.id)" class="icon-button">
                    <img src="@/assets/icons/ellipsis-vertical.svg" alt="more" />
                    </button>
                </div>

                <!-- 드롭다운 -->
                <div
                    v-if="dropdownIndex === comment.id"
                    class="comment-dropdown"
                >
                    <button>댓글 수정</button>
                    <button>댓글 삭제</button>
                    <button class="highlight">공지로 등록하기</button>
            </div>
</div>

            <!-- 대댓글 렌더링 -->
            <div
            v-for="reply in comment.replies"
            :key="reply.id"
            class="reply-item"
            >
            <div class="reply-prefix">ㄴ</div>
            <div>
                <div class="comment-writer">{{ reply.writer }}</div>
                <div class="comment-box">{{ reply.content }}</div>
            </div>
            </div>
        </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import axios from 'axios' 
const route = useRoute();
const userStore = useUserStore();
const taskId = ref(route.params.taskId);

const comments = ref([
{
    id: 1,
    writer: 'md팀_팀장_권민수',
    content: '#세부일정1 @md팀_사원_정동환 최종 보고서 마감일 10일까지입니다.',
    replies: []
},
{
    id: 2,
    writer: '디자인팀_팀장_Xinyu',
    content: '#세부일정2 @디자인팀_사원_정민선 외 2인과 논의 후 일정 확정했습니다.',
    replies: []
},
{
    id: 3,
    writer: '생산팀_팀장_장시윤',
    content: '#세부일정3 추가 요청 사항 반영. 변경되었습니다. 부서 전달 부탁드립니다.',
    replies: [
    {
        id: 31,
        writer: '디자인팀_팀장_Xinyu',
        content: '이거 공지로 등록하겠습니다!'
    }
    ]
}
])

const dropdownIndex = ref(null)
const toggleDropdown = (id) => {
dropdownIndex.value = dropdownIndex.value === id ? null : id
}
</script>

<style scoped>
.comment-tab {
display: flex;
flex-direction: column;
gap: 40px;
padding-left: 40px;
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
-webkit-appearance: none; /* Safari 대응 */

/* 🔽 아이콘 이미지 위치 */
background-image: url('@/assets/icons/chevron-down.svg'); /* 너가 저장한 아이콘 경로로 바꾸기 */
background-repeat: no-repeat;
background-position: right 16px center;
background-size: 16px;
}

.comment-list {
min-height: 400px;
max-height: 500px;
overflow-y: auto;
padding-right: 6px;
}

.comment-item {
display: flex;
flex-direction: column;
gap: 6px;
}

.comment-header {
display: flex;
justify-content: space-between;
align-items: center;
}

.comment-writer {
font-size: 14px;
}

.comment-box {
display: flex;
justify-content: space-between;
align-items: center;

width: 100%;
max-width: 300px;
border: 1px solid #ddd;
border-radius: 8px;
padding: 12px;
padding-top: 32px; 
font-size: 14px;
line-height: 1.4;
position: relative;
}

.comment-content {
flex: 1;
margin-right: 8px;
white-space: pre-wrap;
word-break: break-word;
}

.comment-icons {
  position: absolute;
  top: 8px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.icon {
width: 16px;
height: 16px;
}

.icon-button {
background: none;
border: none;
padding: 0;
cursor: pointer;
}

.comment-dropdown {
position: absolute;
top: 100%;
right: 0;
margin-top: 6px;

background: #fff;
border: 1px solid #ccc;
border-radius: 6px;
padding: 6px;
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

display: flex;
flex-direction: column;
gap: 6px;
z-index: 10;
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

.reply-item {
display: flex;
gap: 8px;
margin-left: 16px;
margin-top: 6px;
align-items: flex-start;
}

.reply-prefix {
font-size: 16px;
color: #888;
line-height: 1.6;
}

.comment-actions {
position: relative;
}

.comment-actions button {
background: none;
border: none;
padding: 0;
cursor: pointer;
}

.comment-dropdown {
position: absolute;
top: 20px;
right: 0;
background: #fff;
border: 1px solid #ccc;
border-radius: 6px;
padding: 6px;
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
display: flex;
flex-direction: column;
gap: 6px;
z-index: 10;
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
</style>