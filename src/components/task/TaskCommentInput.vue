<template>
    <div class="mention-container">
        <label>md팀_사원_양복이</label>
    <div class="input-box">
    <input
        v-model="input"
        type="text"
        class="mention-input"
        placeholder="댓글을 작성하세요"
        @input="handleInput"
        @focus="handleInput"
        @blur="handleBlur"
    />
    <ul v-if="showDropdown && suggestions.length" class="dropdown-list">
        <li
        v-for="item in suggestions"
        :key="item"
        @mousedown.prevent="selectMention(item)"
        >
        {{ item }}
        </li>
    </ul>
    </div>

    <div class="options">
        <label><input type="checkbox" v-model="isNotice" /> 공지</label>
        <button class="submit-btn" @click="handleSubmit">등록</button>
    </div>

</div>
</template>

<script setup>
import { ref, watch } from 'vue'

const input = ref('')
const isNotice = ref(false)
const showDropdown = ref(false)
const suggestions = ref([])

const handleInput = async () => {
const lastAtIndex = input.value.lastIndexOf('@')
if (lastAtIndex !== -1) {
    const keyword = input.value.slice(lastAtIndex + 1)
    if (keyword.length > 0) {
    try {
        // 🔁 백엔드 API 호출 (예: /api/mentions?query=디자인팀_사원)
        const res = await fetch(`/api/mentions?query=${encodeURIComponent(keyword)}`)
        const data = await res.json()
        suggestions.value = data
        showDropdown.value = true
    } catch (err) {
        console.error('자동완성 불러오기 실패:', err)
        suggestions.value = []
        showDropdown.value = false
    }
    } else {
    suggestions.value = []
    showDropdown.value = false
    }
} else {
    showDropdown.value = false
}
}

const selectMention = (mention) => {
const lastAtIndex = input.value.lastIndexOf('@')
input.value = input.value.slice(0, lastAtIndex) + mention
showDropdown.value = false
}

function handleBlur() {
setTimeout(() => {
    showDropdown.value = false
}, 150)
}

const handleSubmit = () => {
console.log('입력값:', input.value)
console.log('공지 여부:', isNotice.value)
}
</script>

<style scoped>
.mention-container {
width: 400px;
padding: 10px;
font-family: sans-serif;
}

.input-box {
position: relative;
}

.mention-input {
width: 100%;
padding: 8px;
border: 1px solid #ccc;
border-radius: 4px;
}

.dropdown-list {
position: absolute;
top: 100%;
left: 0;
width: 100%;
background: white;
border: 1px solid #ccc;
border-top: none;
border-radius: 0 0 4px 4px;
list-style: none;
margin: 0;
padding: 0;
z-index: 10;
box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.dropdown-list li {
padding: 8px 12px;
cursor: pointer;
}

.dropdown-list li:hover {
background-color: #f5f5f5;
}

.options {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 👉 오른쪽 정렬 */
  gap: 10px;
}

.submit-btn {
    padding: 2px 20px;
    border:  1px solid black;
    background-color: #FFFBFB;
    color: black;
    border-radius: 4px;
    transition: background-color 0.2s;
}
</style>