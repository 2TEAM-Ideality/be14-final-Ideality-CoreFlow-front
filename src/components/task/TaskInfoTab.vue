<template>
  <div class="task-info-box">
    <!-- 수정 아이콘 / 완료 버튼 -->
    <div class="edit-toggle">
      <img
        v-if="!isEdit"
        src="@/assets/icons/pentool.svg"
        class="edit-icon"
        alt="edit"
        @click="isEdit = true"
      />
      <button v-else class="complete-button" @click="handleCompleteClick">완료</button>

        <!-- 확인 모달 -->
        <ConfirmModal
          v-if="showConfirmModal"
          :visible="showConfirmModal"
          title="수정 확인"
          message="정말 수정하시겠습니까?"
          @confirm="submitEdit"
          @cancel="cancelEdit"
        />
    </div>

    <!-- 담당부서 -->
    <div class="form-row">
      <label class="form-label">담당부서:</label>
        <div
          ref="deptDropdownRef"
          class="department-input-box small-width readonly-box" 
          :class="{ editable: isEdit }"
          @click="isEdit && handleDeptDropdown()"
        >
          <span>{{ selectedDeptName }}</span>
          <i
            class="mdi mdi-chevron-down icon-right"
            :style="{ visibility: isEdit ? 'visible' : 'hidden' }"
          />

          <ul v-if="showDeptDropdown" class="dropdown">
            <li
              v-for="(dept, idx) in deptList"
              :key="idx"
              @click.stop="selectDept(dept)"
              class="dropdown-item"
            >
              <input type="checkbox" :checked="task.deptNames.includes(dept)" readonly />
              {{ dept }}
            </li>
          </ul>
        </div>
    </div>

    <!-- Task 설명 -->
    <div class="form-row">
      <label class="form-label">Task 설명:</label>
      <div class="description-box">
        <textarea class="task-textarea" :readonly="!isEdit" v-model="task.selectTask.description"></textarea>
      </div>
    </div>

    <!-- 경과율 / 진척률 / 지연일수 -->
    <div class="summary-row">
      <div class="summary-item">
        <div class="summary-label">경과율</div>
        <div class="summary-box">
          <div class="summary-value purple">{{ task.selectTask.progressRate }} %</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-label">태스크 진척률</div>
        <div class="summary-box">
          <div class="summary-value red">{{ task.selectTask.passedRate }} %</div>
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-label">지연일수</div>
        <div class="summary-box">
          <div
            class="summary-value"
            :class="task.selectTask.delayDay === 0 ? 'black' : 'red'"
          >
            {{ task.selectTask.delayDay === 0 ? '0일' : `+ ${task.selectTask.delayDay}일` }}
          </div>
        </div>
      </div>
    </div>

    <!-- 일정 입력 (2줄 구성) -->
    <div class="schedule-2line">
      <div class="line">
        <div class="field-inline">
          <label>이전 태스크 :</label>
          <div
            ref="prevDropdownRef"
            class="input readonly-box"
            :class="{ editable: isEdit }"
            @click="isEdit && handlePrevTaskDropdown()"
          >
            <span>{{ prevTaskNames }}</span>
            <i
              class="mdi mdi-chevron-down icon-right"
              :style="{ visibility: isEdit ? 'visible' : 'hidden' }"
            />

            <ul v-if="showPrevDropdown" class="dropdown">
              <li
                v-for="prev in filteredPrevTasks"
                :key="prev.id"
                class="dropdown-item"
                @click.stop="selectPrevTask(prev)"
              >
              <!-- 이전 태스크 드롭다운 체크 수정 -->
              <input
                type="checkbox"
                :checked="task.prevTasks?.some(p => p.prevWorkId === prev.id)"
                readonly
              />
                {{ prev.label }}
              </li>
            </ul>
          </div>
        </div>
        <div class="field-inline">
          <label>시작 베이스라인</label>
          <div class="input readonly-text">{{ task.selectTask.startBaseLine }}</div>
        </div>
        <div class="field-inline">
          <label>종료 베이스라인</label>
          <div class="input readonly-text">{{ task.selectTask.endBaseLine }}</div>
        </div>
      </div>

      <div class="line">
        <div class="field-inline">
          <label>이후 태스크 :</label>
          <div
            ref="nextDropdownRef"
            class="input readonly-box"
            :class="{ editable: isEdit }"
            @click="isEdit && handleNextTaskDropdown()"
          >
            <span>{{ nextTaskNames }}</span>
            <i
              class="mdi mdi-chevron-down icon-right"
              :style="{ visibility: isEdit ? 'visible' : 'hidden' }"
            />

            <ul v-if="showNextDropdown" class="dropdown">
              <li
                v-for="next in filteredNextTasks"
                :key="next.id"
                class="dropdown-item"
                @click.stop="selectNextTask(next)"
              >
              <!-- 이후 태스크 드롭다운 체크 수정 -->
              <input
                type="checkbox"
                :checked="task.nextTasks?.some(n => n.nextWorkId === next.id)"
                readonly
              />
                {{ next.label }}
              </li>
            </ul>
          </div>
        </div>
        <div class="field-inline">
          <label>예상 시작일</label>
          <input
            type="date"
            class="input"
            :disabled="!isEdit"
            v-model="task.selectTask.expectStartDate"
          />
        </div>
        <div class="field-inline">
          <label>예상 종료일</label>
          <input
            type="date"
            class="input"
            :disabled="!isEdit"
            v-model="task.selectTask.expectEndDate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import axios from 'axios' 
import ConfirmModal from '@/components/common/ConfirmModal.vue';

const route = useRoute();
const userStore = useUserStore();
const task = ref({
    selectTask: {},
    prevTasks: [],
    nextTasks: [],
    deptNames: []
});

const props = defineProps({
  taskData: Object,
  visible : Boolean
})
const isEdit = ref(false);

// 태스크 수정 ? 을 위한 깊은 복사
const originalTask = ref({});

// 태스크 수정을 위한 모달 열기창
const showConfirmModal = ref(false);

// 부서명, 이전 태스크, 이후 태스크를 보여주기 위함
const prevTaskNames = computed(() =>
  task.value.prevTasks?.length
    ? task.value.prevTasks.map(t => t.prevWorkName).join(', ')
    : ''
);
const nextTaskNames = computed(() =>
  task.value.nextTasks?.length
    ? task.value.nextTasks.map(t => t.nextWorkName).join(', ')
    : ''
);
const selectedDeptName = computed(() =>
  task.value.deptNames.length > 0 ? task.value.deptNames.join(', ') : ''
);

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});

// 드롭다운 코드
/* 드롭다운 상태 */
const showDeptDropdown = ref(false)
const showPrevDropdown = ref(false)
const showNextDropdown = ref(false)

const deptDropdownRef = ref(null)
const prevDropdownRef = ref(null)
const nextDropdownRef = ref(null)

/* 리스트 */
const deptList = ref([])
const taskList = ref([])

// 부서 드롭다운
const handleDeptDropdown = async () => {
  // 프로젝트 id 필히 수정 필요
  try {
    const res = await axios.get(`http://localhost:5000/api/projects/${task.value.selectTask.projectId}/participants/department`, {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`
      }
    });
    // 이름만 추출
    deptList.value = res.data.data.map(d => d.deptName);
    showDeptDropdown.value = !showDeptDropdown.value;
  } catch (error) {
    console.log(error);
  }
}

// 부서 선택
const selectDept = (dept) => {
  const current = task.value.deptNames;
  if (current.includes(dept)) {
    if (current.length === 1) {
      alert('최소 1개 이상의 부서를 선택해야 합니다.');
      return;
    }
    task.value.deptNames = current.filter(d => d !== dept);
  } else {
    task.value.deptNames = [...current, dept]; // ✅ 중복 없이 추가
  }
};

// 태스크 목록 조회
const TaskList = async () => {
  // 프로젝트 id는 바로 수정 필요
  try {
    const res = await axios.get(`http://localhost:5000/api/task/${task.value.selectTask.projectId}`, {
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`
      }
    });
    // 이름만 추출
    taskList.value = res.data.data;
    console.log(taskList.value);
  } catch (error) {
    console.log(error);
  }
}

// 이전 태스크, 이후 태스크 관련 드롭다운 및 함수
// 필터링 함수 -> 예상 날짜로 할 거면 바꿔도 됌
const filteredPrevTasks = computed(() =>
  taskList.value.filter(t =>
    new Date(t.startBaseLine) <= new Date(task.value.selectTask.startBaseLine) &&
    t.id !== task.value.selectTask.taskId  // ← 여기!
  )
);

const filteredNextTasks = computed(() =>
  taskList.value.filter(t =>
    new Date(t.startBaseLine) >= new Date(task.value.selectTask.startBaseLine) &&
    t.id !== task.value.selectTask.taskId  // ← 여기!
  )
);

// 드롭다운 오픈 함수
const handlePrevTaskDropdown = async () => {
  await TaskList();
  showPrevDropdown.value = !showPrevDropdown.value;
  showNextDropdown.value = false;
};

const handleNextTaskDropdown = async () => {
  await TaskList();
  showNextDropdown.value = !showNextDropdown.value;
  showPrevDropdown.value = false;
};

// 이전 태스크 선택
const selectPrevTask = (t) => {
  const current = task.value.prevTasks.map(p => p.prevWorkId);
  if (current.includes(t.id)) {
    task.value.prevTasks = task.value.prevTasks.filter(p => p.prevWorkId !== t.id);
  } else {
    task.value.prevTasks = [...task.value.prevTasks, {
      prevWorkId: t.id,
      prevWorkName: t.label
    }];
  }
};

// 이후 태스크 선택
const selectNextTask = (t) => {
  const current = task.value.nextTasks.map(n => n.nextWorkId);
  if (current.includes(t.id)) {
    task.value.nextTasks = task.value.nextTasks.filter(n => n.nextWorkId !== t.id);
  } else {
    task.value.nextTasks = [...task.value.nextTasks, {
      nextWorkId: t.id,
      nextWorkName: t.label
    }];
  }
};

const handleClickOutside = (e) => {
  const target = e.target;

  if (deptDropdownRef.value && !deptDropdownRef.value.contains(target)) {
    showDeptDropdown.value = false;
  }
  if (prevDropdownRef.value && !prevDropdownRef.value.contains(target)) {
    showPrevDropdown.value = false;
  }
  if (nextDropdownRef.value && !nextDropdownRef.value.contains(target)) {
    showNextDropdown.value = false;
  }
};

watch(() => props.taskData, (newData) => {
  if (newData) {
    showConfirmModal.value = false; // ✅ 혹시 떠 있을까봐 초기화
    isEdit.value = false;

    task.value = {
      selectTask: newData.selectTask,
      prevTasks: newData.prevTasks || [],
      nextTasks: newData.nextTasks || [],
      deptNames: newData.deptNames || []
    };
    // 깊은 복사로 초기값 저장
    originalTask.value = JSON.parse(JSON.stringify(task.value));
    console.log(originalTask.value);
  }
}, { immediate: true });


const hasChanges = computed(() => {
  return JSON.stringify(task.value) !== JSON.stringify(originalTask.value);
});

const fetchModify = async () => {
  try {
    const dto = {
      taskId: task.value.selectTask.taskId,
      projectId: task.value.selectTask.projectId,
      description: task.value.selectTask.description,
      deptLists: task.value.deptNames,
      prevTaskList: task.value.prevTasks.map(t => t.prevWorkId),
      nextTaskList: task.value.nextTasks.map(t => t.nextWorkId),
      startExpect: task.value.selectTask.expectStartDate,
      endExpect: task.value.selectTask.expectEndDate
    };
    await axios.patch(`http://localhost:5000/api/task/modify/${dto.taskId}`, dto, {
      headers: {
        'Authorization': `Bearer ${userStore.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    alert("수정되었습니다.");
  } catch (error) {
    if (error.response && error.response.status === 403) {
      alert("권한이 없습니다.");
      isEdit.value = false;
      task.value = JSON.parse(JSON.stringify(originalTask.value));
    } else {
      console.error("수정 중 오류 발생:", error);
      isEdit.value = false;
      task.value = JSON.parse(JSON.stringify(originalTask.value));
    }
  }     
}
// 완료 클릭 처리
const handleCompleteClick = () => {
  if (hasChanges.value) {
    showConfirmModal.value = true
  } else {
    isEdit.value = false
  }
}

// 모달 확인 => patch 전송
const submitEdit = async () => {
  showConfirmModal.value = false
  isEdit.value = false
  console.log('PATCH API 전송할 데이터:', task.value)
  // 이후 API 연결
  await fetchModify();
}

// 모달 취소 => 수정 전 상태로 돌리기
const cancelEdit = () => {
  showConfirmModal.value = false;
  isEdit.value = false;

  // 수정 전 상태로 되돌리기
  task.value = JSON.parse(JSON.stringify(originalTask.value));
};
</script>

<style scoped>

.task-info-box {
  position: relative;
  border: 1px solid #818181;
  border-radius: 6px;
  padding: 24px 48px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 32px;
}

.edit-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
}

.edit-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.complete-button {
  width: 72px; 
  height: 36px;
  background-color: #00cfc1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  padding: 0;
  text-align: center;
  cursor: pointer;
  white-space: nowrap;
}

.form-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.form-label {
  min-width: 100px;
  font-weight: bold;
  font-size: 20px;
  padding-top: 6px;
}

.department-input-box,
.description-box {
  flex: 1;
}

.department-input-box.small-width {
  max-width: 300px;
}

.department-input,
.task-textarea,
.input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 14px;
  line-height: 1.5;
}

.task-textarea {
  height: 100px;
  resize: vertical;
}

.readonly-box,
.readonly-text {
  height: 36px;
  padding: 6px 10px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #aaa;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.input[type="date"] {
  height: 36px;
  padding: 6px 10px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #aaa;
  border-radius: 6px;
  box-sizing: border-box;
}

/* 경과율 등 */
.summary-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-left: 4px;
  margin-top: -4px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  font-weight: bold;
  font-size: 15px;
  color: black;
}

.summary-box {
  width: 150px;
  height: 48px;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
}

.purple {
  color: #6750A4;
}
.red {
  color: #FF4545;
}
.black {
  color: #000;
}

/* 일정 2줄 구성 */
.schedule-2line {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-2line .line {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.field-inline {
  display: flex;
  flex-direction: column;
  flex: 1 1 30%;
  min-width: 160px;
}

.field-inline label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}


.readonly-box.editable {
  cursor: pointer;
}

.icon-right {
  margin-left: 8px;
  font-size: 18px;
  color: #888;
}

@media (max-width: 768px) {
  .task-info-box {
    padding: 16px;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-right: 0;
  }

  .summary-box {
    width: 100%;
  }

  .schedule-2line .line {
    flex-direction: column;
  }

  .field-inline {
    width: 100%;
  }
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-top: 4px;
  padding: 0;
  list-style: none;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 10px 14px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}
</style>