<template>
  <transition name="slide">
    <div v-if="isOpen" class="sidebar" ref="sidebarRef">
      <div class="sidebar-header">
        <div class="title">
          <img class="icon" src="@/assets/icons/ring.png" alt="알림 아이콘" />
          <span>알림</span>
        </div>
        <button class="close-btn" @click="closeSidebar">×</button>
      </div>

      <div class="notification-list">
        <div v-for="(notice, index) in notifications" :key="index" class="notification-item" :class="{ 'read': notice.status === 'READ', 'sent': notice.status === 'SENT' }"  @click="handleNotificationClick(notice)">
          <div class="message">
            <span  class="new-icon"></span> 
            {{ notice.content }}
          </div>
          <div class="date">{{ notice.date }} <!-- 삭제 버튼 추가 -->
          <button @click="deleteNotification(notice.id, true)" class="delete-btn">  삭제</button>
        </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps,defineEmits, ref, onMounted, onUnmounted  } from 'vue'
import { useRouter } from 'vue-router'; // vue-router 사용
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore';
import api from '@/api';

  const userStore = useUserStore()
  const notificationStore = useNotificationStore()
  const router = useRouter(); // router 사용
  const token = userStore.accessToken;

  const sidebarRef = ref(null)

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

const handleClickOutside = (e) => {
  if (sidebarRef.value && !sidebarRef.value.contains(e.target)) {
    closeSidebar()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// 알림 클릭 시 라우팅과 읽기 처리 함수
const handleNotificationClick = async (notice) => {
  // READ가 아니면 읽음 처리 시도
  if (notice.status !== 'READ') {
    try {
      await markNotificationAsRead(notice.id);
    } catch (e) {
      console.error("알림 읽음 처리 실패(무시하고 이동):", e);
    }
  }

  // 무조건 라우팅
  let targetUrl = '';

  switch (notice.targetType) {
    case 'WORK':
      targetUrl = `/task/${notice.targetId}`;
      break;
    case 'PROJECT':
      targetUrl = `/project/${notice.targetId}/overview`;
      break;
    case 'APPROVAL':
      targetUrl = `/approval/${notice.targetId}`;
      break;
    default:
      console.error('알 수 없는 targetType:', notice.targetType);
      return;
  }

  router.push(targetUrl);
}


// 알림을 읽음 처리 API 호출
const markNotificationAsRead = async (notificationId) => {
  if (!token) {
    console.error("토큰이 없습니다. 로그인 상태를 확인해주세요.");
    return { status: 'fail', message: '로그인 상태가 아닙니다.' };
  }

  try {
    const response = await api.patch(`/api/notifications/${notificationId}/read`);
    
    if (response.data.status === "success") {
      // store에서 notifications를 가져와서 상태 업데이트
      const updatedNotification = notificationStore.notifications.find(notice => notice.id === notificationId);
      if (updatedNotification) {
        updatedNotification.status = 'READ'; // 상태 업데이트
      }
      console.log("알림이 읽음 상태로 변경되었습니다.");
      return { status: 'success', message: '알림이 읽음 상태로 변경되었습니다.' };
    } else {
      console.error("알림 읽기 실패:", response.data.message || "알 수 없는 오류");
      return { status: 'fail', message: response.data.message };
    }
  } catch (error) {
    console.error('알림 읽기 오류:', error);
    return { status: 'error', message: '알림 읽기 처리 중 오류 발생' };
  }
}



// 알림 삭제 함수
const deleteNotification = async (notificationId, isAutoDelete) => {
  if (!token) {
    console.error("토큰이 없습니다. 로그인 상태를 확인해주세요.");
    return;
  }

  try {
    // API 요청: 알림의 isAutoDelete를 true로 설정
    const response = await api.patch(`/api/notifications/${notificationId}`, {
      isAutoDelete: isAutoDelete
    });

    // 응답의 status가 success인 경우 처리
    if (response.data.status === "success") {
      // isAutoDelete 상태가 true로 변경되면, 배열에서 해당 알림 삭제
      notificationStore.removeNotificationIfAutoDeleted(notificationId);
    } else {
      // 실패한 경우 응답 내용 출력
      console.error("알림 삭제 실패:", response.data.message || "알 수 없는 오류");
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
    cursor: pointer; /* 클릭 가능한 모양으로 변경 */
}

.notification-item .message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

/* SENT 상태일 경우 강조 색 */
.notification-item.sent {
  background-color: #feefef; /* 파란색 계열 강조 색 */
  font-weight: bold;
  border: 1px solid gray; /* 얇은 검정색 테두리 추가 */
}

/* READ 상태일 경우 기본 흰색 배경 */
.notification-item.read {
  background-color: white;
  color: #555;
  border: 1px solid gray; /* 얇은 검정색 테두리 추가 */
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
