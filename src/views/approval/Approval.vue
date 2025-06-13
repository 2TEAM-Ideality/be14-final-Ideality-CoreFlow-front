<script setup>
import ApprovalLayout from '@/components/layout/ApprovalLayout.vue'
import ApprovalHistory from '@/components/approval/ApprovalHistory.vue';
</script>

<template>
  <ApprovalLayout>
    <template #left>
      <div style="background: white; height: calc(100vh - 50px); padding: 50px; border-right: 1px solid black">
        <ApprovalHistory/>
      </div>
    </template>

    <template #right>
      <div style="background: white; height: calc(100vh - 50px); padding: 20px;">
        📝 수신 / 발신 / 결제 처리
      </div>
    </template>
  </ApprovalLayout>
</template>
