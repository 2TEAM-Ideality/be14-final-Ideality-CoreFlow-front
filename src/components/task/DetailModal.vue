<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>세부일정 조회</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </div>
      <div class="modal-body" v-if="taskDetails && taskDetails.taskName">
        <!-- 조회 모드 -->
        <div v-if="!isEditMode">
          <div class="flex-row">
            <p><strong>세부일정명:</strong> {{ taskDetails.taskName }}</p>
          </div>

          <div class="flex-row">
            <p><strong>세부일정 내용:</strong> {{ taskDetails.taskDescription }}</p>
          </div>

          <div class="flex-row">
            <p><strong>부서명:</strong> {{ taskDetails.deptName }}</p>
          </div>

          <div class="flex-row">
            <p><strong>시작 베이스라인:</strong> {{ taskDetails.startBase }}</p>
            <p><strong>마감 베이스라인:</strong> {{ taskDetails.endBase }}</p>
          </div>

          <div class="flex-row">
            <p><strong>예상 시작일:</strong> {{ taskDetails.startExpect }}</p>
            <p><strong>예상 마감일:</strong> {{ taskDetails.endExpect }}</p>
          </div>

          <div class="flex-row">
            <p><strong>선행 일정:</strong> {{ taskDetails.prevWorkNames.join(', ') }}</p>
            <p><strong>후행 일정:</strong> {{ taskDetails.nextWorkNames.join(', ') }}</p>
          </div>

          <div class="flex-row">
            <p><strong>진척률:</strong> {{ taskDetails.progressRate }}%</p>
            <p><strong>지연일:</strong> {{ taskDetails.delayDays }}일</p>
          </div>

          <div class="flex-row">
            <p><strong>책임자:</strong> 
              <span v-for="(assignee, index) in taskDetails.assignees" :key="index">{{ assignee.name }}<span v-if="index < taskDetails.assignees.length - 1">, </span></span>
            </p>
          </div>

          <div class="flex-row">
            <p><strong>참여자:</strong>
              <span v-for="(participant, index) in taskDetails.participants" :key="index">{{ participant.name }}<span v-if="index < taskDetails.participants.length - 1">, </span></span>
            </p>
          </div>
        </div>

        <!-- 수정 모드 -->
        <div v-if="isEditMode">
          <div class="flex-row">
            <label><strong>세부일정명:</strong></label>
            <input v-model="taskDetails.taskName" type="text" />
          </div>

          <div class="flex-row">
            <label><strong>세부일정 내용:</strong></label>
            <textarea v-model="taskDetails.taskDescription"></textarea>
          </div>

          <div class="flex-row">
            <label><strong>부서명:</strong></label>
            <input v-model="taskDetails.deptName" type="text" />
          </div>

<!-- 책임자 -->
<div class="flex-row">
  <label><strong>책임자:</strong></label>
  <!-- 책임자들 이름을 콤마로 구분하여 입력 (v-model 사용) -->
  <input v-model="taskDetails.assignees" type="text" />
</div>

<!-- 참여자 -->
<div class="flex-row">
  <label><strong>참여자:</strong></label>
  <!-- 참여자들 이름을 콤마로 구분하여 입력 (v-model 사용) -->
  <input v-model="taskDetails.participants" type="text" />
</div>


          <div class="flex-row">
            <label><strong>예상마감일:</strong></label>
            <input v-model="taskDetails.endExpect" type="date" />
          </div>

          <div class="flex-row">
            <label><strong>진척률:</strong></label>
            <input v-model="taskDetails.progressRate" type="number" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="edit-btn" @click="openEditModal" v-if="!isEditMode">수정</button>
          <button class="save-btn" @click="saveChanges" v-if="isEditMode">저장</button>
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
    workId: Number,
    isVisible: Boolean,
    isEditMode: Boolean,  // 수정 모드 상태 전달
  },
  data() {
    return {
      taskDetails: {},
    };
  },
  watch: {
    workId(newWorkId) {
      if (newWorkId) {
        this.fetchTaskDetails(newWorkId);
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit('close-modal'); // 부모 컴포넌트에 모달 닫기 이벤트 전달
    },
    openEditModal() {
      this.$emit('open-edit-modal'); // 부모 컴포넌트에 수정 모드 전환 이벤트 전달
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
        this.taskDetails = data.data;
      } catch (error) {
        console.error('세부일정을 불러오는 중 오류가 발생했습니다:', error);
      }
    },
saveChanges() {
      const userStore = useUserStore();
      const token = userStore.accessToken;

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      // 데이터 준비
      const updatedData = {
        name: this.taskDetails.taskName,
        description: this.taskDetails.taskDescription,
        deptId: this.taskDetails.deptId, // 필요에 따라 deptId와 기타 데이터를 바인딩합니다.
        assigneeId: this.taskDetails.assignees, // 책임자 ID 배열로 변환
        participantIds: Array.isArray(this.taskDetails.participants) ? this.taskDetails.participants.map(p => p.id) : [], // 참여자 ID 배열로 변환
        expectEnd: this.taskDetails.endExpect,
        progress: this.taskDetails.progressRate,
      };

      // PUT 요청 보내기
      fetch(`http://localhost:5000/api/detail/update/${this.workId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })
        .then(response => response.json())
        .then(async (data) => {
          console.log('세부일정 업데이트 성공:', data);
                // 세부일정 업데이트 후 최신 데이터 가져오기
      await this.fetchTaskDetails(this.workId);

      // 부모 컴포넌트에 수정된 데이터를 전달
      this.$emit('update-task', this.taskDetails); // 부모 컴포넌트에 수정된 데이터 전달
          
          this.$emit('close-modal'); // 모달 닫기
        })
        .catch(error => {
          console.error('세부일정 업데이트 오류:', error);
        });
    },
    
// 참여자 이름을 구분하여 문자열로 반환하는 메서드
getParticipantsNames(participants) {
  return participants.map(participant => participant.name).join(', ');
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
