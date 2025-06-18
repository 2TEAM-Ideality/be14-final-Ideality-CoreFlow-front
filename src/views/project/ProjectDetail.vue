<template>
  <div class="project-layout">
    <!-- 상단 Breadcrumb -->
    <BreadCrumb :items="[
      { text: '프로젝트', to: '/' },
      { text: projectName, to: `/project/${projectId}` }
    ]" />

    <!-- 페이지 타이틀 -->
    <h1 class="page-title">
      📁 {{ projectName }}
      <ProjectStatusButton
        :status="projectStatus"
        :projectInfo="projectInfo"
        :allTaskList="allTaskList"
        :completedTaskList = "completedTaskList"
        @start="markAsInProgress"
        @complete="markAsCompleted"
        @delete="deleteProject"
        @report="downloadReport"
      />
    </h1>

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
import ProjectStatusButton from '@/components/project/ProjectStatusButton.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'
import api from '@/api.js'
import BreadCrumb from '@/components/common/BreadCrumb.vue'
const userStore = useUserStore()
const route = useRoute()


const projectId = route.params.id
const projectInfo = ref({});
const projectName = ref('로딩 중...')

const allTaskList = ref([])    // 전체 태스크 목록
const completedTaskList = ref([])   // 완료된 태스크 목록

const tabs = [
  { name: 'ProjectOverview', label: '프로젝트 개요', route: `/project/${projectId}/overview` },
  { name: 'ProjectPipeline', label: '파이프라인', route: `/project/${projectId}/pipeline` },
  { name: 'ProjectGantt', label: '간트 차트', route: `/project/${projectId}/gantt` },
  { name: 'ProjectDelayLog', label: '지연 로그', route: `/project/${projectId}/delay` },
  { name: 'ProjectSearch', label: '자료 검색', route: `/project/${projectId}/search` },
  { name: 'ProjectMembers', label: '참여자 목록', route: `/project/${projectId}/members` }
]

const projectStatus = ref('PENDING') // 실제 API 응답에서 받아올 값

onMounted(async () => {
  try {
    // 프로젝트 정보 가져오기 
    const res = await api.get(`/api/projects/${projectId}`)
    projectName.value = res.data.data.name
    projectInfo.value = res.data.data
    projectStatus.value = res.data.data.status
    console.log(projectInfo)

    // 프로젝트 전체 태스크 목록 가져오기 
    const taskRes = await api.get(`/api/task/${projectId}`)
    allTaskList.value = taskRes.data.data;
    console.log(allTaskList)

    // 완료된 태스크 목록 가져오기
    const completetdTaskRes = await api.get(`/api/task/completed/${projectId}`)
    completedTaskList.value = completetdTaskRes.data.data;
    console.log(completedTaskList)

  } catch (err) {
    projectName.value = '(불러오기 실패)'
    console.error('프로젝트 정보 가져오기 실패:', err)
  }
})

// 프로젝트 시작 처리
const markAsInProgress = async () => {
  try {
    await api.patch(`/api/projects/${projectId}/status/progress`)
    projectStatus.value = 'PROGRESS'
    alert('프로젝트가 성공적으로 시작 처리되었습니다!')
  } catch (err) {
    console.error('프로젝트 시작 처리 실패:', err)
    alert('시작 처리에 실패했습니다.')
  }
}

// 프로젝트 완료 처리
const markAsCompleted = async () => {
  try {
    await api.patch(`/api/projects/${projectId}/status/completed`)
    projectStatus.value = 'COMPLETED'
    alert('프로젝트가 성공적으로 완료 처리되었습니다!')
  } catch (err) {
    console.error('프로젝트 완료 처리 실패:', err)
    alert('완료 처리에 실패했습니다.')
  }
}

// 프로젝트 분석 리포트 다운로드 
const downloadReport = async () => {
  try {
    const response = await api.get(`/api/projects/report/${projectId}`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${userStore.accessToken}`  // 이거 꼭!
      }
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = '프로젝트_분석_리포트.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PDF 다운로드 실패:', err);
    alert('PDF 생성에 실패했습니다.');
  }
};

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
  gap: 5px;
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
  /* background-color: #ddd; */
  min-height: 600px;
  border-radius: 8px;
  /* padding: 20px; */
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
