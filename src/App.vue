<script setup>
import { ref,provide } from 'vue';
import TheHeader from '@/components/common/TheHeader.vue';
import { useRoute } from 'vue-router'
import Breadcrumb from '@/components/common/BreadCrumb.vue'
import NotificationSidebar from '@/components/common/NotificationSidebar.vue'

const route = useRoute()

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
