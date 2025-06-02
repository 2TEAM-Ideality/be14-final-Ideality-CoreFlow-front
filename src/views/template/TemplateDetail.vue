<template>
  <BasicLayout>
    <!-- 왼쪽 영역 -->
    <template #main >
       템플릿 상세 정보 조회
    </template>

    <!-- 오른쪽 영역 -->
    <template #sidebar>
        오른쪽 영역
    </template>
  </BasicLayout>
</template>

<script setup>
import BasicLayout from '@/components/layout/BasicLayout.vue';
</script>