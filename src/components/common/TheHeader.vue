<template>
  <header class="header">
    <div class="logo">
      <router-link to="/">
        <img src="@/assets/black-logo.png" alt="Coreflow Logo" />
        <!-- <img src="/logo-favicon.png" alt="Coreflow Logo" /> -->
      </router-link>
    </div>

    <nav class="nav" v-if="isMaster">
      <router-link to="/project/list">프로젝트</router-link>
      <router-link to="/template">템플릿</router-link>
      <router-link to="/calendar">부서 일정</router-link>
      <router-link to="/approval">결재</router-link>
    </nav>

    <div class="user">
      <!-- 알림 버튼 -->
      <v-btn icon variant="plain" class="ring-btn" @click="openNotificationSidebar">
        <v-icon>mdi-bell-outline</v-icon>
                <!-- 알림 개수 표시 배지 -->
        <span v-if="unreadNotificationsCount > 0" class="notification-badge">{{ unreadNotificationsCount }}</span>
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

      <!-- 드롭다운 -->
      <div v-if="showDropdown.user" class="dropdown-menu" ref="dropdownRef" @click.stop>
        <div class="dropdown-item" @click="showMyProfile = true">내 프로필 조회</div>
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
      <MyProfile v-if="showMyProfile" @close="showMyProfile = false" />
      <ChangePwdModal v-if="showChangePwdModal" @close="showChangePwdModal = false" />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useNotifications } from '@/components/common/useNotifications.js'
import api from '@/api.js'

import NotificationSidebar from '@/components/common/NotificationSidebar.vue'
import ChangePwdModal from '@/components/user/ChangePwdModal.vue'
import MyProfile from '@/components/user/MyProfileModal.vue'

const router = useRouter()
const userStore = useUserStore()
const store = useNotificationStore()

const notificationSidebarOpen = ref(false)
const notifications = store.notifications

const { connectToSSE } = useNotifications()

const showMyProfile = ref(false)  // 유저 프로필 정보 모달
const showChangePwdModal = ref(false)
const fileInput = ref(null)
const imageUrl = ref(null)
const profileImage = ref(userStore.profileImage)

const showDropdown = ref({ user: false })

const userBox = ref(null)
const isAdmin = ref(userStore.roles?.includes('ADMIN') ?? false)

const isMaster = computed(() => {
  return localStorage.getItem("schemaName") !== 'master'
})

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

  const formData = new FormData();
  formData.append('id', userStore.id);
  formData.append('profileImage', file);

    try {
      const response = await api.patch('/api/user/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data.message)
      await userStore.updateUserInfo(userStore.id)
      profileImage.value = userStore.profileImage
    } catch (error) {
      alert(error.message || '알 수 없는 에러가 발생했습니다.')
    }
  }
  reader.readAsDataURL(file)
}

// 안 읽은 알림 개수 계산
const unreadNotificationsCount = computed(() => {
  return notifications.filter(notice => notice.status === 'SENT').length
})

const openNotificationSidebar = () => {
  notificationSidebarOpen.value = true
  fetchNotifications()
}

const closeSidebar = () => {
  notificationSidebarOpen.value = false
}

const fetchNotifications = async () => {
  const token = userStore.accessToken
  if (!token) {
    console.error('토큰이 존재하지 않습니다. 로그인 상태를 확인하세요.')
    return
  }

  try {
    const response = await api.get('/api/notifications');
    if (response.data && response.data.data) {
      response.data.data.filter(notice => !notice.isAutoDelete).forEach(notification => {
        store.addNotification(notification)
      })
      // 최신순으로 알림 목록 정렬
      store.notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const lastNotification = response.data.data[0]
      if (lastNotification) {
        store.setLastNotificationId(lastNotification.id)
      }
    } else {
      console.warn('알림 데이터가 비어있거나 잘못된 형식입니다.')
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
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 4px 24px;
  border-bottom: 1px solid #dbdbdb;
  background-color: #fff;
  z-index: 100;
  height: auto;
  gap: 12px;
}

.logo img {
  height: 32px;
  object-fit: contain;
}

.nav {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  flex-grow: 1;
  flex-shrink: 1;
}

.nav a {
  text-decoration: none;
  color: #444;
  font-size: 15px;
}

.nav a.router-link-active {
  font-weight: bold;
  color: #7578ee;
}

.user {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  min-width: 200px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  min-width: 0;
  flex-wrap: nowrap;
}

.profile-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgb(170, 170, 170);
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.position {
  font-size: 12px;
  color: gray;
}

.name-role {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-menu {
  position: absolute;
  top: 48px;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 6px 0;
  width: 160px;
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
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #7578ee;
  color: white;
}

.dropdown-item.deleted {
  color: red;
}

.dropdown-item.deleted:hover {
  color: white;
  background-color: red;
}

.ring-btn {
  background: none;
  border: none;
  padding: 0;
  color: black;
}

.notification-badge {
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 5px;
  font-size: 12px;
}
</style>
