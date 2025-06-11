import { ref } from 'vue'

export function useNotifications() {
  const notifications = ref([])  // 알림 상태

  // 알림을 실시간으로 받아오는 SSE 연결 함수
  const connectToSSE = (token) => {
    if (!token) {
      console.error('토큰이 없습니다. 로그인 상태를 확인하세요.')
      return
    }

    const eventSource = new EventSource(`/api/notifications/stream?token=${token}`)

    eventSource.onmessage = (event) => {
      const newNotifications = JSON.parse(event.data)
      newNotifications.forEach((notification) => {
        notifications.value.push(notification)
      })
    }

    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error)
      eventSource.close()
    }
  }

  return {
    notifications,
    connectToSSE
  }
}
