import { ref } from 'vue';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export function useNotifications() {
  const notifications = ref([]);
  let stompClient = null;

  // WebSocket 연결 및 알림 처리
  const connectToWebSocket = (token) => {
    const socket = new SockJS('http://localhost:5000/ws'); // WebSocket 엔드포인트
    stompClient = Stomp.over(socket);

    stompClient.connect({ Authorization: `Bearer ${token}` }, function (frame) {
      console.log('WebSocket 연결 성공:', frame);

      stompClient.subscribe('/topic/notifications', function (notification) {
        const newNotification = JSON.parse(notification.body);
        notifications.value.push(newNotification);  // 알림 추가
      });
    });

    stompClient.onclose = function () {
      console.log('WebSocket 연결이 끊어졌습니다.');
    };
  };
  
  // 알림 조회 (SSE 방식처럼 데이터만 가져옴)
  const fetchNotifications = async (token) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('알림 데이터:', data);
      if (data && data.data) {
        notifications.value = data.data; // 알림 데이터를 상태에 저장
      } else {
        console.warn('알림 데이터가 비어있거나 잘못된 형식입니다.');
      }
    } catch (error) {
      console.error('알림 조회 오류:', error);
    }
  };

  // 알림을 서버로 보내는 함수 (필요시 사용)
  const sendNotification = (notification) => {
    if (stompClient) {
      stompClient.send('/app/sendNotification', {}, JSON.stringify(notification));
    }
  };

  

  return {
    notifications,
    connectToWebSocket,
    fetchNotifications,
    sendNotification,
  };
}
