<template>
    <div class="container">
        <h2>안녕하세요, {{ userStore.name }}님</h2> 

        <!-- 프로젝트 이슈 -->
        <!-- 최근 진행한 프로젝트 -->
        <!-- 예정된 이벤트 -->

    </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import api from '@/api.js'

const userStore = useUserStore()
const route = useRoute()


</script>

<style scoped>
.container {
    padding: 5% 10%;
}
</style>