import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue')
  },
  {
    path: '/',
    name: 'Project',
    component: () => import('@/views/project/ProjectList.vue')
  },

  // 프로젝트
  // {
  //   path: '/project',
  //   name: 'Project',
  //   component: () => import('@/views/project/ProjectList.vue')
  // },
  {
    path: '/project/detail',
    component: () => import('@/views/project/ProjectDetail.vue'),
    children: [
      {
        path: 'overview',
        name: 'ProjectOverview',
        component: () => import('@/components/project/OverviewTab.vue')
      },
      {
        path: 'pipeline',
        name: 'ProjectPipeline',
        component: () => import('@/components/project/PipelineTab.vue')
      },
      {
        path: 'gantt',
        name: 'ProjectGantt',
        component: () => import('@/components/project/GanttTab.vue')
      },
      {
        path: 'delay',
        name: 'ProjectDelayLog',
        component: () => import('@/components/project/DelayLogTab.vue')
      },
      {
        path: 'search',
        name: 'ProjectSearch',
        component: () => import('@/components/project/ResourceSearchTab.vue')
      },
      {
        path: 'members',
        name: 'ProjectMembers',
        component: () => import('@/components/project/MemberListTab.vue')
      },
      {
        path: '',
        redirect: { name: 'ProjectOverview' }
      }
    ]
  },

  // 템플릿
  {
    path: '/template',
    name: 'Template',
    component: () => import('@/views/template/TemplateList.vue')
  },
  {
    path: '/template/detail',
    name: 'TemplateDetail',
    component: () => import('@/views/template/TemplateDetail.vue')
  },
  {
    path: '/template/edit',
    name: 'EditTemplate',
    component: () => import('@/views/template/EditTemplate.vue')
  },
  {
    path: '/template/edit/task',
    name: 'EditTemplateTask',
    component: () => import('@/views/template/EditTemplateTask.vue')
  },
  {
    path: '/template/create',
    name: 'CreateTemplate',
    component: () => import('@/views/template/CreateTemplate.vue')
  },
  
  // 부서 일정
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/calendar/Calendar.vue')
  },

  // 결재
  {
    path: '/approval',
    name: 'Approval',
    component: () => import('@/views/approval/Approval.vue')
  },

  // -----------------------------------------------테스트용
  // {
  //   path: '/test/pipe',
  //   name: 'Pipe',
  //   component: () => import('@/views/test/PipePage.vue')
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
