<template>
  <div class="container">
    <!-- 세부일정 테이블 -->
    <table class="progress-table">
      <thead>
        <tr>
          <th>상태</th> <!-- 상태 컬럼 왼쪽으로 배치 -->
          <th>세부일정명</th>
          <th>담당부서</th>
          <th>예상마감일</th>
          <th>지연일</th>
          <th>진척률</th>
          <th>총 진척률</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index" @click="openModal(item.workId)" style="cursor: pointer;">
          <!-- 상태 버튼 -->
          <td>
            <!-- 상태에 따라 다른 버튼을 보여줌 -->
            <v-btn 
              v-if="item.status === 'PENDING'" 
              @click.stop="confirmAndUpdateStatus(item, 'PROGRESS')" 
              icon  variant="plain"> 
              <v-icon size="35" color="#B2B2B2">mdi-play-circle</v-icon> <!-- 시작 버튼 아이콘 -->
            </v-btn>

            <v-btn 
              v-else-if="item.status === 'PROGRESS'" 
              @click.stop="confirmAndUpdateStatus(item, 'COMPLETED')" 
              icon variant="plain"> 
              <v-icon size="35" color="#307CFF">mdi-pause-circle</v-icon> <!-- 진행 중 버튼 아이콘 -->
            </v-btn>

            <v-btn 
              v-else-if="item.status === 'COMPLETED'" 
              icon varaint="plain"> <!-- 초록색 완료 버튼 (비활성화) -->
              <v-icon size="35" color="#34C759">mdi-check-circle</v-icon> <!-- 완료 버튼 아이콘 -->
            </v-btn>
          </td>
          
          <td>{{ item.taskName }}</td>
          <td>{{ item.deptName }}</td>
          <td>{{ item.endExpect }}</td>
          <td>{{ item.delayDays }}일</td>
          <td>{{ item.progressRate }}%</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <!-- 수정 가능한 모달 컴포넌트 추가 -->

    <TaskModal
      :workId="selectedWorkId"
      :isVisible="isModalVisible"
      :isEditMode="isEditMode"
      @close-modal="closeModal"
      @open-edit-modal="openEditModal"
      @close-edit-modal="closeEditModal"
      @update-task="updateTaskInList"
    />
    
    <!-- 확인 대화상자 -->
    <v-dialog v-model="showDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">{{ dialogMessage }}</v-card-title>
        <v-card-actions>
          <v-btn color="primary" @click="confirmStatusChange">확인</v-btn>
          <v-btn color="grey" @click="cancelStatusChange">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <div class="total-progress">
      
      <p class="right-align">총 진척률: {{ totalProgress }}%</p>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/stores/userStore";
import { useTaskStore } from "@/stores/taskStore"; // Pinia store 임포트
import TaskModal from "@/components/task/DetailModal.vue"; // 모달 컴포넌트 import
import { ref } from 'vue'; // ref 추가 (경고창 처리)



export default {
  props: {
    taskId: Number,
    workId: Number
  },

  watch: {
    workId(val) {
      if (val) {
        this.openModal(val)
      }
    }
  },


  components: {
    TaskModal, // 모달 컴포넌트 등록
  },
  data() {
    return {
      totalProgress: 0,
      selectedWorkId: null, // 클릭한 세부일정의 workId 저장
      isModalVisible: false, // 모달 표시 여부
      isEditMode: false, // 수정 모드 상태
      showDialog: ref(false), // 확인 대화상자 상태
      dialogMessage: ref(''), // 확인 메시지 내용
      itemToUpdate: null, // 확인을 위한 임시 아이템
      newStatus: null, // 새로운 상태값
      taskId: this.$route.params.taskId,  // route.params에서 taskId를 받음
    };
  },
  computed: {
    // Pinia store에서 상태 가져오기
    items() {
      const taskStore = useTaskStore();
      return taskStore.items.filter(item => item.status !== "DELETED");
    },
    totalProgress() {
      const taskStore = useTaskStore();
      return taskStore.totalProgress;
    }
  }
,
async mounted() {
    console.log('Task ID from URL:', this.taskId);
    const parentTaskId = this.taskId;
    const userStore = useUserStore();
    const token = userStore.accessToken;

    // 기존 로직
    if (parentTaskId && token) {
      const taskStore = useTaskStore();
      taskStore.fetchItems(parentTaskId, token);
      taskStore.fetchTotalProgress(parentTaskId, token);
    }

    // ✅ props로 넘어온 workId가 존재하면 모달 열기
    if (this.workId) {
      this.openModal(this.workId);
    }
  
},
  methods: {
confirmAndUpdateStatus(item, newStatus) {
  if (item.status === "COMPLETED") {
    this.dialogMessage = "이미 완료된 일정입니다!";
    this.showDialog = true; // 경고창 표시
    return; // 진행 중인 상태로 유지
  }

  // 진척률이 100% 미만일 경우
  if (newStatus === "COMPLETED" && item.progressRate < 100) {
    this.dialogMessage = "진척률이 100%가 아닙니다!";
    this.showDialog = true; // 경고창 표시
    return; // 진행 중인 상태로 유지
  }

  this.dialogMessage = `해당 일정을 ${newStatus === "PROGRESS" ? "시작" : "완료"}하시겠습니까?`;
  this.itemToUpdate = item;
  this.newStatus = newStatus;
  this.showDialog = true;
},

    handleCompletedStatus(item) {
  this.dialogMessage = "이미 완료된 일정입니다!";
  this.showDialog = true; // 경고창 표시
}
,

    // 확인 후 상태 변경
    async confirmStatusChange() {
      const taskStore = useTaskStore();
      if (this.newStatus === "PROGRESS") {
        await taskStore.startTask(this.itemToUpdate.workId); // 시작 API 호출
      } else if (this.newStatus === "COMPLETED") {
        await taskStore.completeTask(this.itemToUpdate.workId); // 완료 API 호출
      }
      this.showDialog = false; // 대화상자 닫기
    },

    // 대화상자 취소
    cancelStatusChange() {
      this.showDialog = false;
    },

     async updateTaskInList(updatedTask) {
    const index = this.items.findIndex(item => item.workId === updatedTask.workId);
    if (index !== -1) {
      // 수정된 항목을 배열에서 업데이트
      this.items.splice(index, 1, updatedTask);
    }
    const parentTaskId = this.taskId;
      const userStore = useUserStore();
      const token = userStore.accessToken;
      const taskStore = useTaskStore();
      await taskStore.fetchTotalProgress(parentTaskId, token); // 수정 후 totalProgress 갱신
       // 리스트를 다시 불러와서 상태 반영
    await taskStore.fetchItems(parentTaskId, token);
  },


    openModal(workId) {
      this.selectedWorkId = workId; // 클릭한 세부일정의 workId 저장
      this.isModalVisible = true; // 모달 표시
      this.isEditMode = false; // 기본적으로 조회 모드로 설정
    },
    closeModal() {
      this.isModalVisible = false; // 모달 숨기기
    },
    openEditModal() {
      this.isEditMode = true; // 수정 모드로 설정
    },
    closeEditModal() {
      this.isEditMode = false; // 수정 모드 취소
    }
  },
};


</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.progress-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.progress-table th, .progress-table td {
  padding: 10px;
  text-align: center;
}

.progress-table th {
  background-color: #f2f2f2;
}

.progress-table td {
  border-bottom: 1px solid #ddd;
}

.progress-table td:last-child {
  border-right: none;
}

.total-progress {
  font-size: 18px;
  font-weight: bold;
}

.right-align {
  text-align: right; /* 총 진척률 오른쪽 정렬 */
}

/* 아이콘이 원에 감싸지지 않도록 버튼 스타일 수정 */
.no-round-btn {
  border-radius: 0; /* 기본 원 모양 제거 */
  background-color: transparent; /* 배경 없애기 */
  box-shadow: none; /* 그림자 없애기 */
}

.v-btn {
  font-size: 16px;
  padding: 0; /* 버튼 크기 최소화 */
  margin: 0; /* 버튼 간격 없애기 */
}

.v-btn small {
  font-size: 14px; /* 작은 버튼 사이즈 */
}
</style>
