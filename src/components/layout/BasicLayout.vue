<template>
  <div class="template-wrapper">
    <div style="display: flex; flex-direction: row; width :100%; justify-content: flex-start">
      <v-btn variant="text" color="grey darken-1" @click="goBack">
        <v-icon start>mdi-arrow-left</v-icon>
        <!-- 뒤로가기 -->
      </v-btn>
    </div>
    <div class="template-layout">
      <!-- 왼쪽: main -->
      <div class="template-main">
        <slot name="main" />
      </div>

      <!-- 오른쪽: sidebar -->
      <div class="template-sidebar">
        <slot name="sidebar" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.template-wrapper {
  padding-top: 2%;
  padding-left: 3%;
}
.template-layout {
  display: grid;
  grid-template-columns: 9fr 3fr; 
  padding-left: 12%;
  padding-right: 15%;
  padding-top : 2%;
  padding-bottom: 5%;
}

.template-main {
  min-width: 0;
  padding-right: 8%;
}

.template-sidebar {
  padding-top: 30%;
  padding-left: 15%;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}
.v-btn:hover {
  background-color: transparent !important;
  box-shadow: none !important;
  opacity: 1 !important;
}
</style>