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
            />

            <!-- 이미지 아이콘 버튼 -->
            <img
                src="@/assets/icons/paperclip.svg"
                class="image-icon"
                @click="triggerFileInput"
                alt="이미지 업로드"
            />
            <!-- 숨겨진 파일 업로드 input -->
            <input type="file" ref="fileInput" class="hidden-file-input" @change="handleFileChange" />
        </div>
        <div class="options">
            <label><input type="checkbox" v-model="isNotice" /> 공지</label>
            <button class="submit-btn" @click="handleSubmit">등록</button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch ,onMounted, nextTick } from 'vue'

// 닉네임 가져오기 (예: 백엔드에서 불러오기 or Pinia 상태에서 가져오기)
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const fullName = `${userStore.deptName}_${userStore.jobRankName}_${userStore.name}`

const props = defineProps({
taskId: [String, Number],
replyTargetId: Number,
editData: {
    type: Object,
    default: null
}
})

const input = ref('')
const isNotice = ref(false)
const editingCommentId = ref(null)
const textarea = ref(null);
const fileInput = ref(null);

watch(() => props.editData, (newVal) => {
    if (newVal) {
        input.value = newVal.content
        isNotice.value = !!newVal.isNotice // ← 여기서 체크박스 true로 세팅됨!
        editingCommentId.value = newVal.id
        nextTick(() => resizeTextarea())
    }
})


const resizeTextarea = () => {
    nextTick(() => {
        if (textarea.value) {
        textarea.value.style.height = 'auto' // 높이 초기화
        textarea.value.style.height = textarea.value.scrollHeight + 'px' // scrollHeight만큼 설정
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

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
    console.log('선택한 파일:', file)
    }
}
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
resize: none;         /* 마우스 크기조절 X */
overflow: hidden;     /* 스크롤 안 뜨게 */
border: 1px solid #ccc;
border-radius: 4px;
font-size: 14px;
font-family: inherit;
box-sizing: border-box;
line-height: 1.5;
transition: height 0.1s ease-out; /* 부드럽게 늘어나도록 */
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

.image-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 14px;
  height: 14px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.image-icon:hover {
  opacity: 1;
}

.hidden-file-input {
  display: none;
}

</style>