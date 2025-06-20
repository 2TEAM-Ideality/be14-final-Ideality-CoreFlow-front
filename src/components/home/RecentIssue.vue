<template>
  <div class="issue-container">
    <!-- 결재 알림 -->
    <div class="issue-item">
      <div class="item-left">
        <v-btn icon color="info" class="approval-button" @click="goToApproval">
          <v-icon>mdi-file-document-alert-outline</v-icon>
        </v-btn>
        <div class="issue-data">
          <div class="issue-title">결재 알림</div>
          <div class="issue-desc">n개</div>
        </div>
      </div>
      <v-btn icon variant="plain" class="link-icon" size="small" @click="goToApproval">
        <v-icon color="gray">mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- 부서 일정 -->
    <div class="issue-item">
      <div class="item-left">
        <v-btn icon color="success" class="approval-button">
          <v-icon>mdi-calendar-blank</v-icon>
        </v-btn>
        <div class="issue-data">
          <div class="issue-title"> {{  props.deptInfo  }} 부서 일정</div>
          <div class="issue-desc">{{ props.todayDeptList?.length || 0 }} 개</div>
        </div>
      </div>
      <v-btn icon variant="plain" class="link-icon" size="small" @click="goToCalendar">
        <v-icon color="gray">mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- 개인 일정 -->
    <div class="issue-item">
      <div class="item-left">
        <v-btn icon color="primary" class="approval-button">
          <v-icon>mdi-calendar-account</v-icon>
        </v-btn>
        <div class="issue-data">
          <div class="issue-title">개인 일정</div>
          <div class="issue-desc">{{ props.todayCount }} 개</div>
        </div>
      </div>
      <v-btn icon variant="plain" class="link-icon" size="small" @click="goToCalendar">
        <v-icon color="gray">mdi-chevron-right</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  todayDeptList: {
    type: Array,
    default: () => []
  },
  todayCount: {
    type: Number,
    required: true
  },
  deptInfo : {
    type: String,
    required: true
  }
})

console.log(props.todayCount)
const router = useRouter()

const goToApproval = () => {
  router.push(`/approval`)
}

const goToCalendar = () => {
    router.push(`/calendar`)
}
</script>


<style scoped>
.issue-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap; /* 👉 자동 줄바꿈 */
  justify-content: space-between;
  gap: 16px;
}

.issue-item {
    border-radius: 15px;
    padding: 20px;
    background-color: rgb(245, 245, 245);
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
}


.item-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
}
.issue-data {
    display: flex; 
    flex-direction: column;
    gap: 5px;
}
.issue-title {
    color: #73726E ;
    font-weight: bold;
}
.issue-desc {
    font-size: 12px;
    color: #73726E ;
}

.approval-button {
  border-radius: 15px;
}

.link-icon {
  border-radius: 15px;
  background-color: white;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
</style>
