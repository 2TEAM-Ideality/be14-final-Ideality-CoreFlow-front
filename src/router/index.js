import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

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
    path: '/project/:id',
    component: () => import('@/views/project/ProjectDetail.vue'),
    props: true,
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
        component: () => import('@/components/project/AttachmentList.vue')
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
    path: '/template/detail/:id',
    name: 'TemplateDetail',
    component: () => import('@/views/template/TemplateDetail.vue')
  },
  {
    path: '/template/edit/:id',
    name: 'EditTemplate',
    component: () => import('@/views/template/EditTemplate.vue')
  },
  {
    path: '/template/edit/task/:id',
    name: 'EditTemplateTask',
    component: () => import('@/views/template/EditTemplateTask.vue')
  },
  {
    path: '/template/create',
    name: 'CreateTemplate',
    component: () => import('@/views/template/CreateTemplate.vue')
  },
  {
    path: '/template/create/task',
    name: 'CreateTemplateTask',
    component: () => import('@/views/template/CreateTemplateTask.vue')
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

  {
    path: '/admin',
    component: () => import('@/views/admin/Admin.vue'),
    children: [
      {
        path: 'user',
        name: 'ManagingUser',
        component: () => import('@/components/admin/ManagingUser.vue'),
        meta: {
          title: '사용자 관리',
          needUserList: true
        }
      },
      {
        path: 'org',
        name: 'ManagingOrg',
        component: () => import('@/components/admin/ManagingOrg.vue'),
        meta: {
          title: '조직 관리',
          needUserList: false
        }
      },
      {
        path: '',
        redirect: { name: 'ManagingUser' }
      }
    ]
  },
  // 태스크 관련
  {
    path: '/task/:taskId',
    name: 'TaskDetail',
    component: () => import('@/views/task/TaskDetail.vue')
  },

  // erp_master
  {
    path: '/master',
    name: 'MasterPage',
    component: () => import('@/views/master/ErpMaster.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const schema = localStorage.getItem('schemaName')

  if (to.path.startsWith('/admin')) {
    const hasAdminRole = userStore.roles.includes('ADMIN')
    if (!hasAdminRole) {
      alert('관리자만 접근할 수 있습니다.')
      return next('/')
    }
  }

  // master 전용 페이지 접근 제한
  if (to.path.startsWith('/master') && schema !== 'master') {
    alert('master 전용 페이지입니다.')
    return next('/')
  }

  if (schema === 'master' && !to.path.startsWith('/master')) {
    alert('master 계정은 이 페이지에 접근할 수 없습니다.')
    return next('/master')
  }

  next()
})

export default router