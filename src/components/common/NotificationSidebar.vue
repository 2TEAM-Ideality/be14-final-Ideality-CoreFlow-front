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
            <span v-if="notice.status === 'error'" class="error-icon">❗</span>
            {{ notice.message }}
          </div>
          <div class="date">{{ notice.date }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { inject, ref, onBeforeUnmount, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';

// `isOpen`은 알림 사이드바의 열림 상태를 관리합니다.
const isOpen = inject('notificationSidebarOpen');

// 알림 데이터를 저장할 배열
const notifications = ref([]);

// 알림 사이드바 닫기
const closeSidebar = () => {
  isOpen.value = false;
};

// SSE 연결을 통해 실시간 알림 받기
const connectToSSE = () => {
  const userStore = useUserStore();  // userStore를 사용하여 accessToken 가져오기
  const token = userStore.accessToken;  // accessToken 값을 가져옵니다.

  if (!token) {
    console.error('No access token available.');
    return;
  }

  const url = `http://localhost:5000/api/notifications/stream?token=${token}`;  // URL에 token 추가

  // EventSource로 SSE 연결
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const apiResponse = JSON.parse(event.data); // JSON 파싱

      // 알림 데이터 처리
      const notificationsData = apiResponse.data;  // 서버에서 받은 알림 배열

      // 각 알림 처리
      notificationsData.forEach(notification => {
        notifications.value.push(notification);  // 알림을 notifications 배열에 추가
      });
    } catch (parseError) {
      console.error('알림 데이터 파싱 오류:', parseError); // JSON 파싱 오류 처리
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류:', error);
    eventSource.close();  // 오류 발생 시 연결 종료
  };

  console.log('SSE 연결 시작됨');
};

// 로그인 상태가 바뀔 때마다 SSE 연결을 시도하도록 설정
watch(() => useUserStore().accessToken, (newToken) => {
  if (newToken) {
    connectToSSE(); // 로그인 상태일 때 자동으로 연결
  }
}, { immediate: true });
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
