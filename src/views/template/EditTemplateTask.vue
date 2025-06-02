<script setup>
import { ref } from 'vue'
import PipePage from '@/views/test/PipePage.vue'

const templateName = ref('SS 블라우스 개발 템플릿')
</script>

<template>
  <v-container fluid class="pa-6">
    <div class="text-grey text-body-2 mb-4" style="text-align: left;">
      템플릿 &gt; 템플릿 생성 &gt; 템플릿 편집
    </div>

    <div class="flow-wrapper">
      <!-- 이름 전달 -->
      <PipePage :templateName="templateName" />
    </div>
  </v-container>
</template>


<style scoped>
.purple--text {
  color: #8b5cf6 !important;
}

.flow-wrapper {
  height: calc(100vh - 300px);
  min-height: 600px;
  width: 100%;
  background-color: #fff;
}
</style>
