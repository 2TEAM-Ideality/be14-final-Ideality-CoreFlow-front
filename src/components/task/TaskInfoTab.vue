<template>
  <div class="task-info-box">
    <!-- 수정 아이콘 / 완료 버튼 -->
    <div class="edit-toggle">
        <!-- 수정 아이콘 -->
        <v-icon
          v-if="!isEdit"
          @click="isEdit = true"
          size="24"
          style="cursor: pointer;"
          title="수정"
        >
          mdi-pencil
        </v-icon>

        <!-- 완료 아이콘 -->
        <v-btn
          v-else
          @click="handleCompleteClick"
          size="small"
          variant="tonal"
          color="purple"
        >
        수정 완료
        </v-btn>

         <ConfirmModal
          v-if="showConfirmModal"
          :visible="showConfirmModal"
          title="수정 확인"
          message="정말 수정하시겠습니까?"
          @confirm="submitEdit"
          @cancel="cancelEdit"
        />
    </div>


    
    <div style="display: flex; flex-direction: row; gap: 50px; align-items: center;">
      <div style="width: 250px; height: 250px;">
        <TaskDonutChart 
        :taskInfo="props.taskData" 
        :detailList="props.detailList"
        :taskDeadlineWarning="warningDeadlineCount"
        />
      </div>
     
      <!-- 차트 오른편 -->
      <div style="display: flex; flex-direction: column; width: 100%; gap: 20px;">
        <!-- 부서 선택 -->
        <div class="form-row">
          <template v-if="isEdit">
            <!-- 수정 모드: 드롭다운 -->
            <v-select
              v-model="task.deptNames"
              :items="deptList"
              label="담당 부서"
              item-title="name"
              item-value="name" 
              multiple
              chips
              clearable
              variant="outlined"
              hide-details
            />
          </template>
          <template v-else>
            <!-- 읽기 모드: 읽기 전용 콤보박스 형태로 표시 -->
            <v-combobox
              v-model="task.deptNames"
              label="담당 부서"
              multiple
              chips
              variant="outlined"
              hide-details
              readonly
            />
          </template>
        </div>


        <!-- 태스크 설명 -->
        <div class="form-row">
          <v-textarea
            v-model="task.selectTask.description"
            :readonly="!isEdit"
            auto-grow
            label="태스크 설명"
            rows="2"
            max-rows="4"
            variant="outlined"
            hide-details
          />
        </div>

        <!-- 베이스라인 (읽기전용) -->
        <div class="form-row">
          <div style="display: flex; flex-direction: row; justify-content: space-between; width: 100%; gap: 12px;">
              <div style="width: 50%;">
              <v-text-field
                :model-value="task.selectTask.startBaseLine"
                label="시작 베이스라인"
                readonly
                variant="outlined"
                density="compact"
              />
              </div>
              <div style="width: 50%;">
              <v-text-field
                :model-value="task.selectTask.endBaseLine"
                label="마감 베이스라인"
                readonly
                variant="outlined"
                density="compact"
              />
            </div>  
          </div>
        </div>

        <!-- 예상 시작/종료 -->
        <div class="form-row">
          <div style="display: flex; flex-direction: row; justify-content: space-between; width: 100%; gap: 12px;">
              <div style="width: 50%;">
              <v-text-field
                type="date"
                v-model="startDateProxy"
                :label="task.selectTask.status !== 'PENDING' ? '실제 시작일' : '예상 시작일'"
                :readonly="!isEdit || task.selectTask.status !== 'PENDING'"
                variant="outlined"
                density="compact"
                @change="handleStartDateChange"
                :rules="[v => !isInvalidDate(v) || '주말 또는 공휴일은 선택할 수 없습니다.']"
              />
              </div>
              <div style="width: 50%;">
              <v-text-field
                type="date"
                v-model="endDateProxy"
                :label="task.selectTask.status === 'COMPLETED' ? '실제 종료일' : '예상 종료일'"
                :readonly="!isEdit || task.selectTask.status === 'COMPLETED'"
                :min="task.selectTask.status === 'PENDING' ? task.selectTask.expectStartDate : task.selectTask.startReal"
                variant="outlined"
                density="compact"
                @change="handleEndDateChange"
                :rules="[v => !isInvalidDate(v) || '주말 또는 공휴일은 선택할 수 없습니다.']"
              />
            </div>  
          </div>
        </div>

        <!-- 선행 후행 태스크 수정 -->
        <div class="form-row">
          <template v-if="isEdit">
            <!-- 수정 모드: 드롭다운 -->
             <div style="display: flex; flex-direction: row; justify-content: space-between; width: 100%; gap: 12px;">
                <div style="width: 50%;">
                <v-select
                  v-model="selectedPrevIds"
                  :items="taskList"
                  item-title="label"
                  item-value="id"
                  label="선행 태스크"
                  multiple
                  chips
                  clearable
                  variant="outlined"
                  hide-details
                />
                </div>

                <div style="width: 50%;">
                  <v-select
                    v-model="selectedNextIds"
                    :items="taskList"
                    item-title="label"
                    item-value="id"
                    label="후행 태스크"
                    multiple
                    chips
                    clearable
                    variant="outlined"
                    hide-details
                  />
                </div>
                </div>
          </template>
          <template v-else>
            <!-- 읽기 모드: 읽기 전용 콤보박스 형태로 표시 -->
             <div style="display: flex; flex-direction: row; justify-content: space-between; width: 100%; gap: 12px;">
                <div style="width: 50%;">
                  <v-combobox
                    :model-value="props.taskData?.prevTasks.map(t => t.prevWorkName)"
                    label="선행 태스크"
                    multiple
                    chips
                    variant="outlined"
                    hide-details
                    readonly
                  />
                </div>
                <div style="width: 50%;">
                <v-combobox
                  :model-value="props.taskData?.nextTasks.map(t => t.nextWorkName)"
                  label="후행 태스크"
                  multiple
                  chips
                  variant="outlined"
                  hide-details
                  readonly
                />
                </div>  
             </div>
          </template>
        </div>
      </div>
      
    </div>
    

    <div class="data-wraper">
      <!-- 경과율 -->
      <div class="data-item">
        <div class="data-label">
          <div style="display: flex; flex-direction: row; justify-content: flex-start; align-items: center; gap: 5px;" >
          <div style="width:12px; height: 12px;  background-color: #BBBBBB;"></div>
           태스크 경과율
          </div>
        </div>
        <div class="data">
          {{ task.selectTask.passedRate }}%
        </div>
      </div>

      <!-- 진척률 -->
      <div class="data-item">
        <div class="data-label">
          <div style="display: flex; flex-direction: row; justify-content: flex-start; align-items: center; gap: 5px;" >
          <div style="width:12px; height: 12px;  background-color: #4D91FF;"></div>
            태스크 진척률
          </div>
          <div class="data">
              {{ task.selectTask.progressRate }}%
          </div>
        </div>
      </div>
      <div class="data-item">
        <div style="display: flex; flex-direction: row; justify-content: flex-start; align-items: center; gap: 5px;" >
        <div style="width:12px; height: 12px;  background-color: #BBBBBB;"></div>
        전체 세부일정</div>
        <div class="data">{{ activeDetailList.length || 0 }} 개</div>
      </div>
      <div class="data-item">
        <div style="display: flex; flex-direction: row; justify-content: flex-start; align-items: center; gap: 5px;" >
        <div style="width:12px; height: 12px;  background-color: #FFCC00;"></div>
        마감 임박</div>
        <div class="data">{{ task.selectTask?.nearDueSubtasks || 0 }} 개</div>
      </div>
      <div class="data-item">
         <div style="display: flex; flex-direction: row; justify-content: flex-start; align-items: center; gap: 5px;" >
            <div style="width:12px; height: 12px;  background-color: #FF914D;"></div>
            지연일
          </div>
        <div class="data">{{ task.selectTask.delayDay === 0 ? '0일' : `+ ${task.selectTask.delayDay}일` }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import axios from 'axios' 
import TaskDonutChart from '@/components/task/TaskDonutChart.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import api from '@/api';
import { useUpdateStore } from '@/stores/updateStore'
import { useHolidayStore } from '@/stores/holidayStore'
import dayjs from 'dayjs'



const holidayStore = useHolidayStore()  // 공휴일

const updateStore = useUpdateStore()    // 업데이트 여부 

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
  visible : Boolean,
  detailList: Array,
})

const taskId = route.params.taskId

const isEdit = ref(false);

const endDateProxy = computed({
  get() {
    return task.value.selectTask.status === 'COMPLETED'
      ? task.value.selectTask.endReal
      : task.value.selectTask.expectEndDate;
  },
  set(value) {
    if (task.value.selectTask.status === 'COMPLETED') {
      task.value.selectTask.endReal = value;
    } else {
      task.value.selectTask.expectEndDate = value;
    }
  }
});

const startDateProxy = computed({
  get() {
    return task.value.selectTask.status !== 'PENDING'
      ? task.value.selectTask.startReal
      : task.value.selectTask.expectStartDate;
  },
  set(value) {
    if (task.value.selectTask.status !== 'PENDING') {
      task.value.selectTask.startReal = value;
    } else {
      task.value.selectTask.expectStartDate = value;
    }
  }
});



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
// 유효한 세부 일정 
const activeDetailList = computed(() => {
  return props.detailList.filter(d => d.status !== 'DELETED')
})

// 날짜 유효성 검사
function isInvalidDate(date) {
  return holidayStore.isHoliday(date)
}

const handleStartDateChange = (val) => {
  if (isInvalidDate(val)) {
    alert('주말 또는 공휴일은 선택할 수 없습니다.');
    task.value.selectTask.expectStartDate = '';
  }
}

const handleEndDateChange = (val) => {
  if (isInvalidDate(val)) {
    alert('주말 또는 공휴일은 선택할 수 없습니다.');
    task.value.selectTask.expectEndDate = '';
  }
}

onMounted(() => {
  holidayStore.fetchHolidays()
  handleDeptDropdown()
  fetchTaskList()
  window.addEventListener('click', handleClickOutside)
})

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

// 선행 후행 수정
const selectedPrevIds = computed({
  get: () => task.value.prevTasks.map(t => t.prevWorkId),
  set: (newIds) => {
    const nextIds = task.value.nextTasks.map(t => t.nextWorkId)
    const overlap = newIds.filter(id => nextIds.includes(id))
    if (overlap.length > 0) {
      const overlapNames = overlap
        .map(id => taskList.value.find(t => t.id === id)?.label || id)
      alert(`⛔ 선행/후행에 동시에 포함될 수 없습니다: ${overlapNames.join(', ')}`)
      return
    }
    task.value.prevTasks = newIds.map(id => {
      const taskItem = taskList.value.find(t => t.id === id)
      return {
        prevWorkId: id,
        prevWorkName: taskItem?.label || ''
      }
    })
  }
})

const selectedNextIds = computed({
  get: () => task.value.nextTasks.map(t => t.nextWorkId),
  set: (newIds) => {
    const prevIds = task.value.prevTasks.map(t => t.prevWorkId)
    const overlap = newIds.filter(id => prevIds.includes(id))
    if (overlap.length > 0) {
      const overlapNames = overlap
        .map(id => taskList.value.find(t => t.id === id)?.label || id)
      alert(`⛔ 선행/후행에 동시에 포함될 수 없습니다: ${overlapNames.join(', ')}`)
      return
    }
    task.value.nextTasks = newIds.map(id => {
      const taskItem = taskList.value.find(t => t.id === id)
      return {
        nextWorkId: id,
        nextWorkName: taskItem?.label || ''
      }
    })
  }
})


// 부서 목록 조회 
const handleDeptDropdown = async () => {
  try {
    const projectId = props.taskData?.selectTask?.projectId
    if (!projectId) {
      console.warn('⚠️ 프로젝트 ID 없음');
      return;
    }
    const res = await api.get(`/api/projects/${projectId}/participants/leaderDept`);
    deptList.value = res.data.data.map(d => d.name);
    // deptList.value = res.data.data.map(d => ({ name: d.name }));
    console.log('부서 목록 확인', deptList.value)
    showDeptDropdown.value = !showDeptDropdown.value;
  } catch (error) {
    console.error('❌ 부서 목록 불러오기 실패:', error);
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
const fetchTaskList = async () => {
  // 프로젝트 id는 바로 수정 필요
  try {
    const res = await api.get(`/api/task/${task.value.selectTask.projectId}`);
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
    t.id !== task.value.selectTask.taskId  
  )
);

const filteredNextTasks = computed(() =>
  taskList.value.filter(t =>
    new Date(t.startBaseLine) >= new Date(task.value.selectTask.startBaseLine) &&
    t.id !== task.value.selectTask.taskId  
  )
);


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
    showConfirmModal.value = false; 
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

// 태스크 상세 정보 수정
const fetchModify = async () => {
  try {
    console.log('수정 요청', task.value.prevTasks)

    const dto = {
      taskId: task.value.selectTask.taskId,
      taskName: task.value.selectTask.taskName, 
      projectId: task.value.selectTask.projectId,
      description: task.value.selectTask.description,
      deptLists: task.value.deptNames,
      prevTaskList: task.value.prevTasks.map(t => t.prevWorkId),
      nextTaskList: task.value.nextTasks.map(t => t.nextWorkId),
      startExpect: task.value.selectTask.expectStartDate,
      endExpect: task.value.selectTask.expectEndDate,
    };
    await api.patch(`/api/task/modify/${taskId}`, dto);
    updateStore.triggerDeptListUpdate()
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
  // 시작일- 종료일 예외처리 
  const start = dayjs(task.value.selectTask.expectStartDate)
  const end = dayjs(task.value.selectTask.expectEndDate)

  if (isInvalidDate(end)) {
    alert('예상 종료일은 주말 또는 공휴일로 설정할 수 없습니다.')
    return
  }

  if (hasChanges.value) {
    showConfirmModal.value = true
  } else {
    isEdit.value = false
  }
}

// 모달 확인 => patch 전송
// 수정 완료 제출
const submitEdit = async () => {
  

  showConfirmModal.value = false;
  isEdit.value = false;
  try {
    await fetchModify();
    console.log("✅태스크 상세정보 수정 완료")
    
  } catch (err) {
    alert("일부 수정에 실패했습니다.");
  }
};



// 모달 취소 => 수정 전 상태로 돌리기
const cancelEdit = () => {
  showConfirmModal.value = false;
  isEdit.value = false;

  // 수정 전 상태로 되돌리기
  task.value = JSON.parse(JSON.stringify(originalTask.value));
};


// 도넛 차트에 전달할 정보
const donutData = computed(() => {
  // 실제 데이터 구조에 따라 수정
  const todo = props.detailList.filter(d => d.status === 'PENDING').length
  const delay = props.detailList.filter(d => d.status === 'WARNING').length
  const doing = props.detailList.filter(d => d.status === 'PROGRESS').length
  const done = props.detailList.filter(d => d.status === 'COMPLETED').length

  return [todo, delay, doing, done]
})

const completionRate = computed(() => {
  const total = props.detailList.length
  const done = props.detailList.filter(d => d.status === 'DONE').length
  if (total === 0) return '0%'
  return Math.round((done / total) * 100) + '%'
})
</script>

<style scoped>

.task-info-box {
  width: 100%;
  position: relative;
  background-color: #ffffff;
  border-radius: 6px;
  padding: 5% 2% 5% 2%;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  background-color: #7578ee;
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
  max-height: 80px;
  height: 40px;
  resize: vertical;
  overflow-y: auto;
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

/* 데이터 */
.data-wraper {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 5px;
  justify-content: space-around;
}
.data {
  font-weight: bold;
  font-size: 23px;
}
.data-item{
  text-align: left;
  width: 100%;
  padding:18px 22px;
  border-radius: 10px;
  background-color: rgb(241, 241, 241);
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