<template>
    <div class="comment-container">
        <hr class="comment-divider">
        <label class="nickname-label">{{ fullName }}</label>
        <div class="input-box">
        <textarea
            v-model="input"
            ref="textarea"
            class="comment-input"
            placeholder="댓글을 작성하세요"
            rows="1"
            @input="resizeTextarea"
        ></textarea>
        </div>
        <div class="options">
            <label><input type="checkbox" v-model="isNotice" /> 공지</label>
            <button class="submit-btn" @click="handleSubmit">등록</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// 닉네임 가져오기 (예: 백엔드에서 불러오기 or Pinia 상태에서 가져오기)
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const fullName = `${userStore.deptName}_${userStore.jobRankName}_${userStore.name}`

const input = ref('')
const textarea = ref(null)

const resizeTextarea = () => {
nextTick(() => {
    if (textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = textarea.value.scrollHeight + 'px'
    }
})
}

const handleSubmit = () => {
console.log('작성한 댓글:', input.value)
input.value = ''
resizeTextarea()
}

onMounted(() => {
resizeTextarea()
})
</script>

<style scoped>

.comment-divider {
margin-top: 4px;
margin-bottom: 12px;
height: 1px;
background-color: #eee;
border: none;
}

.comment-container {
width: 100%;
max-width: 600px;
padding: 12px;
}

.nickname-label {
font-weight: bold;
margin-bottom: 8px;
display: block;
color: #333;
font-size: 15px;
}

.input-box {
position: relative;
}

.comment-input {
width: 100%;
min-height: 40px;
padding: 10px;
resize: none;
overflow: hidden;
border: 1px solid #ccc;
border-radius: 4px;
font-size: 14px;
font-family: inherit;
box-sizing: border-box;
}

.submit-btn {
padding: 6px 16px;
border: 1px solid #000;
background-color: #FFFBFB;
border-radius: 4px;
font-size: 14px;
cursor: pointer;
transition: background-color 0.2s;
}

.options {
margin-top: 10px;
display: flex;
align-items: center;
justify-content: flex-end;
gap: 10px;
}
</style>