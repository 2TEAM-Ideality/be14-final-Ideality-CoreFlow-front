import { createRouter, createWebHistory } from 'vue-router'
import PipePage from '@/views/test/PipePage.vue'

const routes = [
//   {
//     path: '/login',
//     name: 'Login',
//     component: LoginPage
//   },
  {
    path: '/test/pipe',
    name: 'Pipe',
    component : PipePage
  }

 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

