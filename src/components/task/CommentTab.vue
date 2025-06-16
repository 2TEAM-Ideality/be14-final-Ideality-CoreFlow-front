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
                <span class="comment-writer">{{ comment.writer }}</span>
                </div>

                <div class="comment-box">
                <span class="comment-content">{{ comment.content }}</span>

                <div class="comment-icons">
                    <img src="@/assets/icons/message.svg" alt="message" class="icon" />
                    <button @click="toggleDropdown(comment.id)" class="icon-button">
                    <img src="@/assets/icons/ellipsis-vertical.svg" alt="more" />
                    </button>
                </div>

                <div v-if="dropdownIndex === comment.id" class="comment-dropdown">
                    <button>댓글 수정</button>
                    <button>댓글 삭제</button>
                    <button class="highlight">공지로 등록하기</button>
                </div>
                </div>

                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                    <div class="reply-header">
                        <span class="comment-writer">ㄴ {{ reply.writer }}</span>
                    </div>

                    <div class="comment-box">
                        <span class="comment-content">{{ reply.content }}</span>
                        <div class="comment-icons">
                        <img src="@/assets/icons/message.svg" alt="message" class="icon" />
                        <button @click="toggleDropdown(reply.id)" class="icon-button">
                            <img src="@/assets/icons/ellipsis-vertical.svg" alt="more" />
                        </button>
                        </div>
                        <div v-if="dropdownIndex === reply.id" class="comment-dropdown">
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';

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
padding-right: 24px;
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

.comment-box {
position: relative;
display: flex;
flex-direction: column;
justify-content: center;
max-width: 100%;
padding: 12px 16px;
font-size: 14px;
border: 1px solid #aaa;
border-radius: 8px;
line-height: 1.5;
word-break: break-word;
background: #fff;
overflow: visible;
}

.comment-content {
display: block;
padding-right: 60px; /* 아이콘 공간 확보 */
word-wrap: break-word;
white-space: pre-wrap;
}

.comment-icons {
position: absolute;
top: 12px;
right: 16px;
display: flex;
gap: 8px;
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
padding: 12px 12px;
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
