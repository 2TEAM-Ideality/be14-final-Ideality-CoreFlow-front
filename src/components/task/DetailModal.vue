<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>세부일정 조회</h3>
        <button class="close-btn" @click="closeModal">X</button>
      </div>
      <div class="modal-body" v-if="taskDetails">
        <!-- 테이블 형식으로 정보 표시 -->
        <table class="info-table">
          <thead>
            <tr>
              <th colspan="2">항목</th>
              <th colspan="2">내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="2"><strong>세부일정명</strong></td>
              <td colspan="2" v-if="!localEditMode">{{ taskDetails.taskName }}</td>
              <td colspan="2" v-if="localEditMode"><input v-model="taskDetails.taskName" class="input-field" type="text" />
              </td>
            </tr>
            <tr>
              <td colspan="2"><strong>세부일정 내용</strong></td>
              <td colspan="2" v-if="!localEditMode">{{ taskDetails.taskDescription }}</td>
              <td colspan="2" v-if="localEditMode"><textarea v-model="taskDetails.taskDescription"
                  class="input-field"></textarea></td>
            </tr>
            <tr>
              <td colspan="2"><strong>담당 부서</strong></td>
              <td colspan="2" v-if="!localEditMode">{{ taskDetails.deptName }}</td>
              <td colspan="2" v-if="localEditMode">
                <!-- 부서 선택 드롭다운 -->
                <select v-model="taskDetails.deptId" @change="onDeptChange" class="input-field">
                  <option v-for="dept in departments" :key="dept.deptId" :value="dept.deptId">{{ dept.deptName }}
                  </option>
                </select>
              </td>
            </tr>

            <!-- 시작 베이스라인과 마감 베이스라인을 한 행에 표시 -->
            <tr>
              <td><strong>시작 베이스라인</strong></td>
              <td>{{ taskDetails.startBase }}</td>

              <td><strong>마감 베이스라인</strong></td>
              <td>{{ taskDetails.endBase }}</td>

            </tr>

            <!-- 예상 시작일과 예상 마감일을 한 행에 표시 -->
            <tr>
              <td><strong>예상 시작일</strong></td>
              <td>{{ taskDetails.startExpect }}</td>

              <td><strong>예상 마감일</strong></td>
              <td v-if="!localEditMode">{{ taskDetails.endExpect }}</td>
              <td v-if="localEditMode"><input v-model="taskDetails.endExpect" type="date" class="input-field" /></td>
            </tr>

            <!-- 시작 베이스라인과 마감 베이스라인을 한 행에 표시 -->
            <tr>
              <td><strong>실제 시작일</strong></td>
              <td>{{ taskDetails.startReal }}</td>

              <td><strong>실제 마감일</strong></td>
              <td>{{ taskDetails.endReal }}</td>

            </tr>

            <!-- 선행 일정 -->
            <tr>
              <td><strong>선행 일정</strong></td>
              <td v-if="taskDetails && taskDetails.prevWorkIds && taskDetails.prevWorkIds.length > 0">{{ taskDetails.prevWorkNames.join(', ') }}</td>
              <td v-else>없음</td>

              <!-- 후행 일정 -->
              <td><strong>후행 일정</strong></td>
              <td v-if="taskDetails && taskDetails.nextWorkIds && taskDetails.nextWorkIds.length > 0">{{ taskDetails.nextWorkNames.join(', ') }}</td>
              <td v-else>없음</td>
            </tr>

            <tr>
              <td colspan="2"><strong>진척률</strong></td>
              <td colspan="2" v-if="!localEditMode">{{ taskDetails.progressRate }}%</td>
              <td colspan="2" v-if="localEditMode"><input v-model="taskDetails.progressRate" type="number"
                  class="input-field" /></td>
            </tr>
            <tr>
              <td colspan="2"><strong>지연일</strong></td>
              <td colspan="2">{{ taskDetails.delayDays }}일</td>
            </tr>
            <tr v-if="taskDetails && taskDetails.assignees">
              <td colspan="2"><strong>책임자</strong></td>
              <td colspan="2" v-if="!localEditMode">{{taskDetails.assignees.map(a => a.name).join(', ')}}</td>
              <td colspan="2" v-if="localEditMode">
                <select v-model="taskDetails.assignees" class="input-field">
                  <option v-for="user in users" :key="user.id" :value="user.id" >{{ user.name }}</option>
                </select>
              </td>
            </tr>
            <tr v-if="taskDetails && Array.isArray(taskDetails.participants)">
              <td colspan="2"><strong>참여자</strong></td>
              <td colspan="2" v-if="!localEditMode">{{taskDetails.participants.map(p => p.name).join(', ')}}</td>
              <td colspan="2" v-if="localEditMode">
                <div v-for="user in users" :key="user.id" class="checkbox-container">
                  <input type="checkbox" :id="'participant-' + user.id" :value="user.id"
                    v-model="taskDetails.participants" />
                  <label :for="'participant-' + user.id">{{ user.name }}</label>
                </div>
              </td>

            </tr>
          </tbody>
        </table>

        <!-- 경고 메시지 표시 -->
<div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>


        <div class="modal-footer">
          <button class="edit-btn" @click="openEditModal" v-if="!isEditMode">수정</button>
          <button class="save-btn" @click="saveChanges" v-if="isEditMode">저장</button>
          <button class="delete-btn" @click="deleteTask">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/stores/userStore";
import { useTaskStore } from "@/stores/taskStore"; // Pinia store 임포트
import { useRoute } from "vue-router";
import api from "@/api";

export default {
  props: {
    workId: Number,
    isVisible: Boolean,
    isEditMode: Boolean,  // 수정 모드 상태 전달
  },
  data() {
    return {
      taskDetails: {},
      departments: [], // 부서 목록을 저장하는 변수
      users: [], // 사용자 목록을 저장하는 변수
      localEditMode: this.isEditMode, // `isEditMode` 상태를 local로 관리
      errorMessage: "",  // 오류 메시지를 저장하는 변수
    };
  },
  watch: {
    workId(newWorkId) {
      if (newWorkId) {
        this.fetchTaskDetails(newWorkId);
        this.fetchDepartments(); // 부서 목록을 가져옴
      }
    },
        // 부모 컴포넌트에서 전달된 `isEditMode` 값이 변경되면 반영
    isEditMode(newValue) {
      this.localEditMode = newValue;
    }
  },
methods: {
validateForm() {
  // 각 필드가 비어있는지 체크
  if (
    !this.taskDetails?.taskName ||  // taskDetails가 없으면 오류가 나지 않도록 처리
    !this.taskDetails?.taskDescription ||
    !this.taskDetails?.deptId ||
    !this.taskDetails?.endExpect ||
    !this.taskDetails?.progressRate ||
    !this.taskDetails?.assignees ||
    this.taskDetails.assignees.length === 0 ||
    !this.taskDetails?.participants ||
    this.taskDetails.participants.length === 0
  ) {
    this.errorMessage = "모든 필수 항목을 입력해주세요.";
    return false;  // 폼 제출을 막음
  }

  this.errorMessage = "";  // 오류 메시지 초기화
  return true;
}
,
    closeModal() {
      this.errorMessage = "";  // 오류 메시지 초기화
      this.$emit('close-modal'); // 부모 컴포넌트에 모달 닫기 이벤트 전달
    },
    openEditModal() {
      this.localEditMode = true; // 수정 모드로 전환
      this.$emit('open-edit-modal');
      
    },
    async fetchTaskDetails(workId) {
      const userStore = useUserStore();
      const token = userStore.accessToken;

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      try {
        const response = await api.get(`/api/work/detail`, {
          params: { workId }
        });
          if (response.status === 200) {
          this.taskDetails = response.data.data;

          // 수정 모드일 때, 부서 정보를 기본값으로 설정
          const selectedDept = this.departments.find(dept => dept.deptId === this.taskDetails.deptId);
          if (selectedDept) {
            this.taskDetails.deptName = selectedDept.deptName; // deptName을 부서 이름으로 설정
            this.fetchUsersByDept(selectedDept.deptName); // 부서 이름으로 사용자 목록 가져오기
          }

          // 수정 모드일 때, 참여자와 담당자 목록을 부서명으로 자동 설정
          if (this.localEditMode) {
            this.fetchUsersByDept(this.taskDetails.deptName); // 부서명으로 사용자 목록 자동 불러오기
          }
        } else {
          console.error("세부일정 조회 실패:", response.status);
        }
      } catch (error) {
        console.error('세부일정을 불러오는 중 오류가 발생했습니다:', error);
      }
    },
     async fetchDepartments() {
      const userStore = useUserStore();
      const token = userStore.accessToken;

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      try {
        const response = await api.get('/api/dept/all');

        if (response.status === 200) {
          this.departments = response.data.data; // 부서 데이터를 departments에 저장
        } else {
          console.error("부서 데이터를 가져오는 데 실패했습니다:", response.status);
        }
      } catch (error) {
        console.error("부서 데이터를 불러오는 데 실패했습니다:", error);
      }
    },
     async fetchUsersByDept(deptName) {
      const userStore = useUserStore();
      const token = userStore.accessToken;

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      try {
        console.log("Fetching users for dept:", deptName); // 부서명 확인
        const response = await api.get('/api/users/dept', {
          params: { deptName }
        });

        if (response.status === 200) {
          this.users = response.data.data; // 사용자 목록을 users에 저장
        } else {
          console.error("사용자 데이터를 가져오는 데 실패했습니다:", response.status);
        }
      } catch (error) {
        console.error("사용자 데이터를 불러오는 데 실패했습니다:", error);
      }
    },
    async onDeptChange() {
      const selectedDept = this.departments.find(dept => dept.deptId === this.taskDetails.deptId);
      if (selectedDept) {
        this.fetchUsersByDept(selectedDept.deptName); // 부서 이름을 바탕으로 사용자 목록을 가져옴

      }
    }
    ,
    async saveChanges() {
        if (!this.validateForm()) {
          console.log("validateForm 호출")
    return;
  }
      this.localEditMode = false; // 저장 후 수정모드 종료
      const userStore = useUserStore();
      const token = userStore.accessToken;
      const taskStore = useTaskStore();

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

  // Proxy 객체에서 `userId`가 있는 객체를 삭제
  const validParticipants = this.taskDetails.participants
    .filter(p => !p.hasOwnProperty('userId')) // `userId`가 존재하지 않는 객체만 필터링
    .map(p => {
      // 여기에 `userId`가 없는 객체만 남음
      return p; 
    });

  console.log("최종 유효한 참여자 목록:", validParticipants);

      const updatedData = {
        name: this.taskDetails.taskName,
        description: this.taskDetails.taskDescription,
        deptId: this.taskDetails.deptId,
        assigneeId: this.taskDetails.assignees,
        participantIds: validParticipants , // id 값만 추출
        expectEnd: this.taskDetails.endExpect,
        progress: this.taskDetails.progressRate,
      };

       try {
        const response = await api.put(`/api/detail/update/${this.workId}`, updatedData);
        
        if (response.status === 200) {
          console.log('세부일정 업데이트 성공:', response.data);
          await this.fetchTaskDetails(this.workId);
          const route = useRoute();
          const parentTaskId = route.params.taskId;
          await taskStore.fetchTotalProgress(parentTaskId, token); // 총 진척률 가져오기

          this.$emit('update-task', this.taskDetails);
          this.$emit('close-modal');
        } else {
          console.error('세부일정 업데이트 오류:', response.status);
        }
      } catch (error) {
        console.error('세부일정 업데이트 오류:', error);
      }
    },
    async deleteTask() {
      const userStore = useUserStore();
      const token = userStore.accessToken;

      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }

      try {
        const response = await api.patch(`/api/detail/${this.workId}/delete`);
       
        if (response.status === 200) {
          console.log('세부일정 삭제 성공:', response.data);

          // Store에서 삭제된 항목을 즉시 반영
          const taskStore = useTaskStore();
          taskStore.removeItem(this.workId); // 작업 삭제 후 store에서 해당 항목 제거

          this.$emit('close-modal');
        } else {
          console.error('세부일정 삭제 실패:', response.status);
        }
      } catch (error) {
        console.error('세부일정 삭제 오류:', error);
      }
    }
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
    display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px;
  max-height: 750px; 
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

.input-field {
  width: 100%;
  box-sizing: border-box;
}

.modal-body {
  margin-top: 20px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  table-layout: fixed;
  /* 테이블 너비 고정 */
}

.info-table th,
.info-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
  word-wrap: break-word;
}

.info-table th {
  background-color: #f2f2f2;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.edit-btn,
.save-btn,
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
.save-btn:hover,
.delete-btn:hover {
  opacity: 0.8;
}

.edit-btn:focus,
.save-btn:focus,
.delete-btn:focus {
  outline: none;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

</style>