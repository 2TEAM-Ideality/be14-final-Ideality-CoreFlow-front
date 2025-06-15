<template>
<div class="comment-tab">
    <div class="comment-filter">
    <label># 세부일정</label>
    <select>
        <option>Value</option>
        <!-- 옵션 추가 가능 -->
    </select>
    </div>

    <div class="comment-list">
    <div
        v-for="(comment, index) in comments"
        :key="index"
        class="comment-box"
    >
        <div class="comment-header">
        <span class="comment-writer">{{ comment.writer }}</span>
        <div class="comment-actions">
            <button @click="toggleDropdown(index)">
            </button>
            <div
            v-if="dropdownIndex === index"
            class="comment-dropdown"
            >
            <button>댓글 수정</button>
            <button>댓글 삭제</button>
            <button class="highlight">공지로 등록하기</button>
            </div>
        </div>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
    </div>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue'

const comments = ref([
{
    writer: 'md팀_팀장_권민수',
    content: '#세부일정1 @md팀_사원_정동환 최종 보고서 마감일 10일까지입니다.'
},
{
    writer: '디자인팀_팀장_Xinyu',
    content: '#세부일정2 @디자인팀_사원_정민선 외 2인과 논의 후 일정 확정했습니다.'
},
{
    writer: '생산팀_팀장_장시윤',
    content: '#세부일정3 추가 요청 사항 반영. 변경되었습니다. 부서 전달 부탁드립니다.'
},
{
    writer: 'L_디자인팀_팀장_Xinyu',
    content: '이거 공지로 등록하겠습니다.'
}
])

const dropdownIndex = ref(null)
const toggleDropdown = (index) => {
dropdownIndex.value = dropdownIndex.value === index ? null : index
}
</script>

<style scoped>
.comment-tab {
display: flex;
flex-direction: column;
gap: 12px;
}

.comment-filter {
display: flex;
flex-direction: column;
gap: 6px;
font-size: 14px;
}

.comment-list {
display: flex;
flex-direction: column;
gap: 12px;
max-height: 360px;
overflow-y: auto;
padding-right: 6px;
}

.comment-box {
position: relative;
background: #f9f9f9;
border: 1px solid #ddd;
border-radius: 8px;
padding: 12px;
font-size: 13px;
}

.comment-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 6px;
}

.comment-writer {
font-weight: bold;
font-size: 13px;
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
