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

/* 펜 아이콘 우측 상단 */
.edit-icon {
position: absolute;
top: 16px;
right: 16px;
width: 24px;
height: 24px;
cursor: pointer;
}

/* ✅ 공통 행 정렬 */
.form-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
}

/* ✅ 라벨 (왼쪽 고정 폭) */
.form-label {
    min-width: 100px;
    font-weight: bold;
    font-size: 20px;
    padding-top: 6px;
}

/* ✅ 담당부서 인풋 박스 */
.department-input-box {
    width: 100%;
    max-width: 600px;
}
.department-input {
    width: 120%;
    padding: 8px 10px;
    border: 1px solid #aaa;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
}

/* ✅ Task 설명 textarea 박스 */
.description-box {
    width: 120%;
    max-width: 600px;
}
.task-textarea {
    width: 120%;
    height: 100px; /* 적당한 3~4줄 높이 */
    padding: 10px 12px;
    border: 1px solid #aaa;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    box-sizing: border-box;
}

/* input, textarea 기본 스타일 유지 */
.input,
.textarea {
width: 100%; /* ✅ form-control 안에서 가득 채움 */
box-sizing: border-box;
}

.readonly-text {
  border: 1px solid #aaa;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  height: 32px;

  /* 가운데 정렬 추가 */
  display: flex;
  align-items: center;
}

/* 기본 row */
.row {
display: flex;
align-items: center;
gap: 12px;
}

/* form label */
.row label {
min-width: 80px;
font-size: 14px;
}

/* input, textarea */
.input, .textarea {
border: 1px solid #aaa;
border-radius: 6px;
padding: 6px 10px;
font-size: 12px;
}

.input {
width: 100%;
max-width: 220px;
}

.textarea {
flex: 1;
height: 60px;
resize: vertical;
}

/* group: 한 줄에 여러 개 */
.group {
flex-wrap: wrap;
gap: 32px;
justify-content: flex-start;
margin-top: 8px;
}


/* 가로 field: label + input 한 줄 */
.field-horizontal {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 250px;
}

/* 세로 field: label 위, input 아래 */
.field-vertical {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 200px;

    margin-top : -28px;
}

.date-group {
display: flex;
gap: 30px;
margin-left: 90px; /* 🔥 이전 태스크와 거리 조정 */
}


.field {
display: flex;
flex-direction: column;
gap: 4px;
min-width: 200px;
}

.summary-row {
display: flex;
justify-content: flex-end;
gap: 20px;
margin-top: 24px;
margin-right: 40px;
}

/* 박스 하나를 감싸는 wrapper */
.summary-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

/* 라벨은 박스 바깥 위에 위치 */
.summary-label {
    font-weight: bold;
    font-size: 15px;
    color: black;
}

/* 퍼센트 박스 */
.summary-box {
    width: 100px;
    height: 48px;
    border: 1px solid #ccc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 숫자 텍스트 */
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


</style>