<template>
  <header class="header">
    <div class="logo">
      <router-link to="/">
        <img src="@/assets/black-logo.png" alt="Coreflow Logo" />
      </router-link>
    </div>

    <nav class="nav">
      <router-link to="/">프로젝트</router-link>
      <router-link to="/template">템플릿</router-link>
      <router-link to="/calendar">부서 일정</router-link>
      <router-link to="/approval">결재</router-link>
    </nav>

    <div class="user">
      <!-- 알림 버튼 -->
      <v-btn icon variant="plain" class="ring-btn" @click="openNotificationSidebar">
        <v-icon>mdi-bell-outline</v-icon>
      </v-btn>

      <!-- 프로필 + 이름 + 화살표 통합 -->
      <div class="profile-container" ref="userBox" @click="toggleDropdown('user')">
        <img class="profile-img" :src="profileImage" />
        <div class="user-info">
          <div class="position">{{ userStore.deptName }} {{ userStore.jobRankName }}</div>
          <div class="name-role"><strong>{{ userStore.name }} 님</strong></div>
        </div>
        <v-icon size="18" class="ml-1">mdi-menu-down</v-icon>
      </div>

      <!-- 통합 드롭다운 -->
      <div v-if="showDropdown.user" class="dropdown-menu" ref="dropdownRef" @click.stop>
        <div class="dropdown-item" @click="triggerFileInput">프로필 변경</div>
        <input type="file" accept="image/*" @change="handleFileChange" ref="fileInput" style="display:none" />
        <div class="dropdown-item deleted" @click="deleteProfile">프로필 삭제</div>
        <div class="dropdown-item" @click="showChangePwdModal = true">비밀번호 변경</div>
        <router-link to="/admin" v-if="isAdmin" class="dropdown-item">구성원 관리</router-link>
        <div class="dropdown-item deleted" @click="logout">로그아웃</div>
      </div>

      <!-- 알림 사이드바 -->
      <NotificationSidebar 
        :notifications="notifications" 
        :isOpen="notificationSidebarOpen"
        @closeSidebar="closeSidebar" 
      />

      <ChangePwdModal v-if="showChangePwdModal" @close="showChangePwdModal = false" />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import ChangePwdModal from '@/components/user/ChangePwdModal.vue'
import NotificationSidebar from '@/components/common/NotificationSidebar.vue'
import { useNotifications } from '@/components/common/useNotifications.js'
import api from '@/util/api.js'

const router = useRouter()
const userStore = useUserStore()
const { connectToSSE } = useNotifications()

const showChangePwdModal = ref(false)
const fileInput = ref(null)
const imageUrl = ref(null)
const profileImage = ref(userStore.profileImage)

const notificationSidebarOpen = ref(false)
const notifications = ref([])

const showDropdown = ref({ user: false })

const profileBox = ref(null)
const userBox = ref(null)

const isAdmin = ref(userStore.roles?.includes('ADMIN') ?? false)

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file || !file.type.startsWith('image/')) {
    alert('이미지 파일만 선택해주세요.')
    return
  }

  const reader = new FileReader()
  reader.onload = async () => {
    imageUrl.value = reader.result
    const isConfirmed = confirm('프로필 사진을 등록하시겠습니까?')
    if (!isConfirmed) return

    try {
      const response = await api.patch('/api/user/update-profile', {
        id: userStore.id,
        profileImage: imageUrl.value
      })
      alert(response.data.message)
      await userStore.updateUserInfo(userStore.id)
      profileImage.value = userStore.profileImage
    } catch (error) {
      alert(error.message || '알 수 없는 에러가 발생했습니다.')
    }
  }
  reader.readAsDataURL(file)
}

const openNotificationSidebar = () => {
  notificationSidebarOpen.value = true
  fetchNotifications()
}

const closeSidebar = () => {
  notificationSidebarOpen.value = false
}

const fetchNotifications = async () => {
  const token = userStore.accessToken
  if (!token) return

  try {
    const response = await fetch('/api/notifications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (data?.data) {
      notifications.value = data.data
      const last = data.data[data.data.length - 1]
      if (last) localStorage.setItem(`lastNotificationId_${userStore.id}`, last.id)
    }
  } catch (error) {
    console.error('알림 조회 오류:', error)
  }
}

const toggleDropdown = (type) => {
  showDropdown.value = {
    user: type === 'user' ? !showDropdown.value.user : false
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const deleteProfile = async () => {
  const isConfirmed = confirm('프로필 사진을 삭제하시겠습니까?')
  if (!isConfirmed) return
  try {
    const response = await api.delete(`/api/user/delete-profile/${userStore.id}`)
    alert(response.data.message)
    await userStore.updateUserInfo(userStore.id)
    profileImage.value = userStore.profileImage
  } catch (error) {
    alert(error.message || '알 수 없는 에러가 발생했습니다.')
  }
}

const handleClickOutside = (e) => {
  const clickedEl = e.target
  if (!userBox.value?.contains(clickedEl)) {
    showDropdown.value.user = false
  }
}

onMounted(() => {
  const token = userStore.accessToken
  if (token) connectToSSE(token)
  window.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  border-bottom: 1px solid #dbdbdb;
  background-color: #fff;
  z-index: 100;

  /* 💡 그림자 추가 */
  /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);  */
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
  align-items: center;
  gap: 12px;
  position: relative;
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
}

.profile-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgb(170, 170, 170);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.position {
  font-size: 12px;
  color: gray;
}

.name-role {
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
  width: 140px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 200;
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
  color: black;
}
</style>
