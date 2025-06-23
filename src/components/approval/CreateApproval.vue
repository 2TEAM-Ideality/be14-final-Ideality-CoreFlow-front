<template>
    <v-container class="pa-4 d-flex" fluid>
        <div class="left-area">
            <v-row>
                <v-col>
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">결재 제목</span>
                    <span class="not-null">*</span>
                </div>
                <v-text-field density="compact"v-model="title" placeholder="제목 입력" variant="outlined" :style="{ width: '500px' }" />
                </v-col>
            </v-row>
            <!-- 프로젝트/태크스 선택 -->
            <v-row>
                <v-col cols="6">
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">해당 프로젝트</span>
                    <span class="not-null">*</span>
                </div>
                <v-select
                density="compact"
                    v-model="selectedProjectId"
                    :items="projectList"
                    item-title="name"
                    item-value="id"
                    placeholder="프로젝트 선택"
                    variant="outlined"
                />
                </v-col>
                <v-col cols="6">
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">해당 태스크</span>
                    <span class="not-null">*</span>
                </div>
                <v-select
                    density="compact"
                    v-model="selectedTaskId"
                    :items="filteredTaskList"
                    item-title="name"
                    item-value="id"
                    placeholder="태스크 선택"
                    :disabled="!selectedProjectId"
                    variant="outlined"
                />
                </v-col>
            </v-row>
            <!-- 구분 -->
            <v-row>
                <v-col>
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">구분</span>
                    <span class="not-null">*</span>
                </div>
                <v-select
                    density="compact"
                    v-model="approvalType"
                    :items="approvalTypeList"
                    placeholder="결재 구분"
                    variant="outlined"
                />
                </v-col>
            </v-row>
            <!-- 지연 정보 -->
            <v-row v-if="isDelay">
                <v-col cols="6">
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">지연 사유</span>
                    <span class="not-null">*</span>
                </div>
                <v-select
                    density="compact"
                    v-model="selectedDelayReasonId"
                    :items="delayResons"
                    item-title="reason"
                    item-value="id"
                    placeholder="사유 선택"
                    variant="outlined"
                />
                </v-col>
                <v-col cols="6">
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">지연일</span>
                    <span class="not-null">*</span>
                </div>
                <v-text-field density="compact" v-model="delayDays" type="number" variant="outlined" />
                </v-col>
            </v-row>
            <!-- 상세 내용 -->
            <v-row>
                <v-col>
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">상세 내용</span>
                    <span class="not-null">*</span>
                </div>
                <v-textarea density="compact" v-model="content" auto-grow variant="outlined" :style="{ width: '500px' }" />
                </v-col>
            </v-row>
            <!-- 조치 내용 -->
            <v-row v-if="isDelay">
                <v-col>
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">조치 내용</span>
                    <span class="not-null">*</span>
                </div>
                <v-textarea density="compact" v-model="actionDetail" auto-grow variant="outlined" :style="{ width: '500px' }" />
                </v-col>
            </v-row>
            <!-- 첨부파일 -->
            <v-row>
                <v-col>
                <div class="d-flex align-center mb-1">
                    <span class="text-subtitle-2 font-weight-bold">첨부파일</span>
                </div>
                <v-file-input
                    density="compact"
                    v-model="selectedFiles"
                    label="파일 선택"
                    multiple
                    show-size
                    variant="outlined"
                    :style="{ width: '500px' }"
                />
                </v-col>
            </v-row>
        </div>
        
        <div class="right-area">
            <div class="participant-box">
                <div class="sub-area">
                    <div class="title-area">
                        <div class="participant-title">결재자</div>
                        <span class="not-null">⚹</span>
                    </div>
                    <v-btn @click="openModal('approver')" :disabled="selectedProjectId === null">조회</v-btn>
                </div>
                <div class="approval-participant">
                    {{ selectedApprover?.name || '선택 안됨' }}
                </div>

                <div class="approval-participant">
                <template v-if="!selectedApprover || selectedApprover.length === 0">
                    선택 안됨
                </template>
                <template v-else>
                    <span v-for="(user, index) in selectedApprover" :key="user.id">
                    {{ user.name }}<span v-if="index < selectedApprover.length - 1">, </span>
                    </span>
                </template>
                </div>
            </div>
            <br>
            <div class="participant-box">
                <div class="sub-area">
                    <div class="participant-title">참조자</div>
                    <v-btn @click="openModal('viewer')">조회</v-btn>
                </div>
                <div class="approval-participant" @click.stop="toggleViewerList">
                    {{ 
                        selectedViewers.length === 0 
                        ? '선택 안됨' 
                        : selectedViewers.length === 1
                            ? selectedViewers[0].name
                            : `${selectedViewers[0].name} 외 ${selectedViewers.length - 1}명` }}
                </div>
                <!-- 전체 리스트 드롭다운 -->
                <div
                    v-if="showViewerList"
                    class="viewer-list-dropdown"
                >  
                    <div>전체 참조자 목록</div>
                    <ul>
                        <li v-for="viewer in selectedViewers" :key="viewer.id">
                            {{ viewer.name }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </v-container>
    <div style="display:flex; justify-content: end;">
        <v-btn 
            class="create-btn" 
            @click="createApproval"
        >
            보내기
        </v-btn>
    </div>
    <ParticipantSelectModal
        v-if="showModal"
        :type="modalType"
        :userList="filteredUserListForModal"
        :selectedApprover="selectedApprover"
        :selectedViewers="selectedViewers"
        @close="showModal = false"
        @select="handleUserSelect"
    />
</template>

<script setup>
import api from '@/api';
import { ref, onMounted, computed, watch } from 'vue'
import ParticipantSelectModal from './ParticipantSelectModal.vue';

const emit = defineEmits(['remount'])

const delayResons = ref([])
const projectList = ref([])
const taskList = ref([])
const filteredTaskList = computed(() => {
    return taskList.value[selectedProjectId.value]
})
const approvalTypeList = [ '일반', '산출물', '지연' ]
const projectIds = ref([])
// 참여자 리스트
const participantList = ref([])

const filteredParticipants = computed(() => {
  if (!selectedProjectId.value) return []
  console.log("프로젝트 선택함")
  console.log(participantList.value[selectedProjectId.value])
  return participantList.value[selectedProjectId.value] || []
})

const filteredUserListForModal = computed(() => {
    if (modalType.value === 'viewer' && selectedApprover.value) {
        console.log('filterUserList', filteredParticipants.value)
        return filteredParticipants.value.filter(user => user.id !== selectedApprover.value.id) 
    }
    return filteredParticipants.value
})
// 테스트용
const showModal = ref(false)
const modalType = ref('') // 'approver','viewer'

// 결재자, 참조자
const selectedApprover = ref(null)
const selectedViewers = ref([])


watch(selectedApprover, (newApprover) => {
    if (!newApprover) return
    selectedViewers.value = selectedViewers.value.filter(v => v.id !== newApprover.id)
})

function openModal(type) {
    modalType.value = type
    showModal.value = type
}

function handleUserSelect(selectedUsers) {
    console.log("선택됨", selectedUsers)
    if (modalType.value === 'approver') {
        selectedApprover.value = selectedUsers || null
    } else {
        selectedViewers.value = selectedUsers || null
    }
    showModal.value = false
}

const showViewerList = ref(false)
function toggleViewerList() {
    showViewerList.value = !showViewerList.value
}

const title = ref('')
const selectedProjectId = ref(null)
const selectedTaskId = ref(null)
const approvalType = ref('')
const approvalTypeMap = {
    '일반': 'GENERAL',
    '산출물': 'DELIVERABLE',
    '지연': 'DELAY'
}
const selectedDelayReasonId = ref(null)
const content = ref('')

// type이 DELAY 일 경우에만 필수
const delayDays = ref(null)
const actionDetail = ref('')
const selectedFiles = ref([])

const isDelay = computed(() => approvalType.value === '지연')

const isFormValid = computed(() => {
    const type = approvalTypeMap[approvalType.value]

    const baseValid = 
        title.value.trim() &&
        content.value.trim() &&
        selectedProjectId.value !== null &&
        selectedTaskId.value !== null &&
        type &&
        selectedApprover.value?.id

    const delayValid = 
        type !== 'DELAY' || (
            delayDays.value !== null &&
            selectedDelayReasonId.value !== null &&
            actionDetail.value.trim()
        )
    
    return baseValid && delayValid
})

function handleFileChange(event) {
    const files = Array.from(event.target.files)
    selectedFiles.value = files
}

onMounted(async() => {
    const projectResponse = await api.get('/api/projects/list')
    projectList.value = projectResponse.data.data
    projectIds.value = projectList.value.map(p => p.id)
    const delayResponse = await api.get('/api/approval/delay-reason')
    delayResons.value = delayResponse.data.data
    const taskResponse = await api.post('/api/projects/tasks/list', {
        projectIds: projectIds.value
    })
    taskList.value = taskResponse.data.data

    // 참여자에서 결재자, 참조자 설정
    const participantResponse = await api.post('/api/projects/participants/list', {
        projectIds: projectIds.value
    })
    participantList.value = participantResponse.data.data
    console.log('프로젝트별 참여자 목록', participantList.value)

    // Map<Long, User> 형태로 받을 것 프로젝트 ids로 참여자 조회해오기
})

async function createApproval() {
    if (!isFormValid.value) {
        alert('입력하지 않은 영역이 있습니다.')
        return
    }
    const formData = new FormData();

    formData.append('title', title.value)
    formData.append('projectId', selectedProjectId.value)
    formData.append('taskId', selectedTaskId.value)
    formData.append('type', approvalTypeMap[approvalType.value])
    formData.append('content', content.value)
    formData.append('approverId', selectedApprover.value.id)
    
    selectedViewers.value.forEach(viewer => {
        formData.append('viewerIds', viewer.id)
    })

    if (selectedFiles.value && selectedFiles.value.length > 0) {
        selectedFiles.value.forEach(file => {
            formData.append('attachment', file)
        })
    }

    if (approvalTypeMap[approvalType.value] === 'DELAY') {
        formData.append('delayDays', delayDays.value)
        formData.append('delayReasonId', selectedDelayReasonId.value)
        formData.append('actionDetail', actionDetail.value)
    }

    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
    }

    try {
        const response = await api.post('/api/approval/request', formData)

        alert(response.data.message)
        emit('remount')
    } catch (error) {
        if (error.response) {
            console.error('에러 응답:', error.response.data);
            alert(error.response.data.message);
        }
    }
}
</script>

<style scoped>
.not-null {
  color: red;
  margin-left: 4px;
}
.approval-participant {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px;
  min-height: 36px;
  background-color: #f9f9f9;
}
.v-text-field text{
    height: 30px;
}
</style>