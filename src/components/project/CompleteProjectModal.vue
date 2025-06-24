<template>
  <v-dialog v-model="dialogVisible" max-width="530" persistent> 
    <v-card  style="padding: 30px 40px;" >
      <!-- 헤더 -->
      <div class="d-flex justify-space-between align-center mb-5">
        <div class="text-h6 font-weight-bold">프로젝트 완료 처리</div>
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- 프로젝트 정보 -->
      <div class="mb-4 pa-6" style="background-color:aliceblue; border-radius: 5px;">
        <div class="text-title-2 font-weight-bold mb-2">
          📁 {{ localProjectInfo.name }}
        </div>
        <div style="display: flex; gap: 5px; font-size: 12px; align-items: center;">
          <v-icon size="14" color="grey-darken-1">mdi-account</v-icon>
          <span>{{ localProjectInfo.director?.deptName }}</span>
          <span>{{ localProjectInfo.director?.name }}</span>
          <span>{{ localProjectInfo.director?.jobRoleName }}</span>
        </div>

        <div class="d-flex justify-space-around text-center align-items-center" style="height: 100px; margin-top: 15px; margin-bottom: 4px;">
          <div class="text-center">
            <div class="progress-wrapper">
              <v-progress-circular :model-value="localProjectInfo.passedRate" color="blue" size="60" width="8" :rotate="-90" />
              <div class="progress-text">{{ localProjectInfo.passedRate }}%</div>
            </div>
            <div class="mt-1 text-caption">경과율</div>
          </div>
          <div class="text-center">
            <div class="progress-wrapper">
              <v-progress-circular :model-value="localProjectInfo.progressRate" color="blue" size="60" width="8" :rotate="-90" />
              <div class="progress-text">{{ localProjectInfo.progressRate }}%</div>
            </div>
            <div class="mt-1 text-caption">진척률</div>
          </div>
          <div class="text-center">
            <div
              class="text-h4 font-weight-bold"
              :style="{
                color: (localProjectInfo.delayDays ?? 0) >= 1 ? '#FF4545' : 'gray',
                marginTop: '10px'
              }"
            >
              {{ localProjectInfo.delayDays ?? 0 }}일
            </div>
            <div class="text-caption" style="margin-top: 12px;">지연일</div>
          </div>
        </div>

        <!-- 통계 -->
        <div class="mt-2 text-caption text-center text-grey-darken-1">
          전체 태스크 : {{ allTaskList.length }} &nbsp;&nbsp;|&nbsp;&nbsp;
          완료 태스크 : {{ completedTaskList.length }} &nbsp;&nbsp;|&nbsp;&nbsp;
          미완료 태스크 : {{ allTaskList.length - completedTaskList.length }}
        </div>
      </div>

      <!-- 완료 체크 -->
      <v-alert
        type="success"
        border="start"
        class="mb-2 d-flex align-center custom-alert"
        style="text-align: left;"
        density="compact"
        variant="tonal"
        icon="false"
      >
        ✅  모든 태스크 완료
      </v-alert>

      <!-- 날짜 입력 -->
      <div style="display:flex; flex-direction: row; gap: 10px; justify-content: space-between;">
        <div cols="6" style="width: 100%;">
          <label class="text-caption font-weight-medium">시작 베이스라인</label>
          <v-text-field
            v-model="localProjectInfo.startBase"
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
            v-model="localProjectInfo.endBase"
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
            v-model="localProjectInfo.startReal"
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
            v-model="localProjectInfo.endReal"
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
        <v-btn variant="outlined" class="basic-button" @click="$emit('close')">취소</v-btn>
        <v-btn class="color-button" @click="completeProject">프로젝트 완료하기</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'

const props = defineProps({
  show: Boolean,
  projectInfo: {
    type: Object,
    required: true
  },
  allTaskList: {
    type: Array,
    required: true
  },
  completedTaskList: {
    type: Array,
    required: true
  }
})


const emit = defineEmits(['close', 'complete', 'update:show'])

const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

// 다이얼로그 표시
const dialogVisible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

// 프로젝트 정보 복사본
const localProjectInfo = reactive({ ...props.projectInfo })

// props 변경 시 localProjectInfo 갱신
watch(() => props.projectInfo, (newVal) => {
  Object.assign(localProjectInfo, newVal)
})

// 완료 처리 일자
const completeDate = ref(new Date().toISOString().slice(0, 10))

// 완료 처리 시 emit
const completeProject = () => {
  emit('complete', {
    ...localProjectInfo,
    completeDate: completeDate.value
  })
}

// 마감 베이스라인, 실제 마감일 비교
const baselineDiffText = computed(() => {
  const base = new Date(localProjectInfo.endBase)
  const real = new Date(localProjectInfo.endReal)

  if (!localProjectInfo.endBase || !localProjectInfo.endReal) return ''

  const diff = Math.floor((base - real) / (1000 * 60 * 60 * 24))

  if (diff === 0) return '(베이스라인과 동일한 마감)'
  if (diff > 0) return `(베이스라인보다 ${diff}일 빠른 마감)`
  return `(베이스라인보다 ${Math.abs(diff)}일 늦은 마감)`
})

onMounted(() => {
  localProjectInfo.endReal = new Date().toISOString().slice(0, 10)
})


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

