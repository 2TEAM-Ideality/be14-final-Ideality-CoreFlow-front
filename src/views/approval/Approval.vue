<script setup>
import { ref, computed, watch } from 'vue'
import ApprovalLayout from '@/components/layout/ApprovalLayout.vue'
import ApprovalHistory from '@/components/approval/ApprovalHistory.vue';
import ApprovalDetails from '@/components/approval/ApprovalDetails.vue';
import CreateApproval from '@/components/approval/CreateApproval.vue';
import { useRouter } from 'vue-router'

const router = useRouter(); 

const selectedApprovalId = ref(null)

const approvalHistoryRender = ref(0)

function handleReRender() {
    approvalHistoryRender.value++ // 강제 remount
}

function handelShowDetails() {
  // selectedApprovalId.value = null
  // showDetails.value = false;
  showCreateApproval.value = false;
}

function handelShowCreateApproval() {
  selectedApprovalId.value = null
  showCreateApproval.value = true
  showDetails.value = false;
}

function handleSelectApproval(id) {
  // if (selectedApprovalId.value === id && showDetails.value) return
  // selectedApprovalId.value = id
  router.push(`/approval/${id}`)  

}

const showDetails = ref(false);
const showCreateApproval = ref(false)

watch (() => selectedApprovalId.value, (newId, oldId) => {
  if (!newId || newId === oldId) return
  showDetails.value = true;
  showCreateApproval.value = false;
})

</script>

<template>
  <ApprovalLayout>
    <template #left>
      <div style="background: white; height: calc(100vh - 50px); padding: 50px; border-right: 1px solid black">
        <div style="height: 100%">  
          <ApprovalHistory 
            :key="approvalHistoryRender" 
            @select-approval="handleSelectApproval" 
            @select-tab="handleSelectTab"
          />
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
                {{ showCreateApproval ? '결재 요청' : '결재 상세 조회' }}
            </h3>
            <button @click="handelShowDetails">
              <v-icon class="close-btn">mdi-close</v-icon>
            </button>
        </div>
        <div class="divide"/>
        <ApprovalDetails v-if="showDetails" :approvalId = selectedApprovalId @remount="handleReRender" />
        <CreateApproval v-if="showCreateApproval" @remount="handleReRender" />
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
  .close-btn:hover {
    color: black;
  }
  .divide {
    display: flex;
    border: 1px solid black;
    margin-top: 6px;
    margin-bottom: 6px;
  }
</style>
