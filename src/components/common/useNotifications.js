import { ref,watch } from 'vue'
import { useUserStore } from '@/stores/userStore'  // userStore 가져오기

export function useNotifications() {
  const notifications = ref([])  // 알림 상태
  const userStore = useUserStore()  // userStore 사용
  const lastNotificationId = ref(localStorage.getItem(`lastNotificationId_${userStore.id}`) || 0)  // 사용자별 고유한 lastNotificationId

  // 알림을 실시간으로 받아오는 SSE 연결 함수
  const connectToSSE = (token) => {
    if (!token) {
      console.error('토큰이 없습니다. 로그인 상태를 확인하세요.')
      return
    }

    // 로컬 스토리지에서 가장 최신의 lastNotificationId를 가져옴
    const lastStoredId = localStorage.getItem(`lastNotificationId_${userStore.id}`) || 0;

    console.log("백엔드에 보내는 알림id : " + lastStoredId);

    // 사용자별 고유한 lastNotificationId를 쿼리 파라미터로 전달
    const eventSource = new EventSource(`/api/notifications/stream?token=${token}&lastNotificationId=${lastStoredId}`);

    eventSource.addEventListener("open", () => {
      console.log("✅ SSE 연결 성공")
    })

    // 백엔드에서 .name("notification")으로 보냈기 때문에 이벤트 이름에 맞게 리스너 등록
    eventSource.addEventListener("notification", (event) => {
      try {
        const newNotifications = JSON.parse(event.data)

        newNotifications.forEach((notification) => {
          // 마지막으로 받은 알림 ID가 current lastNotificationId보다 크면, 새 알림으로 간주
          if (notification.id > lastStoredId) {
            notifications.value.unshift(notification); // 최신 알림이 앞에 추가되도록

            // 마지막으로 받은 알림 ID 업데이트
            lastNotificationId.value = notification.id;

            // 로컬 스토리지에 마지막 알림 ID 저장
            localStorage.setItem(`lastNotificationId_${userStore.id}`, lastNotificationId.value);
          }
        })
      } catch (e) {
        console.error("알림 파싱 오류", e)
      }
    })

    // 연결 상태 유지용 heartbeat 이벤트
    eventSource.addEventListener("heartbeat", () => {
      console.debug("💓 SSE heartbeat 수신")
    })

    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error)
      eventSource.close()

      // 일정 시간 후 재연결 시도
      setTimeout(() => {
        console.info('SSE 재연결 시도...')
        connectToSSE(token)
      }, 5000)  // 재연결 지연 시간 (5초)
    }
  }

    // localStorage에 저장된 lastNotificationId가 바뀔 때마다 connectToSSE 호출
  watch(() => localStorage.getItem(`lastNotificationId_${userStore.id}`), (newValue, oldValue) => {
    if (newValue !== oldValue) {
      console.log("lastNotificationId가 변경되었습니다. 새로 연결을 시도합니다.");
      connectToSSE(userStore.accessToken)
    }
  })

  return {
    notifications,
    connectToSSE
  }
}
