<template>
  <div class="task-main-container">
    <div class="tab-row">
      <div class="tab-menu">
        <button v-for="tab in tabs" :key="tab.name" @click="selectedTab = tab.name"
          :class="['tab-button', { active: selectedTab === tab.name }]">
          {{ tab.label }}
        </button>
      </div>
      <v-btn color="#7578ee" variant="flat" prepend-icon="mdi-plus" class="schedule-button" @click="openModal">
        세부일정 생성
      </v-btn>
    </div>

    <component 
      :is="selectedComponent"
      v-bind="getTabProps"
      :task-id="taskData.selectTask.taskId"
      :work-id="openWorkId"
    />

    <v-dialog v-model="showModal" max-width="700">
      <v-card style="padding: 5%; ">
        <v-card-title class="text-h6 font-weight-bold d-flex justify-space-between align-center">
          <span>세부 일정 생성</span>
          <v-btn icon @click="closeModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitForm">
            <v-text-field label="세부 일정 제목" v-model="form.title" required></v-text-field>
            <v-textarea label="세부 일정 설명" v-model="form.description" required></v-textarea>

            <div class="inline-fields-baseline">
              <!-- 주말 & 공휴일 예외 처리 반영 -->
              <v-text-field
                label="시작 베이스라인"
                v-model="form.startDate"
                type="date"
                @change="handleStartDateChange"
                :error="!!startDateError"
                :error-messages="startDateError"
                required
                style="width: 50%;"
              />

              <v-text-field
                label="마감 베이스라인"
                v-model="form.endDate"
                type="date"
                @change="handleEndDateChange"
                :error="!!endDateError"
                :error-messages="endDateError"
                required
                :min="form.startDate"
                style="width: 50%;"
              />
              <!-- <v-text-field label="시작 베이스라인" v-model="form.startDate" type="date" required />
              <v-text-field label="마감 베이스라인" v-model="form.endDate" type="date" required /> -->
            </div>
            
            <!-- 워크데이 소요일 표시 -->
            <div v-if="workingDuration !== null" class="mt-2">
              <v-alert type="info" density="compact" variant="tonal">
                워크데이 기준 소요일: <strong>{{ workingDuration }}일</strong>
              </v-alert>
            </div>

            <div class="inline-fields">
              <div class="field-container">
                <div class="label-container">
                  <span>선행 일정</span>
                  <v-btn icon @click="addPrecedingTask"><v-icon>mdi-plus</v-icon></v-btn>
                </div>
                <v-select v-for="(task, i) in form.precedingTasks" :key="i" v-model="form.precedingTasks[i]"
                  :items="tasks" item-title="name" item-value="id" label="선행 일정 선택" />
              </div>
              <div class="field-container">
                <div class="label-container">
                  <span>후행 일정</span>
                  <v-btn icon @click="addFollowingTask"><v-icon>mdi-plus</v-icon></v-btn>
                </div>
                <v-select v-for="(task, i) in form.followingTasks" :key="i" v-model="form.followingTasks[i]"
                  :items="tasks" item-title="name" item-value="id" label="후행 일정 선택" />
              </div>
            </div>
            <!-- 담당 부서 & 책임자 & 참여자 -->
            <v-select label="담당 부서" v-model="form.department" :items="departments" item-title="deptName"
              item-value="deptId" return-object @update:modelValue="fetchUsersForDepartment" required />

            <v-select label="책임자" v-model="form.responsible" :items="users" item-title="name" item-value="id"
              required />

            <v-label class="mt-4">참여자:</v-label>
            <v-checkbox v-for="user in users" :key="user.id" v-model="form.participants" :label="user.name"
              :value="user.id" density="compact" />


            <v-btn type="submit" class="mt-4" color="#7578ee" :loading="isSubmitting">추가</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>


<script setup>
import { useRoute } from "vue-router";
import { ref, computed, onMounted, watch } from 'vue'
import TaskInfoTab from '@/components/task/TaskInfoTab.vue'
import TaskApprovalTab from '@/components/task/TaskApprovalTab.vue'
import TaskAttachmentTab from '@/components/task/TaskAttachmentTab.vue'
import TaskParticipantTab from '@/components/task/TaskParticipantTab.vue'
import DetailTab from './DetailTab.vue'
import { defineEmits } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useTaskStore } from "@/stores/taskStore"; // Pinia store 임포트
import api from '@/api';
import { useHolidayStore } from '@/stores/holidayStore'
import dayjs from 'dayjs'
import { useUpdateStore } from '@/stores/updateStore'

const updateStore = useUpdateStore()

// 주말/공휴일 예외 처리 목적
const holidayStore = useHolidayStore()
const startDateError = ref('')
const endDateError = ref('')
const holidaySet = computed(() => holidayStore.holidaySet)

watch(
  () => updateStore.shouldRefreshDeptList,
  (val) => {
    if (val) {
      fetchDepartments()             // 실제 다시 불러오기
      fetchTasks()
      updateStore.acknowledgeDeptListUpdate() // 신호 초기화
    }
  }
)



// 워크 데이 기반 소요일
const workingDuration = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return null;

  const start = new Date(form.value.startDate);
  const end = new Date(form.value.endDate);
  let count = 0;
  const date = new Date(start);

  const holidays = holidaySet.value; // Set<string>

  while (date <= end) {
    const iso = date.toISOString().slice(0, 10);
    const day = date.getDay(); // 일(0), 토(6)
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.has(iso);

    if (!isWeekend && !isHoliday) {
      count++;
    }
    date.setDate(date.getDate() + 1);
  }

  return count;
});


onMounted(() => {
  if (holidayStore.holidaySet.size === 0) {
    holidayStore.fetchHolidays()
  }
})


const route = useRoute()

const emit = defineEmits()

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    department: '',
    precedingTasks: [],
    followingTasks: [],
    responsible: '',
    participants: []
  }
  startDateError.value = ''
  endDateError.value = ''
  users.value = []
}

const openModal = () => {
  console.log("버튼 클릭됨!")
  resetForm()
  showModal.value = true // 모달을 열기 위해 상태값을 true로 설정
}


const closeModal = () => {
  showModal.value = false // 모달을 닫기 위해 상태값을 false로 설정
}

const showModal = ref(false);
const form = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  department: '',
  precedingTasks: [],
  followingTasks: [],
  responsible: '',
  participants: [], // 참여자 배열
});

const isSubmitting = ref(false);

// 폼 제출 처리
const submitForm = async () => {
  if (isSubmitting.value) return; // 이미 제출 중이면 막기

  isSubmitting.value = true; // 제출 중 상태

  // 필수 입력 체크
  if (!form.value.department) {
    alert('부서를 선택해주세요.');
    isSubmitting.value = false;
    return;
  }
  if (!form.value.title || !form.value.description || !form.value.startDate || !form.value.endDate) {
    alert('필수 항목이 비어있습니다. 모든 항목을 채워주세요.');
    isSubmitting.value = false;
    return;
  }
  if (!form.value.responsible) {
    alert('책임자를 입력해주세요.');
    isSubmitting.value = false;
    return;
  }
  if (!form.value.participants || form.value.participants.length === 0) {
    alert('참여자를 입력해주세요.');
    isSubmitting.value = false;
    return;
  }
  if (holidayStore.isHoliday(form.value.startDate) || holidayStore.isHoliday(form.value.endDate)) {
    alert('주말이나 공휴일은 시작일 또는 마감일로 사용할 수 없습니다.')
    isSubmitting.value = false
    return
  }
  if (dayjs(form.value.endDate).isBefore(form.value.startDate)) {
    alert('마감일은 시작일보다 빠를 수 없습니다.')
    isSubmitting.value = false
    return
  }

  console.log(form.value.precedingTasks);
  console.log(form.value.followingTasks);
  console.log('End Date:', form.value.endDate);  // 추가해서 값을 확인

    // 선행 일정과 후행 일정이 비어 있으면 빈 배열로 설정하고, 빈 문자열이 포함되면 빈 배열로 처리
  const precedingTasks = form.value.precedingTasks && form.value.precedingTasks.length > 0
    ? form.value.precedingTasks.filter(task => task !== "") // 빈 문자열 제외
    : [];
  const followingTasks = form.value.followingTasks && form.value.followingTasks.length > 0
    ? form.value.followingTasks.filter(task => task !== "") // 빈 문자열 제외
    : [];


  // 요청 데이터 구성
  const requestData = {
    projectId: sessionStorage.getItem('projectId'), // 세션에서 프로젝트 ID
    parentTaskId: props.taskData.selectTask.taskId, // 부모 작업 ID
    name: form.value.title, // 제목
    description: form.value.description, // 설명
    startBase: form.value.startDate, // 시작 베이스라인
    endBase: form.value.endDate, // 마감 베이스라인
    deptId: form.value.department.deptId, // 부서 ID
    source: Array.from(precedingTasks), // Proxy 객체를 배열로 변환
    target: Array.from(followingTasks), // Proxy 객체를 배열로 변환
    assigneeId: form.value.responsible, // 책임자 ID
    participantIds: Array.from(form.value.participants), // Proxy 객체를 배열로 변환
  };

  console.log(requestData)
  // 토큰과 taskId를 넘겨서 store의 createItem 메서드 호출
  const userStore = useUserStore();
  const token = userStore.accessToken;

  if (!token) {
    console.error('토큰이 없습니다.');
    isSubmitting.value = false;
    return;
  }

  const taskStore = useTaskStore();
  const result = await taskStore.createItem(requestData, props.taskData.selectTask.taskId, token);



  if (result) {
    // 성공적인 처리 후 추가 동작 (예: 모달 닫기)
    updateStore.triggerTaskInfoUpdate()  // 태스크 정보 리프레시 트리거
    closeModal();
    

  }

  isSubmitting.value = false;
};

// 주말/공휴일 예외 처리
const handleStartDateChange = (e) => {
  const date = e.target.value

  if (holidayStore.isHoliday(date)) {
    startDateError.value = '시작일로 주말이나 공휴일은 선택할 수 없습니다.'
    form.value.startDate = ''
    return
  }

  if (form.value.endDate && dayjs(date).isAfter(form.value.endDate)) {
    endDateError.value = '마감일은 시작일보다 빠를 수 없습니다.'
    form.value.endDate = ''
  }

  startDateError.value = ''
  form.value.startDate = date
}

const handleEndDateChange = (e) => {
  const date = e.target.value

  if (holidayStore.isHoliday(date)) {
    endDateError.value = '마감일로 주말이나 공휴일은 선택할 수 없습니다.'
    form.value.endDate = ''
    return
  }

  if (form.value.startDate && dayjs(date).isBefore(form.value.startDate)) {
    endDateError.value = '마감일은 시작일보다 빠를 수 없습니다.'
    form.value.endDate = ''
    return
  }

  endDateError.value = ''
  form.value.endDate = date
}



const addPrecedingTask = () => form.value.precedingTasks.push("") // 선행 일정 추가
const addFollowingTask = () => form.value.followingTasks.push("") // 후행 일정 추가

const props = defineProps({
  taskData: {
    type: Object,
    required: true
  },
  detailList: {
    type: Array,
    required: true
  }
});

const tabs = [
  { name: 'info', label: '태스크 정보', component: TaskInfoTab },
  { name: 'detail', label: '세부 일정', component: DetailTab },
  { name: 'approval', label: '결재 내역', component: TaskApprovalTab },
  { name: 'attachments', label: '자료 검색', component: TaskAttachmentTab },
  { name: 'participants', label: '태스크 참여자', component: TaskParticipantTab }
]

const selectedTab = ref('info')
const selectedComponent = computed(() => {
  return tabs.find(tab => tab.name === selectedTab.value)?.component || TaskInfoTab
})

const tasks = ref([]) // task 목록을 저장할 배열

// API 호출을 위한 함수
const fetchTasks = async () => {
  const userStore = useUserStore()
  const token = userStore.accessToken

  if (!token) {
    console.error("토큰이 없습니다.")
    return
  }

  try {
    const response = await api.get(`/api/work/detail/nameList`, {
      params: { parentTaskId: props.taskData.selectTask.taskId }
    });

    if (response.status === 200) {
      tasks.value = response.data.data; // API 응답에서 task 목록을 tasks에 저장
    } else {
      console.error('API 호출 실패', response.data.message);
    }
  } catch (error) {
    console.error('API 호출 오류', error);
  }
}


const departments = ref([])

const fetchDepartments = async () => {
  const userStore = useUserStore()
  const token = userStore.accessToken

  if (!token) {
    console.error("토큰이 없습니다.")
    return
  }

  try {
    const response = await api.get(`/api/dept/task/${props.taskData.selectTask.taskId}`)
    if (response.status === 200) {
      departments.value = response.data.data; // 부서 데이터를 departments에 저장
    } else {
      console.error("부서 데이터를 가져오는 데 실패했습니다:", response.status);
    }
  } catch (error) {
    console.error("부서 데이터를 불러오는 데 실패했습니다:", error);
  }
}


const users = ref([]) // task 목록을 저장할 배열

const fetchUsersForDepartment = async () => {
  const selectedDept = form.value.department; // 이미 객체임
  if (!selectedDept || !selectedDept.deptName) return;

  const deptName = selectedDept.deptName;
  const userStore = useUserStore();
  const token = userStore.accessToken;

  try {
    const response = await api.get(`/api/users/dept`, {
      params: { deptName }
    });

    if (response.status === 200) {
      users.value = response.data.data;
      console.log("📁부서별 회원 목록 조회 성공", users.value)
    } else {
      console.error("사용자 데이터를 가져오는 데 실패했습니다:", response.status);
    }
  } catch (error) {
    console.error("사용자 데이터를 불러오는 데 실패했습니다:", error);
  }
};


const openWorkId = ref(null)

// 컴포넌트가 마운트된 후 API 호출
onMounted(() => {
  fetchDepartments()
  fetchTasks()

  // 👉 쿼리 파라미터로 전달된 tab과 openModal 처리
  
  // tab 전환
  const tabFromQuery = route.query.tab
  if (tabFromQuery && tabs.find(t => t.name === tabFromQuery)) {
    selectedTab.value = tabFromQuery
  }

  // 디테일 모달 열기 요청 처리
  if (route.query.tab === 'detail' && route.query.openModal === 'true' && route.query.workId) {
    selectedTab.value = 'detail'
    openWorkId.value = Number(route.query.workId)  // 💡 디테일 탭 열릴 때 workId 설정
  }

})

const getTabProps = computed(() => {
  if (!props.taskData) return {}  // 안전 장치

  switch (selectedTab.value) {
    case 'info':
      return { taskData: props.taskData, detailList: props.detailList }
    case 'participants':
      return { taskData: props.taskData }
    case 'detail':
      return { taskData: props.taskData, detailList: props.detailList }
    case 'approval':
      return { taskData: props.taskData }
    case 'attachments':
      return { taskData: props.taskData }
    default:
      return {}
  }
})


</script>

<style scoped>
.tab-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.tab-menu {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #ccc;
}

.tab-button {
  font-size: 15px;
  color: #444;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: 0.2s;
}

.tab-button.active {
  font-weight: bold;
  color: #000;
  border-color: #000;
}

.schedule-button {
  background-color: #7578ee;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 40px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 2%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 20px 40px;
  border-radius: 0px;
  width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  margin-top: 50px;
  position: relative;
}

label {
  margin-top: 10px;
  font-weight: bold;
}

input,
select,
textarea {
  width: 100%;
  padding: 1px 6px;
  margin-top: 3px;
  border: 1px solid #ddd;
}

textarea {
  height: 80px;
}

hr {
  margin: 20px 0;
  border: 1px solid #ddd;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 40px;
  font-size: 25px;
  cursor: pointer;
  color: #000;
  font-weight: bold;
  background-color: transparent;
  border: none;
  padding: 5px;
}

.inline-fields {
  display: flex;
  justify-content: space-between;
  gap: 30px;
}

.field-container {
  flex: 1;
}

.field-group {
  margin-top: 5px;
  display: flex;
  align-items: center;
}

/* 날짜 선택 부분을 flex로 가로 정렬 */
.inline-fields-baseline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-direction: row;
}

.baseline-group {
  margin-top: 5px;
}

.date-group {
  flex: 1;
}

.depart {
  width: 200px;
  margin-left: 10px;
}

.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-btn {
  background-color: transparent;
  border: 2px solid black;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  color: black;
  font-weight: bold;
  text-align: center;
  line-height: 10px;
  cursor: pointer;
  padding: 0;
}

.add-btn:hover {
  background-color: #f0f0f0;
}

form>div {
  margin-bottom: 20px;
}

.submit-btn {
  background-color: white;
  color: black;
  border: 1px solid #000;
  border-radius: 5px;
  padding: 8px 20px;
  position: absolute;
  /* 위치를 절대 위치로 설정 */
  right: 40px;
}

.submit-btn:hover {
  background-color: grey;
}

.suggestions-list {
  position: absolute;
  z-index: 10;
  border: 1px solid #ccc;
  background-color: white;
  width: 605px;
  /* 입력 필드와 동일한 너비 */
  max-height: 150px;
  overflow-y: auto;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  /* 그림자 추가 */
}

.suggestions-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.suggestions-list li {
  padding: 8px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}

/* 참여자 체크박스 표 스타일 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

/* 체크박스와 레이블 간 간격 */
input[type="checkbox"] {
  margin-right: 10px;
}
</style>