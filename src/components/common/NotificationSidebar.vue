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
            <span v-if="notice.status === 'SENT'" class="new-icon">⚡</span> 
            {{ notice.content }}
          </div>
          <div class="date">{{ notice.date }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps,defineEmits } from 'vue'

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
