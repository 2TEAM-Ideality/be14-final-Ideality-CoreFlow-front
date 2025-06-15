// stores/notificationStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const lastNotificationId = ref(0); // lastNotificationId 상태 관리
  const notifications = ref([]); // 알림 목록

  // 알림 ID 갱신 함수
  const setLastNotificationId = (id) => {
    lastNotificationId.value = id;
  };

  // 알림 추가 함수
  const addNotification = (notification) => {
    // 중복된 알림 ID를 확인하고 추가
    const exists = notifications.value.some(notice => notice.id === notification.id);
    if (!exists) {
      notifications.value.unshift(notification); 
    }
  };

    // 알림의 isAutoDelete가 true로 바뀌었을 때 배열에서 제거하는 함수
  const removeNotificationIfAutoDeleted = (id) => {
    const index = notifications.value.findIndex(notice => notice.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1); // isAutoDelete가 true인 알림을 배열에서 제거
    }
  };

  return {
    lastNotificationId,
    notifications,
    setLastNotificationId,
    addNotification,
    removeNotificationIfAutoDeleted
  };
});
