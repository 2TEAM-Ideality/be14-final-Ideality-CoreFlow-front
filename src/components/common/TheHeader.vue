<script setup>
import { inject } from 'vue'

const notificationSidebarOpen = inject('notificationSidebarOpen')

function openNotificationSidebar() {
  notificationSidebarOpen.value = true
}
</script>


<template>
  <header class="header">
    <div class="logo">
      <router-link to="/">
        <img src="@/assets/logo.png" alt="Coreflow Logo" />
      </router-link>
    </div>
    <nav class="nav">
      <router-link to="/">프로젝트</router-link>
      <router-link to="/template">템플릿</router-link>
      <router-link to="/calendar">부서 일정</router-link>
      <router-link to="/approval">결재</router-link>
    </nav>
    <div class="user">
      <button @click="openNotificationSidebar" class="ring-btn">
        <img src="@/assets/icons/ring.png" alt="알림" />
      </button>
      <span>홍길동 님</span>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 40px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
}

.logo img {
  height: 32px;
  object-fit: contain;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  text-decoration: none;
  color: #444;
}

.nav a.router-link-active {
  font-weight: bold;
  color: #2b6cb0;
}

.user {
  display: flex;
  align-items: center; /* 세로 정렬 맞춤 */
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.ring-btn {
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center; /* 버튼 내부 정렬 */
  cursor: pointer;
}

.ring-btn img {
  height: 20px; /* 아이콘 높이 조절 */
  width: 20px;  /* 필요하면 너비도 고정 */
  object-fit: contain;
}

</style>


