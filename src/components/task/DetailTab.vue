<template>
  <div class="container">
    <table class="progress-table">
      <thead>
        <tr>
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
      @update-task="updateTaskInList" 
    />
    
    <div class="total-progress">
      <p class="right-align">총 진척률: {{ totalProgress }}%</p>
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/userStore";
import { useTaskStore } from "@/stores/taskStore"; // Pinia store 임포트
import TaskModal from "@/components/task/DetailModal.vue"; // 모달 컴포넌트 import

export default {
  components: {
    TaskModal, // 모달 컴포넌트 등록
  },
  data() {
    return {

      totalProgress: 0,
      selectedWorkId: null, // 클릭한 세부일정의 workId 저장
      isModalVisible: false, // 모달 표시 여부
      isEditMode: false, // 수정 모드 상태
    };
  },
  computed: {
    // Pinia store에서 상태 가져오기
    items() {
      const taskStore = useTaskStore();
      return taskStore.items.filter(item => item.status !== "DELETED");
    },
        // totalProgress 값을 userStore에서 가져오기
    totalProgress() {
      const taskStore = useTaskStore();
      return taskStore.totalProgress;
    }
  },
  async mounted() {
    const route = useRoute();
    const parentTaskId = route.params.taskId;
    const userStore = useUserStore();
    const token = userStore.accessToken;

    if (parentTaskId && token) {
      const taskStore = useTaskStore();
      await taskStore.fetchItems(parentTaskId, token); // 데이터를 불러옴
      await taskStore.fetchTotalProgress(parentTaskId, token); // 총 진척률 가져오기
    } else {
      console.error("parentTaskId나 token이 없습니다.");
    }
  },
  methods: {
      updateTaskInList(updatedTask) {
    const index = this.items.findIndex(item => item.workId === updatedTask.workId);
    if (index !== -1) {
      // 수정된 항목을 배열에서 업데이트
      this.items.splice(index, 1, updatedTask);
    }
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
</style>
