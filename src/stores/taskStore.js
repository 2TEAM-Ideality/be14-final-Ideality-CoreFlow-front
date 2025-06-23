// stores/taskStore.js
import { defineStore } from 'pinia';
import { useUserStore } from "@/stores/userStore";

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    items: [],  // 세부일정 목록
    totalProgress: 0, // 추가된 상태
  }),

  actions: {
            // 항목 상태 업데이트
    updateItemStatus(updatedItem) {
      const index = this.items.findIndex(item => item.workId === updatedItem.workId);
      if (index !== -1) {
        this.items[index] = updatedItem;
      }
    },

    // 시작 API 호출 (fetch 사용)
    async startTask(workId) {
      try {
        const userStore = useUserStore();  // userStore에서 토큰 가져오기
        const token = userStore.accessToken;  // Bearer Token

        const response = await fetch(`http://localhost:5000/api/detail/${workId}/start`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,  // Authorization 헤더에 Bearer Token 추가
            'Content-Type': 'application/json',  // JSON 데이터 전송
          },
        });

        if (response.ok) {
          const updatedItem = this.items.find(item => item.workId === workId);
          if (updatedItem) {
            updatedItem.status = 'PROGRESS'; // 상태를 '진행중'으로 변경
            this.updateItemStatus(updatedItem); // 상태 업데이트
          }
        } else {
          console.error('Failed to start task');
        }
      } catch (error) {
        console.error('Error starting task:', error);
      }
    },

    // 완료 API 호출 (fetch 사용)
    async completeTask(workId) {
      try {
        const userStore = useUserStore();  // userStore에서 토큰 가져오기
        const token = userStore.accessToken;  // Bearer Token

        const response = await fetch(`http://localhost:5000/api/detail/${workId}/complete`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,  // Authorization 헤더에 Bearer Token 추가
            'Content-Type': 'application/json',  // JSON 데이터 전송
          },
        });

        if (response.ok) {
          const updatedItem = this.items.find(item => item.workId === workId);
          if (updatedItem) {
            updatedItem.status = 'COMPLETED'; // 상태를 '완료'로 변경
            this.updateItemStatus(updatedItem); // 상태 업데이트
          }
        } else {
          console.error('Failed to complete task');
        }
      } catch (error) {
        console.error('Error completing task:', error);
      }
    },

    async fetchItems(parentTaskId, token) {
      try {
        const response = await fetch(`http://localhost:5000/api/work/detailList?parentTaskId=${parentTaskId}`, {
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
        this.items = data.data;  // 세부일정 목록

      } catch (error) {
        console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
      }
    },
    async fetchTotalProgress(taskId, token) {
      try {
        const response = await fetch(`http://localhost:5000/api/task/detail/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('태스크 상세 정보 조회 실패');
        }

        const data = await response.json();
        this.totalProgress = data.data.selectTask.progressRate; // progressRate를 totalProgress에 저장
      } catch (error) {
        console.error('총 진척률을 가져오는 중 오류가 발생했습니다:', error);
      }
    },

    removeItem(workId) {
      // workId에 해당하는 항목을 배열에서 제거
      this.items = this.items.filter(item => item.workId !== workId);
    },

     // createItem 메서드
    async createItem(form, taskId, token) {
  // 선행 일정과 후행 일정이 비어 있으면 null로 설정
  const precedingTasks = Array.isArray(form.precedingTasks) && form.precedingTasks.length > 0 
    ? form.precedingTasks 
    : null;
  const followingTasks = Array.isArray(form.followingTasks) && form.followingTasks.length > 0 
    ? form.followingTasks 
    : null;

  const requestData = {
    projectId: sessionStorage.getItem('projectId'), // 세션에서 프로젝트 ID
    parentTaskId: taskId, // 부모 작업 ID
    name: form.name, // 제목
    description: form.description, // 설명
    startBase: form.startBase, // 시작 베이스라인
    endBase: form.endBase, // 마감 베이스라인
    deptId: form.deptId, // 부서 ID
    source: form.source, // 선행 일정
    target: form.target, // 후행 일정
    assigneeId: form.assigneeId, // 책임자 ID
    participantIds: form.participantIds, // 참여자 IDs
  };


      try {
        const response = await fetch('http://localhost:5000/api/detail/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (response.ok) {
          const data = await response.json();
          // 성공적으로 제출된 데이터 추가
          this.items = [...this.items, data.data];  // 기존 items 배열을 새로 할당
           // 세부일정 목록을 다시 불러오는 함수 호출
      await this.fetchItems(taskId, token);
          return data; // 필요시 추가 처리
        } else {
          const errorData = await response.json();
          console.error('폼 제출 실패:', errorData.message);
          return null; // 실패시 null 반환
        }
      } catch (error) {
        console.error('폼 제출 중 오류 발생:', error);
        return null; // 오류 발생시 null 반환
      }
    },
  },
});
