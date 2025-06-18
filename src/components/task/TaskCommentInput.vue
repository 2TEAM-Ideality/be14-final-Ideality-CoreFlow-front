<template>
    <div class="comment-container">
        <hr class="comment-divider">
        <label class="nickname-label">{{ fullName }}</label>

        <!-- replyTargetId가 있을 때만 표시 -->
        <div v-if="replyTargetId" class="reply-banner">
            <span><strong>{{ replyTargetUser }}</strong>님에게 답글 작성 중</span>
            <button @click="$emit('reset-reply')">취소</button>
        </div>
        <div class="input-box">
            <textarea
                v-model="input"
                ref="textarea"
                class="comment-input"
                placeholder="댓글을 작성하세요"
                rows="1"
                @input="handleInput"
                @keydown="handleKeydown"
            />
            <img src="@/assets/icons/paperclip.svg" class="image-icon" @click="triggerFileInput" />
            <input type="file" ref="fileInput" class="hidden-file-input" @change="handleFileChange" />

            <!-- 멘션 자동완성 모달 -->
            <ul
                v-if="showSuggestions"
                class="mention-suggestion"
                :style="{ top: `${position.top}px`, left: `${position.left}px` }"
            >
            <li
            v-for="(user, index) in filteredUsers"
            :key="user.name"
            :class="{ selected: index === selectedIndex }"
            @click="selectUser(user)"
            >
            {{ user.type === 'DETAIL' ? '#' : '@' }}{{ user.name }}
            </li>
            </ul>
        </div>
    
    <div v-if="selectedFileName" class="file-name">
        첨부파일: {{ selectedFileName }}
        <button @click="removeFile">❌</button>
    </div>
    <div class="options">
        <label><input type="checkbox" v-model="isNotice" /> 공지</label>
        <button class="submit-btn" @click="handleSubmit">등록</button>
    </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const fullName = `${userStore.deptName}_${userStore.name}`

const selectedFileName = ref(null);

// props
const props = defineProps({
    taskId: [String, Number],
    replyTargetId: Number,
    replyTargetUser: String,
    editData: { type: Object, default: null }
})

// 상태 변수
const input = ref('')
const isNotice = ref(false)
const editingCommentId = ref(null)
const textarea = ref(null)
const fileInput = ref(null)

const showSuggestions = ref(false)
const allUsers = ref([])
const filteredUsers = ref([])
const selectedIndex = ref(0)
const position = ref({ top: 0, left: 0 })

// 댓글에 배열로 담아서 보내야 할 것들
const selectedMentions = ref(new Set())
const selectedDetails = ref(new Set())

const emit = defineEmits(['reset-reply', 'comment-updated'])

// 멘션 자동완성 리스트 가져오기
const fetchMentionUser = async (keyword) => {
try {
    const res = await axios.get(`http://localhost:5000/api/mention/search?projectId=1&mentionTarget=${keyword}`, {
    headers: {
        Authorization: `Bearer ${userStore.accessToken}`
    }
    })
    const mentions = res.data.data
    allUsers.value = mentions.map((mention, idx) => ({
    id: idx,
    name: mention.name,
    type: mention.type
    }))
    filteredUsers.value = allUsers.value.filter((u) =>
    u.name.toLowerCase().includes(keyword.toLowerCase())
    )
} catch (error) {
    console.error('멘션 유저 조회 실패:', error)
}
}

const fetchDetailList = async (keyword) => {
try {
    const res = await axios.get(`http://localhost:5000/api/mention/detail?projectId=1&taskId=${props.taskId}&mentionTarget=${keyword}`, {
    headers: {
        Authorization: `Bearer ${userStore.accessToken}`
    }
    })
    const details = res.data.data || []
    allUsers.value = details.map((detail, idx) => ({
    id: idx,
    name: detail.name,
    type: detail.type
    }))
    // 이곳에서 필터링
    filteredUsers.value = allUsers.value.filter((u) =>
    typeof u.name === 'string' && u.name.toLowerCase().includes(keyword.toLowerCase())
    )
} catch (error) {
    console.error('세부 일정 조회 실패:', error)
}
}


// textarea 리사이징
const resizeTextarea = () => {
nextTick(() => {
    if (textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = textarea.value.scrollHeight + 'px'
    }
})
}

// 멘션 입력 감지
const handleInput = async () => {
resizeTextarea()
const cursor = textarea.value?.selectionStart ?? 0
const beforeCursor = input.value.slice(0, cursor)

// 멘션 패턴 추출
const atMatch = beforeCursor.match(/@(\S*)$/)
const hashMatch = beforeCursor.match(/#(\S*)$/)

if (atMatch) {
    const keyword = atMatch[1]
    await fetchMentionUser(keyword)
    showSuggestions.value = true
    updatePosition()
} else if (hashMatch) {
    const keyword = hashMatch[1]
    await fetchDetailList(keyword)
    showSuggestions.value = true
    updatePosition()
} else {
    showSuggestions.value = false
}
}
// 멘션 선택
const selectUser = (user) => {
const cursor = textarea.value.selectionStart
const beforeCursor = input.value.slice(0, cursor)
const afterCursor = input.value.slice(cursor)

// @ 또는 #으로 시작하는 마지막 토큰을 치환
const newBefore = beforeCursor.replace(
    /[@#][^\s@#]*$/,
    `${user.type === 'DETAIL' ? '#' : '@'}${user.name} `
)

input.value = newBefore + afterCursor
showSuggestions.value = false

// ✅ mentions / details에 추가
if (user.type === 'DETAIL') {
    selectedDetails.value.add(user.name)
} else {
    selectedMentions.value.add(user.name)
}

nextTick(() => {
    textarea.value.focus()
    resizeTextarea()
})
}

// 키보드 이동
const handleKeydown = (e) => {
    if (!showSuggestions.value) return
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        selectedIndex.value = (selectedIndex.value + 1) % filteredUsers.value.length
        scrollToSelected()
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        selectedIndex.value =
        (selectedIndex.value - 1 + filteredUsers.value.length) % filteredUsers.value.length
        scrollToSelected()
    } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredUsers.value.length > 0) {
        const selectedUser = filteredUsers.value[selectedIndex.value]
        selectUser(selectedUser)
        }
    }
}

// 모달 위치 갱신
const updatePosition = () => {
if (textarea.value) {
    position.value = {
    top: textarea.value.offsetTop + textarea.value.offsetHeight + 4,
    left: 12
    }
}
}

// 스크롤 이동
const scrollToSelected = () => {
nextTick(() => {
    const container = document.querySelector('.mention-suggestion')
    const selectedEl = container?.children[selectedIndex.value]
    if (selectedEl && container) {
    const offsetTop = selectedEl.offsetTop
    const elHeight = selectedEl.offsetHeight
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight
    if (offsetTop < scrollTop) container.scrollTop = offsetTop
    else if (offsetTop + elHeight > scrollTop + containerHeight)
        container.scrollTop = offsetTop + elHeight - containerHeight
    }
})
}

// 파일 업로드, 파일 제거
const triggerFileInput = () => fileInput.value?.click()
const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
    selectedFileName.value = file.name
    console.log('선택한 파일:', file)
    } else {
        selectedFileName.value = null
    }
}

const removeFile = () => {
    selectedFileName.value = null
    if (fileInput.value) fileInput.value.value = null
}

// 댓글 등록
const handleSubmit = async () => {
    const formData = new FormData()

    formData.append('content', input.value)
    formData.append('isNotice', isNotice.value.toString())

    if (fileInput.value?.files?.[0]) {
        formData.append('attachmentFile', fileInput.value.files[0])
    }

    console.log(editingCommentId.value);
    // ✅ 등록일 때만 mentions / details 추가
    if (!editingCommentId.value) {
        for (const mention of selectedMentions.value) {
        formData.append('mentions', mention)
        }

        for (const detail of selectedDetails.value) {
        formData.append('details', detail)
        }

        if (props.replyTargetId) {
        formData.append('parentCommentId', props.replyTargetId.toString())
        }
    }

    try {
        if (editingCommentId.value) {
        // ✏️ 수정 요청
        await axios.patch(`/api/comment/${editingCommentId.value}`, formData, {
            headers: {
            Authorization: `Bearer ${userStore.accessToken}`,
            },
        })
        } else {
        // ✅ 등록 요청
        await axios.post(`/api/comment/write/${props.taskId}`, formData, {
            headers: {
            Authorization: `Bearer ${userStore.accessToken}`,
            },
        })
    }

        // 초기화
        input.value = ''
        isNotice.value = false
        editingCommentId.value = null
        selectedMentions.value.clear()
        selectedDetails.value.clear()
        if (fileInput.value) fileInput.value.value = ''
        resizeTextarea()

        // 초기화 후 emit
        emit('comment-updated')
        emit('reset-reply')
    } catch (err) {
        console.error('댓글 등록/수정 실패:', err)
    }
}

// 수정 시 불러오기
watch(() => props.editData, (newVal) => {
console.log(newVal);
if (newVal) {
    input.value = newVal.content
    isNotice.value = !!newVal.isNotice
    editingCommentId.value = newVal.id
    nextTick(() => resizeTextarea())
}
})

onMounted(() => resizeTextarea())
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
  line-height: 1.5;
  transition: height 0.1s ease-out;
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

.mention-suggestion {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  list-style: none;
  padding: 4px 0;
  margin-top: 4px;
  width: 200px;
  z-index: 100;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  max-height: 110px;     
  overflow-y: auto;         
  scroll-behavior: smooth; 
}

.mention-suggestion li {
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

.mention-suggestion li.selected,
.mention-suggestion li:hover {
  background-color: #f0f0ff;
  font-weight: 500;
}

.reply-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 13px;
}
.reply-banner button {
  background: none;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
}
.reply-banner button:hover {
  text-decoration: underline;
}

.file-name {
  margin-top: 6px;
  font-size: 13px;
  color: #444;
}
</style>