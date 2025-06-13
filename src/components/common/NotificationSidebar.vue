<template>
  <transition name="slide">
    <div v-if="isOpen" class="sidebar">
      <div class="sidebar-header">
        <div class="title">
          <img class="icon" src="@/assets/icons/ring.png" alt="알림 아이콘" />
          <span>알림</span>
        </div>
        <button class="close-btn" @click="closeSidebar">×</button>
      </div>

      <div class="notification-list">
        <div v-for="(notice, index) in notifications" :key="index" class="notification-item">
          <div class="message">
            <span v-if="notice.status === 'SENT'" class="new-icon"></span> 
            {{ notice.content }}
          </div>
          <div class="date">{{ notice.date }} <!-- 삭제 버튼 추가 -->
          <button @click="deleteNotification(notice.id)" class="delete-btn">  삭제</button>
        </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps,defineEmits,watch } from 'vue'
import { useUserStore } from '@/stores/userStore'

  const userStore = useUserStore()
  const token = userStore.accessToken;

const props = defineProps({
  notifications: {
    type: Array,
    required: true,
    default: () => [] // 기본값 빈 배열로 설정
  },
  isOpen: {
    type: Boolean,
    required: true,
    default: false // 기본값 false로 설정
  }
})

const emit = defineEmits(['closeSidebar'])

const closeSidebar = () => {
  emit('closeSidebar')  // 부모 컴포넌트에 closeSidebar 이벤트를 전달
}

// 알림 삭제 함수
const deleteNotification = async (notificationId) => {
  if (!token) {
    console.error("토큰이 없습니다. 로그인 상태를 확인해주세요.");
    return;
  }

  try {
    // API 요청: 알림의 isAutoDelete를 true로 설정
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 헤더에 토큰 추가
      },
      body: JSON.stringify({
        isAutoDelete: true
      })
    });

    // 서버에서 반환된 데이터를 파싱
    const data = await response.json();

    // 응답의 status가 success인 경우 처리
    if (data.status === "success") {
      // UI에서 해당 알림 삭제
      const index = props.notifications.findIndex(notice => notice.id === notificationId);
      if (index !== -1) {
        props.notifications.splice(index, 1);
      }
    } else {
      // 실패한 경우 응답 내용 출력
      console.error("알림 삭제 실패:", data.message || "알 수 없는 오류");
    }
  } catch (error) {
    console.error('알림 삭제 오류:', error);
  }
}

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

/* SENT 상태일 경우 강조 색 */
.notification-item.sent {
  background-color: #e0f7fa; /* 파란색 계열 강조 색 */
  font-weight: bold;
}

/* READ 상태일 경우 기본 흰색 배경 */
.notification-item.read {
  background-color: white;
  color: #555;
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
