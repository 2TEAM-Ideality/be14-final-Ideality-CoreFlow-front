<script setup>
import ApprovalLayout from '@/components/layout/ApprovalLayout.vue'
</script>

<template>
  <ApprovalLayout>
    <template #left>
      <div style="background: #e3f2fd; height: 100vh; padding: 20px;">
        📂 결재 내역
      </div>
    </template>

    <template #right>
      <div style="background: #fff3e0; height: 100vh; padding: 20px;">
        📝 수신 / 발신 / 결제 처리
      </div>
    </template>
  </ApprovalLayout>
</template>
