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
    notifications.value.unshift(notification); // 최신 알림을 앞에 추가
  };

  return {
    lastNotificationId,
    notifications,
    setLastNotificationId,
    addNotification,
  };
});
