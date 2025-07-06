import { useNotificationStore } from '@/stores/notificationStore';
import { useUserStore } from '@/stores/userStore'
import { ref, watch } from 'vue';

export function useNotifications() {
  const store = useNotificationStore();  // Pinia store 사용
  const userStore = useUserStore()
  const token = userStore.accessToken;

  // 알림을 실시간으로 받아오는 SSE 연결 함수
  const connectToSSE = (token) => {
    if (!token) {
      console.error('토큰이 없습니다. 로그인 상태를 확인하세요.');
      return;
    }

    const lastStoredId = store.lastNotificationId; // Pinia에서 lastNotificationId 가져오기
    console.log("백엔드에 보내는 알림 id : " + lastStoredId);

    // 쿠키 기반 인증으로 바뀌었으므로, 쿼리에서 token 제거
    const eventSource = new EventSource(`/api/notifications/stream?&lastNotificationId=${lastStoredId}`);

    eventSource.addEventListener("open", () => {
      console.log("✅ SSE 연결 성공");
    });

    eventSource.addEventListener("notification", (event) => {
      try {
        const newNotifications = JSON.parse(event.data);

        newNotifications.forEach((notification) => {
          if (!notification.isAutoDelete && notification.id > lastStoredId) {
            store.addNotification(notification);  // Pinia store에 알림 추가

            store.setLastNotificationId(notification.id);  // 최신 ID로 갱신
          }
        });
      } catch (e) {
        console.error("알림 파싱 오류", e);
      }
    });

    eventSource.addEventListener("heartbeat", () => {
      console.debug("💓 SSE heartbeat 수신");
    });

    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
      eventSource.close();
      eventSource = null

      setTimeout(() => {
        console.info('SSE 재연결 시도...');
        connectToSSE(token);
      }, 5000);  // 재연결 지연 시간 (5초)
    };
  };

  // ✅ accessToken 이 바뀔 때마다 자동 연결
  watch(
    () => userStore.accessToken,
    (newToken, oldToken) => {
      if (newToken && newToken !== oldToken) {
        console.log('🔄 accessToken 변경 감지 → SSE 재연결')
        connectToSSE(newToken)
      }
    },
    { immediate: true } // 초기 로그인 시에도 바로 연결
  )

  return {
    connectToSSE,
  };
}
