<template>
  <div class="issue-container">
    <!-- 지연 임박 알림 -->
    <div class="issue-item">
      <div class="item-left">
        <v-btn icon color="warning" class="approval-button" @click="goToDelayAlert">
          <v-icon>mdi-alert-outline</v-icon>
        </v-btn>
        <div class="issue-data">
          <div class="issue-title">마감 임박</div>
          <div class="issue-desc">태스크 {{ props.warningDeadline?.taskCount }} 건 /  세부일정 {{ props.warningDeadline?.detailCounts || 0 }} 건</div>
        </div>
      </div>
      <v-btn icon variant="plain" class="link-icon" size="small" @click="openDelayAlert = true">
        <v-icon color="gray">mdi-chevron-right</v-icon>
      </v-btn>
    </div>

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
   

    <!-- 결재 알림 -->
    <!-- <div class="issue-item">
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
    </div> -->

    <!-- 부서 일정 -->
    <div class="issue-item">
      <div class="item-left">
        <v-btn icon color="success" class="approval-button">
          <v-icon>mdi-calendar-blank</v-icon>
        </v-btn>
        <div class="issue-data">
          <!-- <div class="issue-title"> {{  props.deptInfo  }} 일정</div> -->
          <div class="issue-title">오늘의 일정 -  {{  props.deptInfo  }} </div>
          <div class="issue-desc">{{ props.todayDeptList?.length + props.todayCount || 0 }} 개</div>
        </div>
      </div>
      <v-btn icon variant="plain" class="link-icon" size="small" @click="goToCalendar">
        <v-icon color="gray">mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- 개인 일정 -->
    <!-- <div class="issue-item">
      <div class="item-left">
        <v-btn icon color="primary" class="approval-button">
          <v-icon>mdi-calendar-account</v-icon>
        </v-btn>
        <div class="issue-data">
          <div class="issue-title">오늘의 일정</div>
          <div class="issue-desc">{{ props.todayDeptList?.length + props.todayCount }} 개</div>
        </div>
      </div>
      <v-btn icon variant="plain" class="link-icon" size="small" @click="goToCalendar">
        <v-icon color="gray">mdi-chevron-right</v-icon>
      </v-btn>
    </div> -->
  </div>

  <v-dialog v-model="openDelayAlert" max-width="600px">
    <v-card style="padding: 5%; ">
      <v-card-title class="text-h6 font-weight-bold" style="display:flex; flex-direction: row; gap: 10px; align-items: center;">
        마감 임박 일정
        <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
      </v-card-title>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="mt-3 mb-2" color="warning">
        <v-tab value="task">태스크</v-tab>
        <v-tab value="subtask">세부일정</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="task">
          <!-- TASK LIST -->
          <v-list
            v-if="props.warningDeadline?.tasks?.length"
            style="max-height: 300px; overflow-y: auto;"
          >
            <v-list-item
              v-for="(item, index) in props.warningDeadline.tasks"
              :key="'task-' + index"
            >
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  마감일: {{ item.endBaseLine }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <div v-else class="text-grey text-caption" style="height: 300px;">
            임박한 태스크가 없습니다.
          </div>
        </v-window-item>

        <v-window-item value="subtask">
          <v-list v-if="props.warningDeadline?.subtasks?.length">
            <v-list-item
              v-for="(item, index) in props.warningDeadline.subtasks"
              :key="'subtask-' + index"
            >
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  마감일: {{ item.endBaseLine }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <div v-else class="text-grey text-caption" style="height: 300px;">
            임박한 세부일정이 없습니다.</div>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

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
  },
  warningDeadline : {
    type: Object,
    required: true
  }
})

    // int taskCount;
    // int detailCount;
    // private List<WorkSummaryDTO> tasks;
    // private List<WorkSummaryDTO> subtasks;
const router = useRouter()

const openDelayAlert = ref(false)   // 마감 임박 리스트 모달 
const activeTab = ref('task')

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
    text-align: left;
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
