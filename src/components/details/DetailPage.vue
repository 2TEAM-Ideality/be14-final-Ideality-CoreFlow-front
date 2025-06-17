<!-- MyPage.vue -->
<template>
  <TaskLayout>
    <template v-slot:main>
      <!-- main 콘텐츠 -->
      <div class="page-title">Page Title</div>
      <div class="tab-menu">
        <button class="tab-button active">Tab 1</button>
        <button class="tab-button">Tab 2</button>
      </div>
    </template>

    <template v-slot:sidebar>
      <!-- sidebar 콘텐츠 -->
      <p>Sidebar content goes here.</p>
    </template>
  </TaskLayout>
</template>

<script>
// TaskLayout.vue 컴포넌트 임포트
import TaskLayout from '@/components/layout/TaskLayout.vue';

export default {
  name: 'DetailPage',
  components: {
    TaskLayout,  // 컴포넌트 등록
  },
};
</script>

<style scoped>
/* 스타일은 필요한 경우 추가 */
</style>
