<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>세부일정 조회</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </div>
      <div class="modal-body">
        <div class="flex-row">
          <p><strong>세부일정명:</strong> {{ taskDetails.taskName }}</p>
        </div>

                <!-- 세부일정 내용 추가 -->
        <div class="flex-row">
          <p><strong>세부일정 내용:</strong> {{ taskDetails.taskDescription }}</p>
        </div>

        <!-- 시작/마감 베이스라인 -->
        <div class="flex-row">
          <p><strong>시작 베이스라인:</strong> {{ taskDetails.startBaseline }}</p>
          <p><strong>마감 베이스라인:</strong> {{ taskDetails.endBaseline }}</p>
        </div>

        <!-- 예상 시작일/예상 마감일 -->
        <div class="flex-row">
          <p><strong>예상 시작일:</strong> {{ taskDetails.expectedStart }}</p>
          <p><strong>예상 마감일:</strong> {{ taskDetails.expectedEnd }}</p>
        </div>

        <!-- 선행 일정/후행 일정 -->
        <div class="flex-row">
          <p><strong>선행 일정:</strong> {{ taskDetails.precedingTask }}</p>
          <p><strong>후행 일정:</strong> {{ taskDetails.followingTask }}</p>
        </div>

        <p><strong>진척률:</strong> {{ taskDetails.progressRate }}%</p>
        <p><strong>책임자:</strong> {{ taskDetails.responsiblePerson }}</p>
        <p><strong>참여자:</strong> {{ taskDetails.participants }}</p>
        <p><strong>지연일:</strong> {{ taskDetails.delayDays }}일</p>

        <div class="modal-footer">
          <button class="edit-btn">수정</button>
          <button class="delete-btn">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    taskDetails: Object,
    isVisible: Boolean,
  },
  methods: {
    closeModal() {
      this.$emit('close-modal');
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
