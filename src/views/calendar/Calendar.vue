<script setup>
import CalendarLayout from '@/components/layout/CalendarLayout.vue'
</script>

<template>
  <CalendarLayout>
    <!-- 왼쪽 영역 슬롯 -->
    <template #left>
      <div style="background-color: #f5f5f5; height: 100vh;">좌측</div>
    </template>

    <!-- 중앙 영역 슬롯 -->
    <template #center>
      <div style="background-color: #e3f2fd; height: 100vh;">중앙 콘텐츠</div>
    </template>

    <!-- 오른쪽 영역 슬롯 -->
    <template #right>
      <div style="background-color: #f5f5f5; height: 100vh;">우측</div>
    </template>
  </CalendarLayout>
</template>
