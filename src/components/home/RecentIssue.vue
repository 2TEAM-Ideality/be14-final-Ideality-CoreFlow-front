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
          <div class="issue-desc">태스크 {{ props.warningDeadline?.taskCount }} 건 /  세부일정 {{ props.warningDeadline?.detailCount || 0 }} 건</div>
        </div>
      </div>
      <v-btn icon variant="plain" class="link-icon" size="small" @click="openDelayAlert = true">
        <v-icon color="gray">mdi-chevron-right</v-icon>
      </v-btn>
    </div>


  <!-- 결재 알림 -->
    <div class="issue-item">
      <div class="item-left">
        <v-btn icon color="info" class="approval-button" @click="openApprovalModal">
          <v-icon>mdi-file-document-alert-outline</v-icon>
        </v-btn>
        <div class="issue-data">
          <div class="issue-title">결재 알림</div>
          <div class="issue-desc">{{ approvalData?.length || 0 }}개</div>
        </div>
      </div>
      <v-btn icon variant="plain" class="link-icon" size="small" @click="openApprovalModal">
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

  </div>

  <v-dialog v-model="openDelayAlert" max-width="600px">
    <v-card style="padding: 5%; ">
      <v-card-title class="text-h6 font-weight-bold" style="display:flex; flex-direction: row; gap: 10px; align-items: center;">
        마감 임박 일정
        <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
      </v-card-title>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="mt-3 mb-2" color="warning">
        <v-tab value="task">태스크 {{ props.warningDeadline?.taskCount }}</v-tab>
        <v-tab value="subtask">세부일정 {{ props.warningDeadline?.detailCount }}</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="task">
          <!-- TASK LIST -->
          <v-list
            v-if="props.warningDeadline?.tasks?.length"
            style="max-height: 400px; overflow-y: auto; gap: 10px; display: flex; flex-direction: column; padding:  20px 10px;"
          >
          <!-- v-if="props.warningDeadline?.tasks?.length" -->
            <v-list-item
              :key="'task-' + index"
              v-for="(item, index) in props.warningDeadline?.tasks"
              style="cursor: pointer; background-color: #eeee; border-radius:15px; padding: 10px;" 
              @click="goToTask(item.workId)"
            >
              <!-- v-for="(item, index) in props.warningDeadline.tasks" -->

              <v-list-item-content>
                <div class="warning-item">
                  <div>{{ item.name }}</div>
                  <div> 🔔 {{ item.endBaseLine }} 마감</div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <div v-else class="text-grey text-caption" style="height: 400px; padding:  30px 20px;">
            임박한 태스크가 없습니다.
          </div>
        </v-window-item>

        <v-window-item value="subtask">
          <v-list v-if="props.warningDeadline?.subtasks?.length" 
          style="max-height: 400px; overflow-y: auto; gap: 10px; display: flex; flex-direction: column; padding:  20px 10px;">
          <!-- <v-list v-if="props.warningDeadline?.subtasks?.length"> -->
            <v-list-item
              v-for="(item, index) in props.warningDeadline.subtasks"
              :key="'subtask-' + index"
              @click="goToDetail(item.parentTaskId, item.workId)"
              style="cursor: pointer; background-color: #eeee; border-radius:15px; padding: 10px;" 
            >
            <!-- v-for="(item, index) in props.warningDeadline.tasks" -->
              <v-list-item-content>
                <div class="warning-item">
                  <div>{{ item.name }}</div>
                  <div> 🔔 {{ item.endBaseLine }} 마감</div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <div v-else class="text-grey text-caption" style="height: 300px; padding:  30px 20px;">
            임박한 세부일정이 없습니다.</div>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>



 <!-- 결재 알림 모달 -->
    <v-dialog v-model="openApprovalAlert" max-width="600px">
      <v-card style="padding: 5%;">
        <v-card-title class="text-h6 font-weight-bold" style="display:flex; flex-direction: row; gap: 10px; align-items: center;">
          결재 알림
          <v-icon color="info" class="mr-2">mdi-file-document-alert-outline</v-icon>
        </v-card-title>
        
        <!-- 결재 알림 리스트 -->
        <v-list
          v-if="approvalData && approvalData.length"
          style="max-height: 400px; overflow-y: auto; gap: 10px; display: flex; flex-direction: column; padding: 20px 10px;">
          <v-list-item
            :key="'approval-' + index"
            v-for="(item, index) in approvalData"
            @click="goToApprovalDetail(item.id,item.targetId)"
            style="cursor: pointer; background-color: #eeee; border-radius:15px; padding: 10px;">
            <v-list-item-content>
              <div class="warning-item">
                <div>{{ item.content }}</div>
                <div> 🔔</div>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        
        <div v-else class="text-grey text-caption" style="height: 400px; padding: 30px 20px;">
          결재 알림이 없습니다.
        </div>
      </v-card>
    </v-dialog>

</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import api from '@/api.js'
import { useNotificationStore } from '@/stores/notificationStore'

const notificationStore = useNotificationStore()
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
  },
    approvalData: {   // ✅ 이거 추가
    type: Array,
    default: () => []
  }
})


const router = useRouter()

const openDelayAlert = ref(false)   // 마감 임박 리스트 모달 
const activeTab = ref('task')

// 테스트용 더미 데이터
const warningDeadlineTest = {
  taskCount: 2,
  detailCounts: 3,
  tasks: [
    { workId: 1, name: '디자인 기획서 정리', parentTaskId: null, endBaseLine: '2025-06-28' },
    { workId: 2, name: 'UI 가이드라인 수립', parentTaskId: null, endBaseLine: '2025-06-29' },
    { workId: 1, name: '디자인 기획서 정리', parentTaskId: null, endBaseLine: '2025-06-28' },
    { workId: 2, name: 'UI 가이드라인 수립', parentTaskId: null, endBaseLine: '2025-06-29' },
    { workId: 1, name: '디자인 기획서 정리', parentTaskId: null, endBaseLine: '2025-06-28' },
    { workId: 2, name: 'UI 가이드라인 수립', parentTaskId: null, endBaseLine: '2025-06-29' },
    { workId: 1, name: '디자인 기획서 정리', parentTaskId: null, endBaseLine: '2025-06-28' },
    { workId: 2, name: 'UI 가이드라인 수립', parentTaskId: null, endBaseLine: '2025-06-29' }
  ],
  subtasks: [
    { workId: 193, name: '색상 가이드 정리', parentTaskId: 108, endBaseLine: '2025-06-26' },
    { workId: 193, name: '폰트 정리', parentTaskId: 108, endBaseLine: '2025-06-27' },
    { workId: 193, name: '컴포넌트 표준 정리', parentTaskId: 108, endBaseLine: '2025-06-27' }
  ]
}
    // private Long workId;
    // private Long parentTaskId;
    // private String name;

const openApprovalAlert = ref(false)

const openApprovalModal = () => {
  openApprovalAlert.value = true
}

const goToApprovalDetail = async (id, targetId) => {
  try {
    console.log(`✅ 읽음 처리 요청: /api/notifications/${id}/read`)
    await api.patch(`/api/notifications/${id}/read`)
     notificationStore.markNotificationAsRead(id)  // ✅ 추가
    console.log(`✅ 알림(${id}) 읽음 처리 완료`)
  } catch (err) {
    console.error(`❌ 알림(${id}) 읽음 처리 실패`, err)
  } finally {
    router.push(`/approval/${targetId}`)
  }
}

const goToCalendar = () => {
    router.push(`/calendar`)
}

const goToTask = (taskId) => {
  router.push(`/task/${taskId}`)
}

const goToDetail = (taskId, workId) => {
  router.push({
    path: `/task/${taskId}`,
    query: {
      tab: 'detail',
      openModal: 'true',
      workId: workId
    }
  })
}



</script>


<style scoped>
.issue-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap; 
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
.warning-item{
  display: flex; 
  flex-direction: row; 
  justify-content: space-between;
   padding : 5px 20px;
   border-radius: 15px;
   font-size: 15px;
}
</style>
