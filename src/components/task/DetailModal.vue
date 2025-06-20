<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>세부일정 조회</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </div>
            <!-- taskDetails가 존재할 때만 렌더링 -->
      <div class="modal-body" v-if="taskDetails">
        <div class="flex-row">
          <p><strong>세부일정명:</strong> {{ taskDetails.taskName }}</p>
        </div>

                <!-- 세부일정 내용 추가 -->
        <div class="flex-row">
          <p><strong>세부일정 내용:</strong> {{ taskDetails.taskDescription }}</p>
        </div>


        <!-- 세부일정 내용 추가 -->
        <div class="flex-row">
          <p><strong>부서명:</strong> {{ taskDetails.deptName }}</p>
        </div>

        <!-- 시작/마감 베이스라인 -->
        <div class="flex-row">
          <p><strong>시작 베이스라인:</strong> {{ taskDetails.startBase }}</p>
          <p><strong>마감 베이스라인:</strong> {{ taskDetails.endBase }}</p>
        </div>

        <!-- 예상 시작일/예상 마감일 -->
        <div class="flex-row">
          <p><strong>예상 시작일:</strong> {{ taskDetails.startExpect }}</p>
          <p><strong>예상 마감일:</strong> {{ taskDetails.endExpect }}</p>
        </div>

        <!-- 선행 일정/후행 일정 -->
        <div class="flex-row">
          <p><strong>선행 일정:</strong> {{ taskDetails.prevWorkNames.join(', ') }}</p>
          <p><strong>후행 일정:</strong> {{ taskDetails.nextWorkNames.join(', ') }}</p>
        </div>

        <!-- 진척률 -->
        <div class="flex-row">
          <p><strong>진척률:</strong> {{ taskDetails.progressRate }}%</p>
          <p><strong>지연일:</strong> {{ taskDetails.delayDays }}일</p>
        </div>

        <!-- 책임자 -->
        <div class="flex-row">
          <p><strong>책임자:</strong> 
            <span v-for="(assignee, index) in taskDetails.assignees" :key="index">{{ assignee.name }}<span v-if="index < taskDetails.assignees.length - 1">, </span></span>
          </p>
        </div>

        <!-- 참여자 -->
        <div class="flex-row">
          <p><strong>참여자:</strong>
            <span v-for="(participant, index) in taskDetails.participants" :key="index">{{ participant.name }}<span v-if="index < taskDetails.participants.length - 1">, </span></span>
          </p>
        </div>

        <div class="modal-footer">
          <button class="edit-btn" @click="openEditModal">수정</button>
          <button class="delete-btn">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { useUserStore } from "@/stores/userStore";

export default {
  props: {
    workId: Number, // workId를 받습니다.
    isVisible: Boolean,
  },
  data() {
    return {
      taskDetails: {}, // API 응답으로 받은 세부일정 데이터
    };
  },
  watch: {
    workId(newWorkId) {
      if (newWorkId) {
        this.fetchTaskDetails(newWorkId); // workId가 바뀌면 새로 데이터를 가져옵니다.
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit('close-modal');
    },
        openEditModal() {
      this.isEditModalVisible = true; // 수정 모달 표시
    },
    async fetchTaskDetails(workId) {
      const userStore = useUserStore();
      const token = userStore.accessToken;

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/work/detail?workId=${workId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('네트워크 응답이 정상적이지 않습니다.');
        }

        const data = await response.json();
        this.taskDetails = data.data; // API 응답 데이터 저장
      } catch (error) {
        console.error('세부일정을 불러오는 중 오류가 발생했습니다:', error);
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 24px;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  margin-top: 20px;
}

.modal-body p {
  font-size: 16px;
  line-height: 1.5;
  margin: 5px 0;
}

.flex-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.edit-btn,
.delete-btn {
  padding: 10px 20px;
  margin-left: 10px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: white;
  color: black;
}

.edit-btn:hover,
.delete-btn:hover {
  opacity: 0.8;
}

.edit-btn:focus,
.delete-btn:focus {
  outline: none;
}
</style>
