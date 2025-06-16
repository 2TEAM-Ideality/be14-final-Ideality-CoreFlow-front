<script setup>
import { ref, computed, watch } from 'vue'
import ApprovalLayout from '@/components/layout/ApprovalLayout.vue'
import ApprovalHistory from '@/components/approval/ApprovalHistory.vue';
import ApprovalDetails from '@/components/approval/ApprovalDetails.vue';
import CreateApproval from '@/components/approval/CreateApproval.vue';

const selectedApprovalId = ref(null)
const selectedTab = ref(null)

function handelShowDetails() {
  selectedApprovalId.value = null
  currentTabLabel.value = '결재 상세 조회'
  showDetails.value = false;
  showCreateApproval.value = false;
}

function handelShowCreateApproval() {
  selectedApprovalId.value = null
  showCreateApproval.value = true
  showDetails.value = false;
  selectedTab.value = 'create'
  currentTabLabel.value = '결재 요청'
}

function handleSelectApproval(id) {
  selectedApprovalId.value = id
}
function handleSelectTab(type) {
  selectedTab.value = type
}

const showDetails = ref(false);
const showCreateApproval = ref(false)

watch (() => selectedApprovalId.value, (newId) => {
  if (!newId) return
  showDetails.value = true;
  showCreateApproval.value = false;
})

const currentTabLabel = ref('결재 상세 조회')

  watch(() => selectedTab.value, (newTab) => {
    if (!newTab) return // null이면 무시
    if (newTab === 'received') {
      currentTabLabel.value = '수신 상세 조회'
    } else if (newTab === 'sent') {
      currentTabLabel.value = '발신 상세 조회'
    } else {
      currentTabLabel.value = '결재 요청'
    }
  })
</script>

<template>
  <ApprovalLayout>
    <template #left>
      <div style="background: white; height: calc(100vh - 50px); padding: 50px; border-right: 1px solid black">
        <div style="height: 100%">  
          <ApprovalHistory @select-approval="handleSelectApproval" @select-tab="handleSelectTab"/>
        </div>
        <div style="display: flex; justify-content: right;">
          <button class="create-btn" @click="handelShowCreateApproval">결재 요청하기</button>
        </div>
      </div>
    </template>

    <template #right>
      <div style="background: white; height: calc(100vh - 50px); padding: 50px;">
        <div class="header">
            <h3 class="sub-title">
                {{ currentTabLabel }}
            </h3>
            <button @click="handelShowDetails" class="close-btn">X</button>
        </div>
        <div class="divide"/>
        <ApprovalDetails v-if="showDetails" :approvalId = selectedApprovalId />
        <CreateApproval v-if="showCreateApproval" />
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
  .header {
    display: flex;
    justify-content: space-between;
  }
  .close-btn {
    font-size: 20px;
    color: gray;
    background: none;
    border: none;
    cursor: pointer;
  }
  .divide {
    display: flex;
    border: 1px solid black;
    margin-top: 6px;
    margin-bottom: 6px;
  }
</style>
