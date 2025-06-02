<script setup lang="ts">
import BasicLayout from '@/components/common/BasicLayout.vue';

</script>

<template>
  <BasicLayout>
    <!-- 왼쪽 영역 -->
    <template #main >
        <div class="left">
            <h1 class="title">🧵 SS 블라우스 개발 템플릿</h1>
            <p class="description">봄-여름 시즌 블라우스 제품의 기획부터 생산까지 관리하는 템플릿</p>

        </div>
    
      <!-- 프로세스 구조도 컴포넌트 삽입 -->
      <!-- <ProcessTreeView :nodes="..." /> -->
    </template>

    <!-- 오른쪽 영역 -->
    <template #sidebar>

        데이터 필요
      <!-- <SidebarInfo
        :creator="'홍길동 팀장'"
        :createdAt="'25-05-12'"
        :updatedAt="'25-05-12'"
        :totalDuration="25"
        :taskCount="10"
        :departments="['기획팀', '디자인팀', '개발팀']"
      /> -->
    </template>
  </BasicLayout>
</template>

<style scoped>


</style>