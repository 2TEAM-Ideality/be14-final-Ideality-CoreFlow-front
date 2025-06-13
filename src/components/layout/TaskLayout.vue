<template>
    <div class="project-detail-layout">
  
      <!-- 페이지 타이틀 -->
      <h1 class="page-title">프로젝트 > 프로젝트 이름 > TASK 번호 : TASK 이름</h1>
  
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
      <div class="content-box">
        <router-view />
      </div>
    </div>
  </template>
  
  <script setup>
  const tabs = [
    { name: 'ProjectOverview', label: '프로젝트 개요', route: '/project/detail/overview' },
    { name: 'ProjectPipeline', label: '파이프라인', route: '/project/detail/pipeline' },
    { name: 'ProjectGantt', label: '간트 차트', route: '/project/detail/gantt' },
    { name: 'ProjectDelayLog', label: '지연 로그', route: '/project/detail/delay' },
    { name: 'ProjectSearch', label: '자료 검색', route: '/project/detail/search' },
    { name: 'ProjectMembers', label: '참여자 목록', route: '/project/detail/members' }
  ]
  </script>
  
  <style scoped>
  .project-detail-layout {
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
  }
  </style>
  