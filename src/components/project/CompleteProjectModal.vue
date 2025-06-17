<template>
  <v-dialog v-model="dialogVisible" max-width="500" persistent> 
    <v-card class="pa-10" style="padding: 30px;" >
      <!-- 헤더 -->
      <div class="d-flex justify-space-between align-center mb-5">
        <div class="text-h6 font-weight-bold">프로젝트 완료 처리</div>
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- 프로젝트 정보 -->
      <div class="mb-4 pa-6" style="background-color:aliceblue; border-radius: 10px;">
        <div class="text-title-2 font-weight-bold mb-2">📁 {{ projectName }}</div>
        <div class="d-flex justify-space-around text-center align-items-center" style="height: 100px;">
          <div class="text-center">
            <div class="progress-wrapper">
              <v-progress-circular :model-value="100" color="blue" size="60" width="8" :rotate="-90" />
              <div class="progress-text">100%</div>
            </div>
            <div class="mt-1 text-caption">경과율</div>
          </div>
          <div class="text-center">
            <div class="progress-wrapper">
              <v-progress-circular :model-value="100" color="blue" size="60" width="8" :rotate="-90" />
              <div class="progress-text">100%</div>
            </div>
            <div class="mt-1 text-caption">진척률</div>
          </div>
          <div class="text-center">
            <div class="text-h4 font-weight-bold" style="color: gray; margin-top: 10px;">0일</div>
            <div class="text-caption" style="margin-top: 12px;">지연일</div>
          </div>
        </div>

        <!-- 통계 -->
        <div class="mt-4 text-caption text-center text-grey-darken-1">
          전체 태스크 : {{ total }} &nbsp;&nbsp;|&nbsp;&nbsp;
          완료 태스크 : {{ done }} &nbsp;&nbsp;|&nbsp;&nbsp;
          미완료 태스크 : {{ total - done }}
        </div>
      </div>

      <!-- 완료 체크 -->
      <v-alert type="success"  border="start" class="mb-4" density="compact" variant="outlined">
        모든 태스크 완료
      </v-alert>

      <!-- 날짜 입력 -->
      <v-row>
        <v-col cols="6">
          <label class="text-caption font-weight-medium">예상 마감 일자</label>
          <v-text-field
            v-model="expectedDate"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-col>
        <v-col cols="6">
          <label class="text-caption font-weight-medium">완료 처리 일자</label>
          <v-text-field
            v-model="completeDate"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            hint="예상 마감일자부터 +1일"
            persistent-hint
          />
        </v-col>
      </v-row>

      <!-- 버튼 -->
      <div class="d-flex justify-space-between mt-12" style="width: 100%;">
        <v-btn variant="outlined" class="basic-button" @click="$emit('close')">취소</v-btn>
        <v-btn class="color-button" @click="completeProject">프로젝트 완료하기</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  projectName: String,
  total: Number,
  done: Number,
  expected: String,
})

const emit = defineEmits(['close', 'complete', 'update:show'])

// v-model:show 대응 (반응형 처리)
const dialogVisible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const expectedDate = ref(props.expected || '2025-05-20')
const completeDate = ref('2025-05-21')

const completeProject = () => {
  emit('complete', {
    expectedDate: expectedDate.value,
    completeDate: completeDate.value,
  })
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
  z-index: 10;
  background-color: white;
}
.color-button {
  background-color: #25BEAD;
  color: white;
  font-weight: 600;
  font-size: 14px;
  height: 36px;
  padding: 0 14px;
  line-height: 1.6;
}

</style>
