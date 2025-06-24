<!-- RecentProjectsCarousel.vue -->
<template>
  <div class="mt-2">
    <v-slide-group
      show-arrows
      class="recent-projects-carousel"
    >
      <v-slide-group-item
        v-for="(project, index) in props.projectList"
        :key="index"
      >
        <v-card
          class="mx-2 my-2 project-card pt-5"
          elevation="2"
          width="225"
          @click="goToProject(project.id)"
        >
        
          <v-card-title class="text-subtitle-2 font-weight-bold" style="height: 45%; color: #5E5E5E;">
            <!-- <v-chip
            :color="statusColor(project.status)"
            class="ma-1"
            text-color="white"
            small
            >
                {{ project.status }}
            </v-chip> -->
            {{ project.name }}
          </v-card-title>
          <v-card-text class="text-caption d-flex align-center" style="gap: 6px;">
            <img
              :src="project.director.profileImage || defaultProfile"
              alt="프로필 이미지"
              style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover;"
            />
            {{ project.director.deptName }} {{ project.director.jobRoleName }} {{ project.director.name }}
          </v-card-text>

          <v-divider></v-divider>
          <v-card-actions 
            :style="{
              backgroundColor: statusColor(project.status),
              fontSize: '12px',
              color: textColorByStatus(project.status)
            }"
          >
            <div class="project-status">
              {{ statusLabel(project.status) }}
            </div>
          </v-card-actions>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>

<script setup>
import defaultProfile from '@/assets/profileDummy.png'
import { useRouter } from 'vue-router'

const props = defineProps({
  projectList : {
    type: Array,
    required: true
  }
})

console.log("프로젝트 정보 확인", props.projectList)
const router = useRouter()


const statusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return 'rgba(249, 249, 249, 0.5)'   // #F9F9F9
    case 'PROGRESS':
      return 'rgba(216, 237, 255, 0.3)'   // #D8EDFF
    case 'COMPLETED':
      return 'rgba(227, 255, 234, 0.3)'   // #E3FFEA
    case 'DELAYED':
      return 'rgba(255, 243, 209, 0.3)'   // #FFF3D1
    case 'DELETED':
      return 'rgba(255, 243, 209, 0.3)'   // #FFF3D1 (같은 색)
    default:
      return 'rgba(249, 249, 249, 0.3)'   // #F9F9F9 (기본)
  }
}

const textColorByStatus = (status) => {
  switch (status) {
    case 'PENDING':
      return '#B9B9B9'
    case 'COMPLETED':
      return '#34C759'  // 진한 회색 (밝은 배경용)
    case 'PROGRESS':
      return '#307CFF'  // 어두운 파랑 (밝은 배경 대비)
    case 'DELAYED':
      return ''
    case 'DELETED':
      return '#FFA270'  // 어두운 갈색/주황 (밝은 노랑 대비)
    default:
      return '#333333'  // 기본 진한 회색
  }
}

const statusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return '대기 중'
    case 'PROGRESS':
      return '진행 중'
    case 'COMPLETED':
      return '완료'
    case 'DELAYED':
      return '지연'
    case 'DELETED':
      return '삭제'  
    default:
      return status
  }
}


// 예시 데이터
const recentProjects = [
  { id: 1, name: 'PJT.A 디자인 시스템', description: '공통 컴포넌트 개발 진행 중' },
  { id: 2, name: 'PJT.B 화장품 리뉴얼', description: '패키지 변경 및 등록 보고' },
  { id: 3, name: 'PJT.C ERP 통합', description: '운영팀 통합 일정 관리' },
  { id: 4, name: 'PJT.C ERP 통합', description: '운영팀 통합 일정 관리' },
  { id: 5, name: 'PJT.C ERP 통합', description: '운영팀 통합 일정 관리' },
  { id: 6, name: 'PJT.C ERP 통합', description: '운영팀 통합 일정 관리' },
  
]

function goToProject(id) {
  router.push(`/project/${id}`)
}
</script>

<style scoped>
.recent-projects-carousel {
  overflow-x: auto;
  white-space: nowrap;
  height: fit-content;
  padding: 3%;
  background-color: yellow;
}
.recent-projects-carousel {
  padding: 16px 0;
  overflow-x: auto;
  white-space: nowrap;
  background-color: #f9f9f9; /* 보기 편한 색으로 변경 */
}

.text-caption{
  color: #73726E;
}
.v-slide-group__content {
  display: flex;
  flex-wrap: nowrap;  /* 줄바꿈 방지 */
}

.project-card {
    border-radius: 10px;
    height: 150px;
}
.project-status {
  font-size: 12px;
}
.v-card-actions  {
  min-height : 25px;
  padding-left: 20px;
  padding-right: 20px;
  height: fit-content !important;
}
</style>