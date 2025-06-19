<template>
  <div class="container">
    <div class="profile-header">
      <img
        class="profile-image"
        :src="userStore.profileImage || defaultImage"
        alt="프로필 이미지"
      />
      <div class="welcome-text">
        <h2>
          안녕하세요,
          {{ userStore.deptName || '' }}
          {{ userStore.jobRankName || '' }}
          {{ userStore.name || '' }}님 👋
        </h2>
      </div>
    </div>

    <!-- 프로젝트 이슈 -->
    <!-- 최근 진행한 프로젝트 -->
    <!-- 예정된 이벤트 -->
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import api from '@/api.js'
import defaultImage from '@/assets/profileDummy.png' // 기본 이미지 (없으면 public 경로 사용)

const userStore = useUserStore()
const route = useRoute()
</script>

<style scoped>
.container {
  padding: 5% 10%;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.welcome-text h2 {
  margin: 0;
}
</style>
