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
      <img class="profile-img mr-3" :src="profileImage" @click="toggleProfile" />
      
      <div v-if="showProfileOption" class="dropdown-menu" ref="profileRef" @click.stop>
        <div class="dropdown-item">프로필 변경</div>
        <div class="dropdown-item deleted">프로필 삭제</div>
      </div>

      <div class="user-info" @click="toggleDropdown">
        <div class="position">{{ userStore.deptName }} {{ userStore.jobRankName }}</div>
        <div class="name-role">
          <strong>{{ userStore.name }} 님</strong>
        </div>
      </div>

      <NotificationSidebar
        :notifications="notifications"
        :isOpen="notificationSidebarOpen"
        @closeSidebar="closeSidebar"
      />
    <!-- 드롭다운 메뉴 -->
      <div v-if="showDropdown" class="dropdown-menu" ref="dropdownRef" @click.stop>
        <div class="dropdown-item">비밀번호 변경</div>
        <div v-if="isAdmin" class="dropdown-item">구성원 관리</div>
        <div class="dropdown-item deleted" @click="logout">로그아웃</div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import NotificationSidebar from '@/components/common/NotificationSidebar.vue'
import { useNotifications } from '@/components/common/useNotifications.js'

const userStore = useUserStore()
const notificationSidebarOpen = ref(false)
const notifications = ref([])
const { connectToWebSocket,fetchNotifications } = useNotifications()

const openNotificationSidebar = () => {
  notificationSidebarOpen.value = true
}

const closeSidebar = () => {
  notificationSidebarOpen.value = false
}

const isAdmin = ref(userStore.roles.includes('ADMIN'))

onMounted(() => {
  const token = userStore.accessToken
  if (token) {
    connectToWebSocket(token) // WebSocket 연결
    fetchNotifications(token)
  }
})

const profileImage = ref(userStore.profileImage)
const showProfileOption = ref(false)
const showDropdown = ref(false)

const toggleProfile = () => {
  showProfileOption.value = !showProfileOption.value
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const logout = () => {
  userStore.logout()
  useRouter().push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 40px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  height: 50px;
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
  align-items: center;
  position: relative;
}
.profile-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid black;
}
.position {
  font-size: 12px;
  color: gray;
}
.name-role {
  display: flex;
  align-items: center;
  font-size: 14px;
}
.dropdown-menu {
  position: absolute;
  top: 55px;
  right: 0;
  background: white;
  border: 1px solid black;
  border-radius: 6px;
  padding: 6px 0;
  width: 120px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
}
.dropdown-item {
  padding: 8px 16px;
  font-size: 14px;
  color: black;
  text-decoration: none;
}
.dropdown-item:hover {
  background-color: #9090ff;
  color: white;
}
.dropdown-item.deleted {
  color: red;
}

.dropdown-item.deleted:hover {
  color: white;
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


