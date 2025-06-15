<template>
  <div class="project-layout">
    <!-- 상단 Breadcrumb -->
    <BreadCrumb :items="[
      { text: '프로젝트', to: '/' },
      { text: projectName, to: `/project/${projectId}` }
    ]" />

    <!-- 페이지 타이틀 -->
    <h1 class="page-title">📁 {{ projectName }}</h1>

    <!-- 탭 메뉴 -->
    <div class="tab-menu">
      <router-link
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.route"
        class="tab-button"
        :class="{ active: $route.name === tab.name }"
      >
        {{ tab.label }}
      </router-link>
    </div>

    <!-- 콘텐츠 영역 -->
    <div class="content-box" :class="{ 'pipeline-active': $route.name === 'ProjectPipeline' }">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/util/api.js'
import BreadCrumb from '@/components/common/BreadCrumb.vue'

const route = useRoute()
const projectId = route.params.id
const projectName = ref('로딩 중...')

const tabs = [
  { name: 'ProjectOverview', label: '프로젝트 개요', route: `/project/${projectId}/overview` },
  { name: 'ProjectPipeline', label: '파이프라인', route: `/project/${projectId}/pipeline` },
  { name: 'ProjectGantt', label: '간트 차트', route: `/project/${projectId}/gantt` },
  { name: 'ProjectDelayLog', label: '지연 로그', route: `/project/${projectId}/delay` },
  { name: 'ProjectSearch', label: '자료 검색', route: `/project/${projectId}/search` },
  { name: 'ProjectMembers', label: '참여자 목록', route: `/project/${projectId}/members` }
]

onMounted(async () => {
  try {
    const res = await api.get(`/api/projects/${projectId}`)
    projectName.value = res.data.data.name
  } catch (err) {
    projectName.value = '(불러오기 실패)'
    console.error('프로젝트 정보 가져오기 실패:', err)
  }
})
</script>

<style scoped>
.project-layout {
  padding: 40px 200px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.tab-menu {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 24px;
}

.tab-button {
  background: none;
  border: none;
  font-size: 15px;
  padding-bottom: 8px;
  cursor: pointer;
  color: #444;
  text-decoration: none;
}

.tab-button.active {
  font-weight: bold;
  color: #000;
  border-bottom: 2px solid #000;
}

.content-box {
  background-color: #ddd;
  min-height: 600px;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  width: 100%;
  margin: 0 auto;
}

.pipeline-active {
  max-width: none;
  width: 100%;
  padding: 0;
  background-color: transparent;
}
</style>
