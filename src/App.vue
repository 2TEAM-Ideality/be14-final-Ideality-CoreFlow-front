<script setup>
import { ref,provide } from 'vue';
import TheHeader from '@/components/common/TheHeader.vue';
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '@/components/common/BreadCrumb.vue'
import NotificationSidebar from '@/components/common/NotificationSidebar.vue'
import { useUserStore } from '@/stores/userStore'
import { watch, onMounted } from 'vue'
import { decodeJwt } from 'jose'

  const userStore = useUserStore()
  const router = useRouter()

  const route = useRoute()

  // 👇 강제 로그아웃 감시
  watch(() => userStore.forcedLogout, (val) => {
    if (val) {
      alert('세션이 만료되어 로그아웃되었습니다.')
      router.push('/login')
    }
  })

  // 앱 시작 시 세션 복원
  onMounted(async () => {
    try {
      await userStore.restoreFromStorage() // 사용자 확인
    } catch (e) {
      console.error('복원 중 오류: ', e)
    }

    // 토큰 감시 시작 (로그인 된 경우에만)
    startTokenWatcher()
  })

  // 로그인 여부 검사
  watch(() => userStore.isLoggedIn, (isLoggedIn) => {
    if (!isLoggedIn) {
      router.push('/login')
    }
    { immediate: true}
  })

  // 토큰 감시 함수
  function startTokenWatcher() {
    setInterval(async () => {
      const token = userStore.accessToken || sessionStorage.getItem('accessToken')
      if (!token) return

      try {
        const decoded = decodeJwt(token)
        const now = Math.floor(Date.now() / 1000)
        const remaining = decoded.exp - now

        if (remaining <= 60) {
          const success = await userStore.tryReissueToken()
          if (!success) {
            userStore.forceLogout()
            router.push('/login')
          }
        }
      } catch (e) {
        console.error('JWT 디코딩 실패: ', e)
        userStore.forceLogout()
        router.push('/login')
      }
    }, 30000)
  }

const notificationSidebarOpen = ref(false)
const openNotificationSidebar = () => notificationSidebarOpen.value = true
const closeNotificationSidebar = () => notificationSidebarOpen.value = false

provide('notificationSidebarOpen', notificationSidebarOpen)
provide('openNotificationSidebar', openNotificationSidebar)
provide('closeNotificationSidebar', closeNotificationSidebar)

</script>


<template>
  <VApp>
    <TheHeader v-if="route.path !== '/login'" />
    <NotificationSidebar />
    <VMain class="main-content">
      <RouterView />
    </VMain>
  </VApp>
</template>



<style>
* {
  font-family: 'Noto Sans KR', sans-serif;
}
</style>
