<template>
  <BasicLayout>
    <template #main>
      <div class="page-title">프로젝트 생성</div>

      <!-- 프로젝트 이름 -->
      <div class="section-label">프로젝트 이름</div>
      <v-text-field
        v-model="templateName"
        placeholder="프로젝트 이름을 입력해주세요."
        variant="outlined"
        class="mb-4"
      />

      <!-- 프로젝트 설명 -->
      <div class="section-label">프로젝트 설명</div>
      <v-text-field
        v-model="templateDescription"
        placeholder="프로젝트 설명을 입력해주세요."
        variant="outlined"
        class="mb-4"
      />

      <!-- 시작/마감 베이스라인 -->
      <!-- 베이스라인 일정 -->
        <!-- <div class="section-label">베이스라인 일정</div> -->
        <v-container fluid class="pa-0">
        <v-row dense>
            <v-col cols="12" sm="6">
            <div class="baseline-label">시작 베이스라인</div>
            <div class="sub-label">목표로 하는 프로젝트 시작일</div>
            <v-text-field
                v-model="startDate"
                type="date"
                variant="outlined"
                density="compact"
                class="baseline-field"
            />
            </v-col>

            <v-col cols="12" sm="6">
            <div class="baseline-label">마감 베이스라인</div>
            <div class="sub-label">목표로 하는 프로젝트 마감일</div>
            <v-text-field
                v-model="endDate"
                type="date"
                variant="outlined"
                density="compact"
                class="baseline-field"
            />
            </v-col>
        </v-row>
        </v-container>


      <!-- 템플릿 적용 / 팀장 초대 등 다른 요소는 여기에 추가 -->
       <div class="section-label">템플릿 적용</div>
            <div class="template-select-row">
            <!-- 템플릿 드롭다운 -->
            <v-select
                v-model="selectedTemplate"
                :items="templateList"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                return-object
                class="template-select"
                prepend-icon="mdi-folder-outline"
                placeholder="템플릿을 선택해주세요."
            />

            <!-- 선택 초기화 버튼 -->
            <v-btn
                variant="outlined"
                class="ml-2"
                @click="resetSelection"
            >
                선택 초기화
            </v-btn>

            <!-- 편집하기 버튼 -->
            <v-btn
                variant="outlined"
                class="ml-2"
                prepend-icon="mdi-pencil-outline"
                @click="editTemplate"
            >
                편집하기
            </v-btn>
        </div>

        <VueFlow
            ref="vueFlowRef" 
            v-model:nodes="flowNodes"
            v-model:edges="flowEdges"
            fit-view
            class="template-flow"
            :node-types="nodeTypes"
          >
            <Background />
            <Controls />
        </VueFlow>
    
    
    
    
    
    
    
    </template>
    
    <!-- 우측 사이드바 -->
    <template #sidebar></template>
  </BasicLayout>
</template>

<script setup>
import BasicLayout from '@/components/layout/BasicLayout.vue';
import { ref } from 'vue';
import dagre from '@dagrejs/dagre'
import { Position } from '@vue-flow/core'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { markRaw } from 'vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import TemplateViewNode from '@/components/template/TemplateViewNode.vue'

const nodeTypes = {
  custom: markRaw(TemplateViewNode)
}

const templateName = ref('');
const templateDescription = ref('');
const startDate = ref('2025-05-14');
const endDate = ref('2025-06-30');


const selectedTemplate = ref(null)

const templateList = [
  { id: 1, name: 'SS 블라우스 개발 템플릿' },
  { id: 2, name: '기본 프로젝트 템플릿' },
  { id: 3, name: '제작 견적 템플릿' },
]

// 초기화
const resetSelection = () => {
  selectedTemplate.value = null
}

// 편집 버튼 클릭
const editTemplate = () => {
  if (!selectedTemplate.value) {
    alert('편집할 템플릿을 먼저 선택해주세요.')
    return
  }
  // 편집 로직 연결
  console.log('편집:', selectedTemplate.value)
}


</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: left;
}

.section-label {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 10px;
  text-align: left;
}

.baseline-label {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.sub-label {
  font-size: 12px;
  color: gray;
  margin-bottom: 6px;
}

.baseline-field {
  width: 100%;
}

.baseline-row {
  gap: 16px;
  display: flex; flex-direction: row;
}

.template-select-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-select {
  width: 360px;
}
</style>
