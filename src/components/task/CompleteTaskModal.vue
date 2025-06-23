<template>
  <v-dialog v-model="dialogVisible" max-width="530" persistent> 
    <v-card  style="padding: 30px 40px;" >
      <!-- 헤더 -->
      <div class="d-flex justify-space-between align-center mb-2">
        <div class="text-h6 font-weight-bold">태스크 완료 처리</div>
        <v-btn icon @click="$emit('close')" variant="text">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- 태스크 정보 -->
      <div class="mb-4 pa-6" style="background-color:aliceblue; border-radius: 5px;">
        <div class="text-title-2 font-weight-bold mb-2">
          📁 TASK : {{ localTaskInfo.label }}
        </div>
        <!-- 담당 부서 -->
        <div v-if="detailList.length > 0" class="d-flex flex-wrap align-center" style="gap: 6px; font-size: 12px;">
            <v-icon size="14" color="grey-darken-1">mdi-office-building</v-icon>
            <v-chip
                v-for="(dept, index) in localTaskInfo.deptList"
                :key="index"
                size="small"
                color="primary"
                variant="tonal"
                class="text-caption"
            >
                {{ dept.deptName }}
            </v-chip>
        </div>       

        <div class="d-flex justify-space-around text-center align-items-center" style="height: 100px; margin-top: 15px; margin-bottom: 4px;">
          <div class="text-center">
            <div class="progress-wrapper">
              <v-progress-circular :model-value="localTaskInfo.passedRate" color="blue" size="60" width="8" :rotate="-90" />
              <div class="progress-text">{{ localTaskInfo.passedRate }}%</div>
            </div>
            <div class="mt-1 text-caption">경과율</div>
          </div>
          <div class="text-center">
            <div class="progress-wrapper">
              <v-progress-circular :model-value="localTaskInfo.progressRate" color="blue" size="60" width="8" :rotate="-90" />
              <div class="progress-text">{{ localTaskInfo.progressRate }}%</div>
            </div>
            <div class="mt-1 text-caption">진척률</div>
          </div>
          <div class="text-center">
            <div
              class="text-h4 font-weight-bold"
              :style="{
                color: (localTaskInfo.delayDays ?? 0) >= 1 ? '#FF4545' : 'gray',
                marginTop: '10px'
              }"
            >
              {{ localTaskInfo.delayDays ?? 0 }}일
            </div>
            <div class="text-caption" style="margin-top: 12px;">지연일</div>
          </div>
        </div>

        <!-- 세부일정 존재 여부 -->
        <div v-if="detailList.length === 0" class="mt-2 text-caption text-center text-grey-darken-1">
        ⚠️ 해당 태스크의 세부일정이 존재하지 않습니다.
        </div>
        <!-- 통계 -->
        <div v-else class="mt-2 text-caption text-center text-grey-darken-1">
          전체 세부일정 : {{ detailList.length  }} &nbsp;&nbsp;|&nbsp;&nbsp;
          완료 세부일정 : {{ completedDetailList.length }} &nbsp;&nbsp;|&nbsp;&nbsp;
          미완료 세부일정 : {{ (detailList?.length ?? 0) - (completedDetailList?.length ?? 0) }}
        </div>
      </div>

      <!-- 완료 체크 -->
      <v-alert
        v-if="localTaskInfo.progressRate === 100.0"
        type="success"
        border="start"
        class="mb-2 d-flex align-center custom-alert"
        style="text-align: left;"
        density="compact"
        variant="tonal"
        icon="false"
      >
        ✅  모든 세부일정 완료
      </v-alert>
      <!-- 세부일정이 하나라도 미완료된 경우 (❗ 빨간색 경고) -->
        <v-alert
        v-else-if="detailList.length > 0 && completedDetailList.length < detailList.length"
        type="error"
        border="start"
        class="mb-2 d-flex align-center custom-alert"
        style="text-align: left;"
        density="compact"
        variant="tonal"
        icon="false"
        >
        ❗ 세부일정이 완료되지 않았습니다.
        </v-alert>
        <!-- 세부일정 자체가 없는 경우 -->
        <v-alert
        v-else
        type="info"
        border="start"
        class="mb-2 d-flex align-center justify-space-between custom-alert"
        style="text-align: left; display: flex; flex-direction: row;"
        density="compact"
        variant="tonal"
        icon="false"
        >
        <div style="width: 100%; display:flex; flex-direction: row; justify-content: space-between;">
        <span>📄 세부일정이 존재하지 않습니다. </span>
           
            <!-- 👉 태스크 상세 페이지에서 세부일정을 생성해 주세요. -->
             <v-btn
            text
            style="background-color: rgba(0,0,0,0); box-shadow: none; height: fit-content;"
            class="text-caption"
            color="none"
            @click="goToTaskDetail"
        >
            이동
        </v-btn>
        </div>

        
        </v-alert>

      <!-- 날짜 입력 -->
      <div style="display:flex; flex-direction: row; gap: 10px; justify-content: space-between;">
        <div cols="6" style="width: 100%;">
          <label class="text-caption font-weight-medium">시작 베이스라인</label>
          <v-text-field
            v-model="localTaskInfo.startBase"
            type="date"
            density="compact"
            variant="outlined"
            class="custom-date-input"
            readOnly
            hide-details
          />
        </div>
        <div cols="6" style="width: 100%;">
          <label class="text-caption font-weight-medium">마감 베이스라인</label>
          <v-text-field
            v-model="localTaskInfo.endBase"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            hint="예상 마감일자부터 +1일"
            readOnly
            persistent-hint
            class="custom-date-input"
          />
        </div>
      </div>
      

      <div style="display:flex; flex-direction: row; gap: 10px; justify-content: space-between; margin-top: 10px;">
        <div cols="6" style="width: 100%;">
          <label class="text-caption font-weight-medium">실제 시작일</label>
          <v-text-field
            v-model="localTaskInfo.startReal"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            readOnly
            class="custom-date-input"
          />
        </div>
        <div cols="6" style="width: 100%;">
          <label class="text-caption font-weight-medium">실제 마감일</label>
          <v-text-field
            v-model="localTaskInfo.endReal"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            class="custom-date-input"
            readOnly
            persistent-hint
          />
          <div class="text-caption text-grey-darken-1" style="font-size: 11px; margin-top: 2px;">
            {{ baselineDiffText }}
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="d-flex justify-space-between mt-8" style="width: 100%;">
        <v-btn variant="text" class="basic-button" @click="$emit('close')">취소</v-btn>
        <template v-if="localTaskInfo.progressRate === 100.0">
            <v-btn class="color-button" @click="goToTask" >태스크 상세 보기</v-btn>
        </template>
        <template v-else>
            <v-btn class="color-button" @click="completeTask">태스크 완료하기</v-btn>
        </template>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import api from '@/api'
import router from '@/router'

const props = defineProps({
  show: Boolean,
  taskInfo: {
    type: Object,
    required: true
  }
})


const emit = defineEmits(['close', 'complete', 'update:show'])

const dialogVisible = computed({
  get: () => props.show,
  set: val => emit('update:show', val)
})

// 태스크 정보 복사본
const localTaskInfo = reactive({ ...props.taskInfo })

// props 변경 시 localTaskInfo 갱신
watch(() => props.taskInfo, (newVal) => {
  if (!newVal) return;
  Object.assign(localTaskInfo, newVal);
});


// ✅ 세부일정 리스트
const detailList = ref([])
const completedDetailList = computed(() =>
  detailList.value.filter(d => d.progressRate >= 100)
)
// 마감 베이스라인, 실제 마감일 비교
const baselineDiffText = computed(() => {
  const base = new Date(localTaskInfo.endBase)
  const real = new Date(localTaskInfo.endReal)

  if (!localTaskInfo.endBase || !localTaskInfo.endReal) return ''

  const diff = Math.floor((base - real) / (1000 * 60 * 60 * 24))

  if (diff === 0) return '(베이스라인과 동일한 마감)'
  if (diff > 0) return `(베이스라인보다 ${diff}일 빠른 마감)`
  return `(베이스라인보다 ${Math.abs(diff)}일 늦은 마감)`
})

onMounted(() => {
    console.log(props.taskInfo)
    fetchDetailList()

})

// 세부일정 목록 
async function fetchDetailList() {
  if (!props.taskInfo?.id) return
  try {
    console.log("✅ 세부일정 목록 조회 요청")
    const res = await api.get(`/api/work/detailList?parentTaskId=${props.taskInfo.id}`)
    detailList.value = res.data.data || []
    console.log("✅ 세부일정 목록 조회 확인", detailList.value)

  } catch (e) {
    console.error('세부일정 불러오기 실패:', e)
  }
}

// 태스크 완료 처리
const completeTask = () => {
  if (completedDetailList.value.length < detailList.value.length) {
    alert('모든 세부일정이 완료되지 않았습니다!')
    return
  }

  emit('complete', {
    ...localTaskInfo,
    completeDate: new Date().toISOString().slice(0, 10)
  })
}

// 태스크 상세 페이지로 이동
const goToTask = () => {
    router.push(`/task/${localTaskInfo.id}`)
}

</script>

<style scoped>
.text-h6 {
  font-size: 20px;
}
.progress-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  display: inline-block;
}
.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
  color: #1976D2;
}
.basic-button {
  color: #757575;
  border-radius: 5px;
  border: solid 1px #D9D9D9;
  font-weight: 600;
  font-size: 14px;
  height: 36px;
  padding: 0 14px;
  line-height: 1.6;
  background-color: white;
}
.color-button {
  background-color: #7578ee;
  color: white;
  font-weight: 600;
  font-size: 14px;
  height: 36px;
  padding: 0 14px;
  line-height: 1.6;
}

/* 핵심: Vuetify 내부 .v-field__input에 직접 적용 */
::v-deep(.custom-date-input .v-field__input) {
  font-size: 12px !important;
  height: 25px !important;
  padding-top: 3px !important;
  padding-bottom: 3px !important;
}
.custom-alert {
  font-size: 12px;
  padding: 6px 12px !important;
  line-height: 1.4;
}
</style>

