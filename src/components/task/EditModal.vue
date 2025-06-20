<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>세부일정 수정</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </div>

      <div class="modal-body" v-if="taskDetails">
        <div class="flex-row">
          <p><strong>세부일정명:</strong> 
            <input v-model="taskDetails.taskName" type="text" />
          </p>
        </div>

        <div class="flex-row">
          <p><strong>세부일정 내용:</strong>
            <input v-model="taskDetails.taskDescription" type="text" />
          </p>
        </div>

        <div class="modal-footer">
          <button class="save-btn" @click="saveChanges">수정 완료</button>
          <button class="cancel-btn" @click="closeModal">취소</button>
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
    isVisible: Boolean, // 모달의 표시 여부
  },
  data() {
    return {
      taskDetails: {}, // 수정할 세부일정의 데이터를 저장
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
      this.$emit('close-modal'); // 모달을 닫는 이벤트를 부모로 전달
    },
    async fetchTaskDetails(workId) {
      const userStore = useUserStore();
      const token = userStore.accessToken;

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/task/detail?workId=${workId}`, {
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
        this.taskDetails = data.data; // 수정할 세부일정의 데이터
      } catch (error) {
        console.error('세부일정을 불러오는 중 오류가 발생했습니다:', error);
      }
    },
    async saveChanges() {
      const userStore = useUserStore();
      const token = userStore.accessToken;

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/task/update?workId=${this.workId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.taskDetails), // 수정된 데이터 전송
        });

        if (!response.ok) {
          throw new Error('네트워크 응답이 정상적이지 않습니다.');
        }

        const data = await response.json();
        console.log('수정 성공:', data);
        
        // 수정이 완료되었으면 모달 닫기
        this.closeModal(); // 모달 닫기
        this.$emit('update-task', data.data); // 부모 컴포넌트로 수정된 데이터를 전달
      } catch (error) {
        console.error('수정 중 오류가 발생했습니다:', error);
      }
    },
  },
};
</script>

<style scoped>
/* 스타일 추가 */
</style>
