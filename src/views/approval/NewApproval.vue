<template>
      <div class="list-layout">
        <h1 class="page-title">결재 내역</h1>
         <v-divider class="my-6" />
        <div class="content-box">
            <div style="display: flex; flex-direction: row; gap: 10px;">

                <div style="width: 100%;">
                <ApprovalHistory 
                :key="approvalHistoryRender" 
                @select-approval="handleSelectApproval" 
                @select-tab="handleSelectTab"
                />
                
                </div>
                <!-- <div style="width: 20%; display: flex; flex-direction: column; gap: 12px;">
                    <div class="widget-item">
                        <span>처리하지 않은 수신 결재</span>
                    </div>
                    <div class="widget-item">
                        <span>확인하지 않은 수신 참조</span>
                    </div>
                    <div class="widget-item">
                        <span>승인 대기</span>
                    </div>
                    <div class="widget-item">
                        <span>반려</span>
                    </div>

                </div> -->
            </div>
        </div>

        <!-- <div style="background: white; height: calc(100vh - 50px); padding: 50px;"> -->
            <!-- <div class="header">
                <h3 class="sub-title">
                    {{ showCreateApproval ? '결재 요청' : '결재 상세 조회' }}
                </h3>
                <button @click="handelShowDetails">
                <v-icon class="close-btn">mdi-close</v-icon>
                </button>
            </div> -->
            <!-- <div class="divide"/> -->
            <!-- <ApprovalDetails v-if="showDetails" :approvalId = selectedApprovalId @remount="handleReRender" />
            <CreateApproval v-if="showCreateApproval" @remount="handleReRender" /> -->
        <!-- </div> -->
        
        
        
      </div>

</template>

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
  selectedApprovalId.value = null
  showDetails.value = false;
  showCreateApproval.value = false;
}

function handelShowCreateApproval() {
  selectedApprovalId.value = null
  showCreateApproval.value = true
  showDetails.value = false;
}

function handleSelectApproval(id) {
  router.push(`/approval/${id}`)  

}
const goToCreateApproval = () => {
  router.push(`/approval/create`)
}

const showDetails = ref(false);
const showCreateApproval = ref(false)

watch (() => selectedApprovalId.value, (newId, oldId) => {
  if (!newId || newId === oldId) return
  showDetails.value = true;
  showCreateApproval.value = false;
})

</script>

<style scoped>
.widget-item {
    padding: 10px;
    background-color: #f2f5ff;  
    border-radius: 5px;
    width: 100%;
}

.list-layout {
  padding: 7% 15%;
  min-height: 100vh;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}


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