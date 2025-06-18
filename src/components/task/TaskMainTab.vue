<template>
  <div>
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
    <component :is="selectedComponent" :taskId="taskId" />

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
            <select id="department" v-model="form.department">
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
                  <option v-for="task in tasks" :key="task.id" :value="task.name">{{ task.name }}</option>
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
                  <option v-for="task in tasks" :key="task.id" :value="task.name">{{ task.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label for="responsible">책임자:</label>
            <input type="text" id="responsible" v-model="form.responsible" />
          </div>

          <div>
            <label for="participants">참여자:</label>
            <input type="text" id="participants" v-model="form.participants" />
          </div>

          <button type="submit" class="submit-btn" @click="submitForm">추가</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TaskInfoTab from '@/components/task/TaskInfoTab.vue'
import TaskApprovalTab from '@/components/task/TaskApprovalTab.vue'
import TaskAttachmentTab from '@/components/task/TaskAttachmentTab.vue'
import DetailTab from './DetailTab.vue'
import { defineEmits } from 'vue'
import { useUserStore } from '@/stores/userStore'

const emit = defineEmits()
const openModal = () => {
  console.log("버튼 클릭됨!")
  showModal.value = true // 모달을 열기 위해 상태값을 true로 설정
}

const closeModal = () => {
  showModal.value = false // 모달을 닫기 위해 상태값을 false로 설정
}

const submitForm = () => {
  // 필수 입력 항목 체크
  if (!form.value.department) {
    alert("부서를 선택해주세요.");
    return;
  }
  if (!form.value.title || !form.value.description || !form.value.startDate || !form.value.endDate) {
    alert("필수 항목이 비어있습니다. 모든 항목을 채워주세요.");
    return;
  }
  if (!form.value.responsible) {
    alert("책임자를 입력해주세요.");
    return;
  }
  if (!form.value.participants) {
    alert("참여자를 입력해주세요.");
    return;
  }

  console.log("폼 제출:", form.value);
  // 폼 제출 처리 로직을 추가하세요 (예: 서버로 전송)
  closeModal(); // 폼 제출 후 모달을 닫음
}


const addPrecedingTask = () => form.value.precedingTasks.push("") // 선행 일정 추가
const addFollowingTask = () => form.value.followingTasks.push("") // 후행 일정 추가

const props = defineProps({ taskId: String })

const tabs = [
  { name: 'info', label: '태스크 정보', component: TaskInfoTab },
  { name: 'detail', label: '세부 일정', component: DetailTab },
  { name: 'approval', label: '결재 내역', component: TaskApprovalTab },
  { name: 'attachments', label: '자료 검색', component: TaskAttachmentTab }
]

const selectedTab = ref('info')
const selectedComponent = computed(() => tabs.find(tab => tab.name === selectedTab.value)?.component || TaskInfoTab)

const showModal = ref(false) // 모달 상태 관리
const form = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  department: '',
  precedingTasks: [''],
  followingTasks: [''],
  responsible: '',
  participants: ''
})

const tasks = [
  { id: 1, name: 'Task 1' },
  { id: 2, name: 'Task 2' },
  { id: 3, name: 'Task 3' }
]

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

fetchDepartments()
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
     z-index: 9999; /* z-index를 높여서 다른 요소들보다 위에 표시되도록 설정 */
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
    z-index: 10000; /* 모달 내용의 z-index를 올려서 보이도록 설정 */
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
</style>
  