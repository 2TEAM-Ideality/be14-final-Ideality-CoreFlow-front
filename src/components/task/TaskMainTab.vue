<template>
  <div class="task-main-container">
    <div class="tab-row">
      <div class="tab-menu">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          @click="selectedTab = tab.name"
          :class="['tab-button', { active: selectedTab === tab.name }]">
          {{ tab.label }}
        </button>
      </div>
      <button class="schedule-button" @click="openModal">+ 세부일정 생성</button>
    </div>

    <!-- 선택된 탭에 맞는 컴포넌트를 표시 -->
    <component
      :is="selectedComponent"
      v-bind="selectedTab === 'info' ? { taskData } : {}"
      :task-id="taskData.selectTask.taskId"
    />

    <!-- 모달이 열릴 때만 표시 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>세부 일정 생성</h2>
        <span class="close-btn" @click="closeModal">X</span>
        <hr />
        <form @submit.prevent="submitForm">
          <div>
            <label for="title">세부 일정 제목:</label>
            <input type="text" id="title" v-model="form.title" required />
          </div>

          <div>
            <label for="description">세부 일정 설명:</label>
            <textarea id="description" v-model="form.description" required></textarea>
          </div>

          <div class="inline-fields-baseline">
            <label for="start-date">시작 베이스라인:</label>
            <div class="baseline-group">
              <input type="date" id="start-date" v-model="form.startDate" required />
            </div>

            <label for="end-date">마감 베이스라인:</label>
            <div class="baseline-group">
              <input type="date" id="end-date" v-model="form.endDate" required />
            </div>
          </div>

          <div>
            <label for="department">담당 부서:</label>
            <select id="department" v-model="form.department" @change="fetchUsersForDepartment">
              <option value="" disabled selected>부서명을 선택해주세요</option>
              <option v-for="department in departments" :key="department.deptId" :value="department.deptId">
                {{ department.deptName }}
              </option>
            </select>
          </div>

          <div class="inline-fields">
            <div class="field-container">
              <div class="label-container">
                <label for="preceding-task">선행 일정:</label>
                <button type="button" class="add-btn" @click="addPrecedingTask">+</button>
              </div>
              <div v-for="(preceding, index) in form.precedingTasks" :key="'preceding-' + index" class="field-group">
                <select v-model="form.precedingTasks[index]">
                  <option value="" disabled selected>선행일정을 선택해주세요</option>
                  <option v-for="task in tasks" :key="task.id" :value="task.id">{{ task.name }}</option>
                </select>
              </div>
            </div>

            <div class="field-container">
              <div class="label-container">
                <label for="following-task">후행 일정:</label>
                <button type="button" class="add-btn" @click="addFollowingTask">+</button>
              </div>
              <div v-for="(following, index) in form.followingTasks" :key="'following-' + index" class="field-group">
                <select v-model="form.followingTasks[index]">
                  <option value="" disabled selected>후행일정을 선택해주세요</option>
                  <option v-for="task in tasks" :key="task.id" :value="task.id">{{ task.name }}</option>
                </select>
              </div>
            </div>
          </div>

<!-- 책임자 -->
<div>
  <label for="responsible">책임자:</label>
  <select id="responsible" v-model="form.responsible">
    <option value="" disabled selected>책임자를 선택해주세요</option>
    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
  </select>
</div>

<!-- 참여자 -->
<!-- 참여자 체크박스 -->
<div>
  <label for="participants">참여자:</label>
  <table>
    <thead>
      <tr>
        <th>선택</th>
        <th>참여자 이름</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <td>
          <input 
            type="checkbox" 
            :id="'participant-' + user.id" 
            :value="user.id" 
            v-model="form.participants" 
          />
        </td>
        <td>
          <label :for="'participant-' + user.id">{{ user.name }}</label>
        </td>
      </tr>
    </tbody>
  </table>
</div>


          <button type="submit" class="submit-btn" @click="submitForm" :disabled="isSubmitting.value">추가</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, computed,onMounted } from 'vue'
import TaskInfoTab from '@/components/task/TaskInfoTab.vue'
import TaskApprovalTab from '@/components/task/TaskApprovalTab.vue'
import TaskAttachmentTab from '@/components/task/TaskAttachmentTab.vue'
import DetailTab from './DetailTab.vue'
import { defineEmits } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useTaskStore } from "@/stores/taskStore"; // Pinia store 임포트

const emit = defineEmits()
const openModal = () => {
  console.log("버튼 클릭됨!")
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

  console.log(form.value.precedingTasks);
console.log(form.value.followingTasks);
console.log('End Date:', form.value.endDate);  // 추가해서 값을 확인
  
  // 선행 일정과 후행 일정이 비어 있으면 null로 설정
  const precedingTasks = form.value.precedingTasks.length > 0 ? form.value.precedingTasks : null;
  const followingTasks = form.value.followingTasks.length > 0 ? form.value.followingTasks : null;

  // 요청 데이터 구성
  const requestData = {
    projectId: sessionStorage.getItem('projectId'), // 세션에서 프로젝트 ID
    parentTaskId: props.taskData.selectTask.taskId, // 부모 작업 ID
    name: form.value.title, // 제목
    description: form.value.description, // 설명
    startBase: form.value.startDate, // 시작 베이스라인
    endBase: form.value.endDate, // 마감 베이스라인
    deptId: form.value.department, // 부서 ID
    source: Array.from(form.value.precedingTasks), // Proxy 객체를 배열로 변환
    target: Array.from(form.value.followingTasks), // Proxy 객체를 배열로 변환
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
    closeModal();
  }

  isSubmitting.value = false;
};

const addPrecedingTask = () => form.value.precedingTasks.push("") // 선행 일정 추가
const addFollowingTask = () => form.value.followingTasks.push("") // 후행 일정 추가

const props = defineProps({
  taskData: {
    type: Object,
    required: true
  }
});

const tabs = [
  { name: 'info', label: '태스크 정보', component: TaskInfoTab },
  { name: 'detail', label: '세부 일정', component: DetailTab },
  { name: 'approval', label: '결재 내역', component: TaskApprovalTab },
  { name: 'attachments', label: '자료 검색', component: TaskAttachmentTab }
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
    // 부모 컴포넌트에서 전달된 taskId를 사용하여 API 호출
    const response = await fetch(`http://localhost:5000/api/work/detail/nameList?parentTaskId=${props.taskData.selectTask.taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (response.ok) {
      tasks.value = data.data // API 응답에서 task 목록을 tasks에 저장
    } else {
      console.error('API 호출 실패', data.message)
    }
  } catch (error) {
    console.error('API 호출 오류', error)
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
    const response = await fetch("http://localhost:5000/api/dept/all", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      departments.value = data.data
    } else {
      console.error("부서 데이터를 가져오는 데 실패했습니다:", response.status)
    }
  } catch (error) {
    console.error("부서 데이터를 불러오는 데 실패했습니다:", error)
  }
}


const users = ref([]) // task 목록을 저장할 배열

const fetchUsersForDepartment = async () => {
  const deptId = form.value.department; // 선택된 부서 ID
  const userStore = useUserStore();
  const token = userStore.accessToken;

  if (!token) {
    console.error("토큰이 없습니다.");
    return;
  }

  try {
    // 부서 ID로 부서명 찾기
    const selectedDept = departments.value.find(dept => dept.deptId === deptId);
    const deptName = selectedDept ? selectedDept.deptName : ''; // deptName을 가져오기

    console.log("Fetching users for dept:", deptName); // 부서명 확인
    const response = await fetch(`http://localhost:5000/api/users/dept?deptName=${deptName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      users.value = data.data; // 부서에 해당하는 사용자 목록을 users 배열에 저장
    } else {
      console.error("사용자 데이터를 가져오는 데 실패했습니다:", response.status);
    }
  } catch (error) {
    console.error("사용자 데이터를 불러오는 데 실패했습니다:", error);
  }
};



// 컴포넌트가 마운트된 후 API 호출
onMounted(() => {
  fetchDepartments()
  fetchTasks()
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
  background-color: #00cfc1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 40px;
  font-size: 14px;
  cursor: pointer;
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
  width: 605px; /* 입력 필드와 동일한 너비 */
  max-height: 150px;
  overflow-y: auto;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
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

th, td {
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
  