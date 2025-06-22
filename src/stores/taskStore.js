// stores/taskStore.js
import { defineStore } from 'pinia';

export const useTaskStore = defineStore('taskStore', {
  state: () => ({
    items: [],  // 세부일정 목록
  }),

  actions: {
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

     // createItem 메서드
    async createItem(form, taskId, token) {
      const requestData = {
        projectId: sessionStorage.getItem('projectId'), // 세션에서 프로젝트 ID
        parentTaskId: taskId, // 부모 작업 ID
        name: form.title, // 제목
        description: form.description, // 설명
        startBase: form.startDate, // 시작 베이스라인
        endBase: form.endDate, // 마감 베이스라인
        deptId: form.department, // 부서 ID
        source: null, // 필요시 추가
        target: null, // 필요시 추가
        assigneeId: form.responsible, // 책임자 ID
        participantIds: form.participants, // 참여자 IDs
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
