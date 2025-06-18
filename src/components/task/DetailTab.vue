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
        <tr v-for="(item, index) in items" :key="index">
          <td>{{ item.taskName }}</td>
          <td>{{ item.deptName }}</td>
          <td>{{ item.endExpect }}</td>
          <td>{{ item.delayDays }}일</td>
          <td>{{ item.progressRate }}%</td>
          <td></td> <!-- 총 진척률 컬럼 값 없음 -->
        </tr>
      </tbody>
    </table>
    <div class="total-progress">
      <p class="right-align">총 진척률: {{ totalProgress }}%</p> <!-- 오른쪽 정렬 -->
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router"; // vue-router에서 useRoute 사용
import { useUserStore } from '@/stores/userStore'

export default {
  data() {
    return {
      items: [], // 데이터를 받을 빈 배열
    };
  },
  computed: {
    totalProgress() {
      const total = this.items.reduce((acc, item) => acc + item.progress, 0);
      return (total / this.items.length).toFixed(2);
    }
  },
  async mounted() {
    // useRoute()로 URL에서 params 값 가져오기
    const route = useRoute();
    const parentTaskId = route.params.id; // /task/:id 경로 파라미터에서 'id'를 가져옴
    
    // parentTaskId가 정상적으로 존재하는지 확인
    if (parentTaskId) {
            const userStore = useUserStore();
            const token = userStore.accessToken;

            if (!token) {
                console.error("토큰이 없습니다.");
                return;
            }


      try {
        const response = await fetch(`http://localhost5000/api/work/detailList?parentTaskId=${parentTaskId}`,{
                 method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Bearer 토큰을 Authorization 헤더에 추가
            'Content-Type': 'application/json',  // 필요한 경우 Content-Type 설정
          },
        });
        
        if (!response.ok) {
          throw new Error('네트워크 응답이 정상적이지 않습니다.');
        }
        const data = await response.json();
        this.items = data.data; // 백엔드에서 받은 데이터를 items 배열에 저장
      } catch (error) {
        console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
      }
    } else {
      console.error('parentTaskId가 없습니다.');
    }
  }
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
