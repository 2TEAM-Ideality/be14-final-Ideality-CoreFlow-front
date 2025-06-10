<template> 
  <transition name="slide">
    <div v-if="isOpen" class="sidebar">
      <!-- 상단 헤더 -->
      <div class="sidebar-header">
        <div class="title">
          <img class="icon" src="@/assets/icons/ring.png" alt="알림 아이콘" />
          <span>알림</span>
        </div>
        <button class="close-btn" @click="closeSidebar">×</button>
      </div>

      <!-- 알림 리스트 -->
      <div class="notification-list">
        <div v-for="(notice, index) in notifications" :key="index" class="notification-item">
          <div class="message">
            <span v-if="notice.type === 'error'" class="error-icon">❗</span>
            {{ notice.message }}
          </div>
          <div class="date">{{ notice.date }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>
  
<script setup>
import { inject, ref, onBeforeUnmount } from 'vue';

// `isOpen`은 알림 사이드바의 열림 상태를 관리합니다.
const isOpen = inject('notificationSidebarOpen')

// 알림 데이터를 저장할 배열
const notifications = ref([
  {
    message: '24시간 전에 정민선님이 보낸 결재를 처리하지 않으셨습니다!',
    date: '2025.05.22 12:00',
    type: 'error',
  },
  {
    message: '봉제공정 TASK에서 권민수님이 언급하셨습니다.',
    date: '2025.05.22 12:00',
  },
  {
    message: 'Director 김용승님께서 PROJ1을 삭제하셨습니다.',
    date: '2025.05.22 12:00',
  },
  // ... 더 추가 가능
]);

// 알림 사이드바 닫기
const closeSidebar = () => {
  isOpen.value = false;
};

// SSE 연결을 통해 실시간 알림 받기
const connectToSSE = () => {
  const eventSource = new EventSource('/api/notifications/stream');

  // 새로 받은 알림을 notifications 배열에 추가
  eventSource.onmessage = (event) => {
    const newNotification = JSON.parse(event.data); // 서버에서 보내는 데이터는 JSON 형식일 경우
    notifications.value.push(newNotification); // 알림을 notifications 배열에 추가
  };

  // 오류 처리
  eventSource.onerror = (error) => {
    console.error('SSE 오류 발생:', error);
    eventSource.close(); // 오류 발생 시 연결 종료
  };

  // SSE 연결 완료 후 콘솔에 메시지 출력
  eventSource.onopen = () => {
    console.log('SSE 연결 완료되었습니다.');
  };

  // 컴포넌트가 언마운트될 때 연결 종료
  onBeforeUnmount(() => {
    eventSource.close();
  });
};

// 컴포넌트가 생성되면 SSE 연결 설정
connectToSSE();
</script>



<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  height: 100vh;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.sidebar-header .title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 16px;
}

.sidebar-header .close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.notification-item {
  background-color: #f8f0ed;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.notification-item .message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.notification-item .error-icon {
  color: red;
}

.notification-item .date {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title .icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

</style>