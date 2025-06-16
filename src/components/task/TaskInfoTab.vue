<template>
    <div class="task-info-box">
    <!-- 수정 아이콘 (우측 상단) -->
    <img src="@/assets/icons/pentool.svg" 
    class="edit-icon" 
    alt="edit" 
    @click="isEdit = true"
    />

<!-- 담당부서 영역 -->
    <div class="form-row">
        <label class="form-label">담당부서:</label>
        <div class="department-input-box">
            <input type="text" 
                class="department-input" 
                :readonly="!isEdit"
                />
        </div>
    </div>

    <!-- Task 설명 영역 -->
    <div class="form-row">
        <label class="form-label">Task 설명:</label>
        <div class="description-box">
            <textarea class="task-textarea"
            :readonly="!isEdit"
            v-model="task.selectTask.description"
            ></textarea>
        </div>
    </div>



    <!-- 일정 입력 그룹 -->
    <div class="row group">
        <!-- 이전 태스크 -->
        <div class="field-horizontal">
            <label>이전 태스크 :</label>
            <input type="text" class="input" />
        </div>

        <!-- 날짜 필드 묶음: 이 부분 새로 추가 -->
        <div class="date-group">
            <div class="field-vertical">
                <label>시작 베이스라인</label>
                <div class="input readonly-text">{{ task.selectTask.startBaseLine }}</div>
            </div>
            <div class="field-vertical">
                <label>종료 베이스라인</label>
                <div class="input readonly-text">{{ task.selectTask.endBaseLine }}</div>
            </div>
        </div>
    </div>


    <div class="row group">
        <!-- 이후 태스크 -->
        <div class="field-horizontal">
            <label>이후 태스크 :</label>
            <input type="text" class="input" />
        </div>

        <!-- 날짜 필드 묶음: 새로 추가 -->
        <div class="date-group">
            <div class="field-vertical">
            <label>예상 시작일</label>
            <input 
            type="date" 
            class="input"
            :disabled="!isEdit"
            v-model="task.selectTask.expectStartDate"
            />

            </div>
            <div class="field-vertical">
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
                    :class="task.selectTask.delayDay === 0 ? 'black' : 'red'">
                    {{ task.selectTask.delayDay === 0
                    ? '0일'
                    : `+ ${task.selectTask.delayDay}일` }}
                </div>
            </div>
        </div>
    </div>

    </div>

</template>


<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import axios from 'axios' 
const route = useRoute();
const userStore = useUserStore();
const task = ref({
    selectTask: {
        id: '',
        description: '',
        startBaseLine: '',
        endBaseLine: '',
        expectStartDate: "",
        expectEndDate: "",
        progressRate: "",
        passedRate: "",
        delayDay: ""
        
    },
    prevTasks: [],
    nextTasks: []
});
const taskId = ref(route.params.taskId);

const isEdit = ref(false);

const fetchTask = async (id) => {
    const res = await axios.get(`http://localhost:5000/api/task/detail/${id}`, {
        headers: {
            Authorization: `Bearer ${userStore.accessToken}`
        }
    });
    task.value = res.data.data;

    console.log(task.value);
};

onMounted(() => {
    fetchTask(taskId.value);
});

watch(() => route.params.taskId, (newId) => {
    taskId.value = newId;
    fetchTask(newId);
});
</script>

<style scoped>
.task-info-box {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.edit-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.form-row {
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

.department-input-box {
  flex: 1;
}

.department-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #aaa;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
}

.description-box {
  flex: 1;
}

.task-textarea {
  width: 100%;
  height: 100px;
  padding: 10px 12px;
  border: 1px solid #aaa;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
}

.readonly-text {
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  height: 32px;
  display: flex;
  align-items: center;
}

.input,
.textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
}

.input {
  height: 32px;
}

.textarea {
  resize: vertical;
}

/* 🔥 일정 입력 그룹 전체를 flex row로 정리 */
.group {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: nowrap;
}

/* 🔥 이전/이후 태스크 라벨 + 인풋 */
.field-horizontal {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 200px;
}

.field-horizontal label {
  white-space: nowrap;
  font-size: 14px;
  min-width: 80px;
}

/* 🔥 날짜 영역을 flex로 정리 */
.date-group {
  display: flex;
  gap: 24px;
  flex: 2;
}

/* 🔥 시작/종료일 하나의 박스 */
.field-vertical {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  margin-top: 0;
}

.summary-row {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 24px;
  margin-right: 40px;
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
  width: 100px;
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

/* ✅ 반응형 스타일 */
@media (max-width: 768px) {
  .task-info-box {
    padding: 16px;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .group {
    flex-direction: column;
  }

  .field-horizontal {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-group {
    flex-direction: column;
    width: 100%;
  }

  .field-vertical {
    width: 100%;
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
}
</style>