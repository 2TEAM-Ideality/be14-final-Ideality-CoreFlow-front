<template>
  <BasicLayout>
    <template #main>
      <div class="page-title" >{{ createApprovalTitle ||  '결재 요청' }}</div>
      <v-row>
        <v-col>
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold">결재 제목</span>
            <span class="not-null">*</span>
          </div>
          <v-text-field density="compact" v-model="title" placeholder="제목 입력" variant="outlined" :style="{ width: '100%' }" />
        </v-col>
      </v-row>

      <!-- 프로젝트/태스크 선택 -->
      <v-row>
        <v-col cols="6">
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold">해당 프로젝트</span>
            <span class="not-null">*</span>
          </div>
          <v-select density="compact" v-model="selectedProjectId" :items="projectList" item-title="name" item-value="id" placeholder="프로젝트 선택" variant="outlined" />
        </v-col>
        <v-col cols="6">
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold">해당 태스크</span>
            <span class="not-null">*</span>
          </div>
          <v-select density="compact" v-model="selectedTaskId" :items="filteredTaskList" item-title="name" item-value="id" placeholder="태스크 선택" :disabled="!selectedProjectId" variant="outlined" />
        </v-col>
      </v-row>

      <!-- 결재자 -->
      <div class="d-flex align-center mb-1">
        <span class="text-subtitle-2 font-weight-bold">결재자</span>
        <span class="not-null">*</span>
        <v-btn  v-if="selectedApprover === null" @click="openModal('approver')" :disabled="selectedProjectId === null" size="small" color="#7578ee" variant="tonal" style="margin-right:10px;">
          <span>조회</span>
        </v-btn>
        <div v-if="selectedProjectId === null" class="text-grey text-body-2">프로젝트를 선택해주세요.</div>
        
      </div>
      <v-chip
              style=" width: fit-content;"
              v-if="selectedApprover"
              closable
              class="participant-chip"
              @click:close="selectedApprover = null"
          >
              <v-icon size="20" class="mr-2">mdi-account-check</v-icon>
              {{ selectedApprover.deptName }} {{ selectedApprover.name }} {{ selectedApprover.jobRankName }}
          </v-chip>
    

      <!-- 참조자 -->
      <div class="d-flex align-center mb-1 mt-4">
        <span class="text-subtitle-2 font-weight-bold">참조자</span>
        <span class="not-null">*</span>
        <v-btn @click="openModal('viewer')" :disabled="selectedProjectId === null"  size="small" color="#7578ee" variant="tonal"  style="margin-right:10px;">
          <span v-if="selectedViewers === null">조회</span>
          <span v-else>편집</span>
        </v-btn>
        <div v-if="selectedProjectId === null" class="text-grey text-body-2">프로젝트를 선택해주세요.</div>
      </div>
      <div class="d-flex flex-row gap-3 flex-wrap">
      <v-chip-group>
        <v-chip
          v-for="user in selectedViewers"
          :key="user.id"
          closable
          class="participant-chip"
          @click:close="removeViewer(user.id)"
        >
          <v-icon size="20" class="mr-2">mdi-account-search</v-icon>
          {{ user.deptName }} {{ user.name }} {{ user.jobRankName }}
        </v-chip>
      </v-chip-group>
      </div>

      <!-- 구분 -->
      <v-row>
        <v-col>
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold">구분</span>
            <span class="not-null">*</span>
          </div>
          <v-select density="compact" v-model="approvalType" :items="approvalTypeList" placeholder="결재 구분" variant="outlined" />
        </v-col>
      </v-row>

      <!-- 지연 정보 -->
      <v-row v-if="isDelay">
        <v-col cols="6">
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold">지연 사유</span>
            <span class="not-null">*</span>
          </div>
          <v-select density="compact" v-model="selectedDelayReasonId" :items="delayResons" item-title="reason" item-value="id" placeholder="사유 선택" variant="outlined" />
        </v-col>
        <v-col cols="6">
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold">지연일</span>
            <span class="not-null">*</span>
            <div v-if="delayDays" style="font-size: 12px;">변경 예상 마감일: {{ addWorkingDays(selectTask?.endExpect, delayDays) }}</div>
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
          <v-textarea density="compact" v-model="content" auto-grow variant="outlined" :style="{ width: '100%' }" />
        </v-col>
      </v-row>

      <!-- 조치 내용 -->
      <v-row v-if="isDelay">
        <v-col>
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold">조치 내용</span>
            <span class="not-null">*</span>
          </div>
          <v-textarea density="compact" v-model="actionDetail" auto-grow variant="outlined" :style="{ width: '100%' }" />
        </v-col>
      </v-row>

      <!-- 첨부파일 -->
      <v-row>
        <v-col>
          <div class="d-flex align-center mb-1">
            <span class="text-subtitle-2 font-weight-bold">첨부파일</span>
          </div>
          <v-file-input density="compact" v-model="selectedFiles" label="파일 선택" multiple show-size variant="outlined" :style="{ width: '100%' }" />
        </v-col>
      </v-row>

      <div class="d-flex justify-end">
        <v-btn class="create-btn" @click="checkCreateApproval" color="#7578ee">결재 요청</v-btn>
      </div>
      
    </template>
    <template #sidebar>
        <InfoField label="기안자" icon="mdi-account-arrow-up" :value="createdBy" />
        <InfoField label="결재자" icon="mdi-account-check" 
        :value="selectedApprover ? `${selectedApprover.deptName} ${selectedApprover.name} ${selectedApprover.jobRankName}` : ''" />
        
        <div class="sidebar-section-label">
          <span class="icon-wrapper">
            <v-icon size="18">mdi-account-eye</v-icon>
          </span>
          <span>참조자</span>
        </div>

        <!-- 참조자 없을 때 문구 -->
        <div v-if="!selectedViewers || selectedViewers.length === 0" class="text-grey text-body-2 ml-1 mb-3"
        style="text-align:left;">
          참조자 선택되지 않음
        </div>
        <!-- Chip 목록 -->
        <div class="chip-container" v-if="selectedViewers && selectedViewers.length">
          <v-chip
            v-for="viewer in selectedViewers"
            :key="viewer.id"
            class="ma-1"
            size="small"
            color="#7578ee"
            text-color="black"
            variant="outlined"
          >
            {{ viewer.name }}
          </v-chip>
        </div>

        <!-- selectedViewers -->
        <!-- <InfoField label="참조자" icon="mdi-calendar" :value="selectedApprover" /> -->
        <InfoField label="기안일" icon="mdi-calendar" :value="createdAt" />


    </template>

  </BasicLayout>

  <ParticipantSelectModal
    v-if="showModal"
    :type="modalType"
    :userList="filteredUserListForModal"
    :selectedApprover="selectedApprover"
    :selectedViewers="selectedViewers"
    @close="showModal = false"
    @select="handleUserSelect"
  />

    <!-- 결재 요청 확인 모달 -->
    <v-dialog v-model="showCreateCheck" max-width="600px" persistent>
      <v-card style="padding: 5%;">
        <v-card-title class="text-h6 font-weight-bold">결재 요청 정보를 확인해주세요.</v-card-title>
        <v-card-text style="display :flex; flex-direction: column; gap: 15px;">
          <div class="mb-3">
            <div class="section-label">{{ title }}</div>
           
            제목:  {{ title }}
            프로젝트: {{ project }}
            태스크: 샘플 테스트 완료
            결재자: 기획팀 김민수 차장
            참조자: 품질관리팀, 영업팀
            구분: {{approvalType}}
            지연 사유: 외주사 테스트 지연
            지연일: {{ delayDays }}
            조치 내용: {{ content }}

          </div>



        </v-card-text>

        <v-card-actions class="d-flex justify-end">
            <v-btn variant="text" @click="showCreateCheck = false">취소</v-btn>
            <v-btn class="color-button" @click="createApproval">확인</v-btn>
          </v-card-actions>
      </v-card>

    </v-dialog>
</template>


<script setup>
import BasicLayout from '@/components/layout/BasicLayout.vue'
import api from '@/api';
import { ref, onMounted, computed, watch } from 'vue'
import ParticipantSelectModal from './ParticipantSelectModal.vue';
import { useRouter } from 'vue-router'
import InfoField from '@/components/common/SideInfoField.vue'
import { useUserStore } from '@/stores/userStore';
import { useRoute } from 'vue-router'


const route = useRoute()

const createApprovalTitle = ref(null)

const selectTask = computed(() => {
    return filteredTaskList.value.find(t => t.id === selectedTaskId?.value)
})

const router = useRouter(); 
const user = useUserStore();
const emit = defineEmits(['remount'])

const showCreateCheck = ref(false)  // 결재 요청 확인 모달

const delayResons = ref([])
const projectList = ref([])
const taskList = ref([])
const filteredTaskList = computed(() => {
    return taskList.value[selectedProjectId.value] || []
})
const approvalTypeList = [ '일반', '산출물', '지연' ]
const projectIds = ref([])
// 참여자 리스트
const participantList = ref([])


const formatDate = (date) => {
  const pad = (n) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}


// 자동 입력 정보
const createdBy = computed(() => {
  return `${user.deptName} ${user.name} ${user.jobRankName}`
})
const createdAt = ref(formatDate(new Date()))


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

const holidaySet = ref(new Set()); 

const addWorkingDays = (startDate, daysToAdd) => {
  if (!startDate) return
  const start = new Date(startDate);
  let addedDays = 0;
  console.log('expectEnd', selectTask.value?.expectEnd)

  const date = new Date(start)
  const holidays = holidaySet.value;
  while (addedDays < daysToAdd) {
    date.setDate(date.getDate() + 1)
    const iso = date.toISOString().slice(0, 10);
    const day = date.getDay(); // 일(0), 토(6)
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.has(iso);
    
    if (!isWeekend && !isHoliday) {
      addedDays++;
    }
  }

  return date.toISOString().slice(0, 10);
}

// 전체 휴일 정보 가져오기 
const fetchAllHolidays = async () => {
  try {
    console.log("📡 공휴일 요청 시작");
    const res = await api.get('/api/holidays');

    const list = res.data?.data?.holidays || [];  // ✅ 핵심 수정
    holidaySet.value = new Set(list.map(h => h.date)); // ✅ date만 추출해서 Set으로

    console.log("✅ 공휴일 로딩 완료:", holidaySet.value);
  } catch (err) {
    console.error('❌ 공휴일 로딩 실패:', err);
  }
};

watch(selectedApprover, (newApprover) => {
    if (!newApprover) return
    selectedViewers.value = selectedViewers.value.filter(v => v.id !== newApprover.id)
})

function openModal(type) {
    modalType.value = type
    showModal.value = type
}

function handleUserSelect(selectedUsers) {
  if (modalType.value === 'approver') {
    // 첫 번째 요소만 저장
    selectedApprover.value = Array.isArray(selectedUsers) ? selectedUsers[0] : selectedUsers
  } else {
    selectedViewers.value = selectedUsers || []
  }
  showModal.value = false
}

const goBack = () => {
  router.back()
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

onMounted(async () => {
  // 프로젝트 목록 조회
  const projectResponse = await api.get('/api/projects/list')
  projectList.value = projectResponse.data.data
  projectIds.value = projectList.value.map(p => p.id)

  // 태스크 목록 조회 (프로젝트별)
  const taskResponse = await api.post('/api/projects/tasks/list', {
    projectIds: projectIds.value
  })
  taskList.value = taskResponse.data.data

  
  // 참여자 목록 조회 (프로젝트별)
  const participantResponse = await api.post('/api/projects/participants/list', {
    projectIds: projectIds.value
  })
  participantList.value = participantResponse.data.data

  // 지연 사유 목록 조회
  const delayResponse = await api.get('/api/approval/delay-reason')
  delayResons.value = delayResponse.data.data

  // URL 쿼리에서 taskId 파라미터가 있으면
  const tid = route.query.taskId
  const pid = route.query.projectId
  const type = route.query.type
  
  if(pid){
    selectedProjectId.value = Number(pid)
  }
  else if (tid) {
    selectedTaskId.value = Number(tid)

    // 해당 태스크가 속한 프로젝트 찾기
    for (const [targetProjectId, tasks] of Object.entries(taskList.value)) {
      if (tasks.some(t => String(t.id) === String(tid))) {
        selectedProjectId.value = Number(targetProjectId)
        break
      }
    }
  }

  if (selectedTaskId.value !== null && type === 'delay') {
    fetchWarningDate()
  }
  fetchAllHolidays()

  // ✅ type 파라미터에 따라 결재 제목 + 유형 자동 설정
  if (type === 'delay') {
    createApprovalTitle.value = '지연 사유서 작성'
    approvalType.value = '지연'
  } else if (type === 'output') {
    createApprovalTitle.value = '산출물 작성'
    approvalType.value = '산출물'
  } else {
    createApprovalTitle.value = '결재 요청'
    approvalType.value = '일반'
  }

  console.log('✅ 자동 선택된 태스크:', selectedTaskId.value)
  console.log('✅ 자동 선택된 프로젝트:', selectedProjectId.value)
})

async function fetchWarningDate() {
  try {
    const res = await api.get(`/api/task/${selectedTaskId.value}/warningDate`)
    const expectDelay = res.data.data
    console.log("지연 예상일", expectDelay)
    delayDays.value = expectDelay
  } catch(e) {

  }
}

// 결재 요청 확인
const checkCreateApproval = async () => {
    if (!isFormValid.value) {
        alert('입력하지 않은 영역이 있습니다.')
        return
    }
    await createApproval();

    showCreateCheck.value = false;
    // router.push('/approval')
}

async function createApproval() {

  const confirmed = confirm('결재를 상신하시겠습니까')

  if (!confirmed) return
    
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
            formData.append('attachmentFile', file)
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
      // alert(response.data.message)
      router.push('/approval')
      // emit('remount')
      resetForm() // 🔥 여기에 추가
    } catch (error) {
      if (error.response) {
        console.error('에러 응답:', error.response.data)
        alert(error.response.data.message)
      }
    }
}

// 입력창 모두 리셋
function resetForm() {
  title.value = ''
  selectedProjectId.value = null
  selectedTaskId.value = null
  approvalType.value = ''
  selectedDelayReasonId.value = null
  content.value = ''
  delayDays.value = null
  actionDetail.value = ''
  selectedApprover.value = null
  selectedViewers.value = []
  selectedFiles.value = []
}
</script>

<style scoped>
.approval-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: white;
}
.not-null {
  color: red;
  margin-left: 4px;
  margin-right: 10px;
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
.list-layout {
  padding: 7% 15%;
  min-height: 100vh;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 50px;
  text-align: left;
}


.sidebar-field {
  margin-bottom: 12px;
}

.sidebar-section-label {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: gray;
}

</style>