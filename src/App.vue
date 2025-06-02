<script setup>
import TheHeader from '@/components/common/TheHeader.vue';
import { useRoute } from 'vue-router'
import Breadcrumb from '@/components/common/BreadCrumb.vue'

const route = useRoute()

</script>

<template>
  <VApp>
    <TheHeader v-if="route.path !== '/login'" />

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
