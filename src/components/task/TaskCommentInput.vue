<template>
  <div class="comment-container">
    <div class="sender-section">
      <div class="sender-profile">
        <img :src="userStore.profileImage" alt="프로필 이미지" class="profile-img" />
        <label class="nickname-label">{{ fullName }}</label>
      </div>
      <div class="options">
        <label><input type="checkbox" v-model="isNotice" /> 공지</label>
        <v-btn class="submit-btn" @click="handleSubmit" variant="text" size="small" :disabled="input === ''">등록</v-btn>
      </div>
    </div>

    <!-- replyTargetId가 있을 때만 표시 -->
    <div v-if="replyTargetId" class="reply-banner">
      <span><strong>{{ replyTargetUser }}</strong>님에게 답글 작성 중</span>
      <button @click="$emit('reset-reply')">취소</button>
    </div>
    <div class="input-box">
      <textarea v-model="input" ref="textarea" class="comment-input" placeholder="댓글을 작성하세요" rows="1"
        @input="handleInput" @keydown="handleKeydown" />
      <img src="@/assets/icons/paperclip.svg" class="image-icon" @click="triggerFileInput" />
      <input type="file" ref="fileInput" class="hidden-file-input" @change="handleFileChange" />

      <!-- 멘션 자동완성 모달 -->
      <ul v-if="showSuggestions" class="mention-suggestion"
        :style="{ top: `${position.top}px`, left: `${position.left}px` }">
        <li v-for="(user, index) in filteredUsers" :key="user.name" :class="{ selected: index === selectedIndex }"
          @click="selectUser(user)">
          {{ user.type === 'DETAIL' ? '#' : '@' }}{{ user.name }}
        </li>
      </ul>
    </div>

    <div v-if="selectedFileName" class="file-name d-flex align-center">
      첨부파일: {{ selectedFileName }}
      <v-btn icon size="x-small" class="ml-2" color="grey-darken-1" @click="removeFile">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <!-- <div v-if="selectedFileName" class="file-name">
      첨부파일: {{ selectedFileName }}
      <button @click="removeFile">❌</button>
  </div> -->
    <!-- <div class="options">
      <label><input type="checkbox" v-model="isNotice" /> 공지</label>
      <v-btn class="submit-btn" @click="handleSubmit" variant="flat">
      등록
      </v-btn>
  </div> -->
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore'
import api from '@/api'
import { useUpdateStore } from '@/stores/updateStore'

const updateStore = useUpdateStore()    // 업데이트 여부 

const route = useRoute()
const taskId = route.params.taskId
const userStore = useUserStore()
console.log(userStore.profileImage)
const fullName = `${userStore.deptName}_${userStore.name}`

const selectedFileName = ref(null);

// props
const props = defineProps({
  // taskId: {
  //     type: [String, Number],
  //     required: true
  // },
  projectId: {
    type: [String, Number],
    required: true
  },
  replyTargetId: Number,
  replyTargetUser: String,
  editData: {
    type: Object,
    default: null
  }
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
    const res = await api.get(`/api/mention/search`, {
      params: { projectId: props.projectId, mentionTarget: keyword }
    })
    const mentions = res.data.data
    allUsers.value = mentions.map((mention, idx) => ({
      id: idx,
      name: mention.name === fullName ? `${mention.name} (나)` : mention.name,
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
    const res = await api.get(`/api/mention/detail`, {
      params: { projectId: props.projectId, taskId: taskId, mentionTarget: keyword }
    });
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
      const newHeight = Math.min(textarea.value.scrollHeight, 200) // 200px 제한
      textarea.value.style.height = `${newHeight}px`
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
      top: textarea.value.offsetTop - 120, // textarea 위로 표시
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

  // 1. 댓글 내용 추가
  formData.append('content', input.value.trim())

  // 파일 있을 때 파일 내용 추가
  if (fileInput.value?.files?.[0]) {
    formData.append('attachmentFile', fileInput.value.files[0]);  // ✅ 파일 추가
  }

  // 3. 공지 여부 추가
  formData.append('isNotice', isNotice.value.toString())

  // 4. mentions, details 추가
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

  // 5. 등록/수정 요청
  try {
    if (editingCommentId.value) {
      await api.patch(`/api/comment/${editingCommentId.value}`, formData, {
        headers: { Authorization: `Bearer ${userStore.accessToken}` },
      })
    } else {
      await api.post(`/api/comment/write/${taskId}`, formData)
    }
    if (fileInput.value?.files?.[0]) {
      updateStore.triggerSearchHistoryUpdate()  // 자료 검색 탭 갱신
    }

    // 6. 초기화
    input.value = ''
    isNotice.value = false
    editingCommentId.value = null
    selectedMentions.value.clear()
    selectedDetails.value.clear()
    selectedFileName.value = null
    if (fileInput.value) fileInput.value.value = ''
    resizeTextarea()

    emit('comment-updated')
    emit('reset-reply')
  } catch (err) {
    console.error('댓글 등록/수정 실패:', err)
  }
}

// 수정 시 불러오기
watch(() => props.editData, (newVal) => {
  if (newVal) {
    input.value = newVal.content
    isNotice.value = !!newVal.isNotice
    editingCommentId.value = newVal.id

    if (newVal.originName) {
      selectedFileName.value = newVal.originName // ✅ 첨부파일명 세팅
    }

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
  height: 100%;
  max-width: 600px;
  padding: 10px 20px;
  border-top: solid 1px rgb(226, 226, 226);
}

/* 작성자 입력창 */
.sender-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  justify-content: space-between;
}

.sender-profile {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}

.profile-img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
}

.nickname-label {
  margin: 0;
  padding: 0;
  font-weight: bold;
  font-size: 15px;
  display: inline-block;
}

.input-box {
  position: relative;
}

.comment-input {
  width: 100%;
  min-height: 44px;
  max-height: 200px;
  padding: 8px 12px;
  resize: none;
  overflow-y: auto !important;
  /* 내용 넘칠 때만 스크롤 */
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-size: 15px;
  font-family: 'Pretendard', sans-serif;
  box-sizing: border-box;
  line-height: 1.6;
  transition: border 0.2s, box-shadow 0.2s;

  /* scrollbar-width: thin;         */
  scrollbar-color: #bbb transparent;
}



.comment-input:focus {
  outline: none;
  border-color: #3f51b5;
  box-shadow: 0 0 0 2px #e8eaf6;
}

.submit-btn {
  /* padding: 6px 16px; */
  /* border: 1px solid #000; */
  color: white;
  padding: 0;
  border-radius: 10px;
  background-color: #3f51b5;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.options {
  /* margin-top: 10px; */
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