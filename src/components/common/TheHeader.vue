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
      <img class="profile-img mr-3" ref="profileBox" :src="profileImage" @click="toggleDropdown('profile')" />
      <div v-if="showDropdown.profile" class="dropdown-menu" ref="profileRef" @click.stop>
        <div class="dropdown-item" @click="triggerFileInput">프로필 변경</div>
        <input type="file" accept="image/*" @change="handleFileChange" ref="fileInput" style="display:none"/>
        <div class="dropdown-item deleted" @click="deleteProfile">프로필 삭제</div>
      </div>

      <div class="user-info" ref="userBox" @click="toggleDropdown('user')">
        <div class="position">{{ userStore.deptName }} {{ userStore.jobRankName }}</div>
        <div class="name-role">
          <strong>{{ userStore.name }} 님</strong>
        </div>
      </div>

      <!-- 알림 사이드바 -->
      <NotificationSidebar 
        :notifications="notifications" 
        :isOpen="notificationSidebarOpen"
        @closeSidebar="closeSidebar" 
      />

      <!-- 드롭다운 메뉴 -->
      <div v-if="showDropdown.user" class="dropdown-menu" ref="dropdownRef" @click.stop>
        <div class="dropdown-item" @click="showChangePwdModal = true">비밀번호 변경</div>
        <!-- 관리자는 구성원 관리 표시 -->
        <routerLink to="/admin" v-if="isAdmin" class="dropdown-item">구성원 관리</routerLink>
        <div class="dropdown-item deleted" @click="logout">로그아웃</div>
      </div>
    </div>
    <ChangePwdModal v-if="showChangePwdModal" @close="showChangePwdModal = false" />
  </header>
</template>

<script setup>
  import { ref, onMounted,onBeforeUnmount } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  import { useRouter, RouterLink } from 'vue-router'
  import ChangePwdModal from '@/components/user/ChangePwdModal.vue'
  import api from '@/api'

  const showChangePwdModal = ref(false)
import NotificationSidebar from '@/components/common/NotificationSidebar.vue'
import { useNotifications } from '@/components/common/useNotifications.js'

const imageUrl = ref(null)
const fileInput = ref(null)

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file && file.type.statsWith('image/')) {
    alert('이미지 파일만 선택해주세요.')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    imageUrl.value = reader.result // base64 문자열
  }
  reader.readAsDataURL(file)
  confirm('프로필 사진을 등록하시겠습니까')
  try {
    const response = await api.patch('/api/user/update-profile',{
      profileImage: imageUrl.value
    })
    alert(response.data.message)
    userStore.profileImage = imageUrl.value
    console.log(userStore.profileImage)
    profileImage.value = imageUrl.value
  } catch(error) {
    if (error.message) {
      error(error.message)
    } else {
      error('알 수 없는 에러가 발생했습니다.')
    }
  }
}

const userStore = useUserStore()

const notificationSidebarOpen = ref(false) // 사이드바 상태 관리
const notifications = ref([]) // 알림 상태 관리
const { connectToSSE } = useNotifications()

const openNotificationSidebar = () => {
  notificationSidebarOpen.value = true
  fetchNotifications() // 사이드바가 열릴 때 알림 조회
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
    const response = await fetch('/api/notifications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('알림 데이터:', data); // API 응답 데이터 확인
    if (data && data.data) {
        notifications.value = data.data // 알림 데이터를 상태에 저장
      
      // 마지막 알림 ID 추출 (가장 최근의 알림 ID)
      const lastNotification = data.data[data.data.length - 1]
      if (lastNotification) {
        // `lastNotificationId_${userStore.id}`에 저장
        localStorage.setItem(`lastNotificationId_${userStore.id}`, lastNotification.id)
      }
    } else {
      console.warn('알림 데이터가 비어있거나 잘못된 형식입니다.');
    }
  } catch (error) {
    console.error('알림 조회 오류:', error)
  }
}


onMounted(() => {
  const token = userStore.accessToken
  if (token) {
    connectToSSE(token)  // 로그인 시 실시간 알림 연결
  }
  window.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
})

const profileBox = ref(null)
const userBox = ref(null)

function handleClickOutside(e) {
  const clickedEl = e.target
  if (!profileBox.value.contains(clickedEl) && !userBox.value.contains(clickedEl)) {
    showDropdown.value = { users: false, profile: false }
  }
}
const showDropdown = ref({
  user: false,
  profile: false
})

const profileImage = ref(userStore.profileImage)

const isAdmin = ref(userStore.roles.includes('ADMIN'))

const toggleDropdown = (type) => {
  showDropdown.value = {
    user: false,
    profile: false,
    [type]: !showDropdown.value[type]
  }
}

const logout = () => {
  userStore.logout()
  useRouter().push('/login')
}

async function deleteProfile() {
  confirm('프로필 사진을 삭제하시겠습니까?')
  try{
    const response = await api.patch('/api/user/update-profile', {
      profileImage: null
    })
    alert(response.data.message)
  } catch (error) {
    if (error.message) {
      error(error.message)
    } else {
      error('알 수 없는 에러가 발생했습니다.')
    }
  }
}
async function updateProfile() {

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
  z-index: 100;
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
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
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


