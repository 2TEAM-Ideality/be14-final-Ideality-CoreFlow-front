<script setup lang="ts">
import BasicLayout from '@/components/layout/BasicLayout.vue';

</script>

<template>
  <BasicLayout>
    <!-- 왼쪽 영역 -->
    <template #main >
        왼쪽 영역
    </template>

    <!-- 오른쪽 영역 -->
    <template #sidebar>
        오른쪽 영역
    </template>
  </BasicLayout>
</template>

<style scoped>


</style>