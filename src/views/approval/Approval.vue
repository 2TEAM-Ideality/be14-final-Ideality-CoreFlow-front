<script setup>
import {ref} from 'vue'
import ApprovalLayout from '@/components/layout/ApprovalLayout.vue'
import ApprovalHistory from '@/components/approval/ApprovalHistory.vue';
import ApprovalDetails from '@/components/approval/ApprovalDetails.vue';

const selectedApprovalId = ref(null)
const selectedTab = ref('received')
function handleSelectApproval(id) {
  selectedApprovalId.value = id
}
function handleSelectTab(type) {
  selectedTab.value = type
}
</script>

<template>
  <ApprovalLayout>
    <template #left>
      <div style="background: white; height: calc(100vh - 50px); padding: 50px; border-right: 1px solid black">
        <div style="height: 100%">  
          <ApprovalHistory @select-approval="handleSelectApproval" @select-tab="handleSelectTab"/>
        </div>
        <div style="display: flex; justify-content: right;">
          <button class="create-btn">결재 요청하기</button>
        </div>
      </div>
    </template>

    <template #right>
      <div style="background: white; height: calc(100vh - 50px); padding: 20px;">
        <ApprovalDetails :approvalId = selectedApprovalId :selectedTab = selectedTab />
      </div>
    </template>
  </ApprovalLayout>
</template>

<style scoped>
  .create-btn {
    background-color: #9090ff;
    padding: 6px 12px;
    border-radius: 12px;
    color: white
  }
  .create-btn:hover {
    background-color: #020725;
  }
</style>
