import { createRouter, createWebHistory } from 'vue-router'
import PipePage from '@/views/test/PipePage.vue'
import Home from '@/views/Home.vue'

const routes = [
//   {
//     path: '/login',
//     name: 'Login',
//     component: LoginPage
//   },
  {
    path: '/',
    name: 'Home',
    component : Home
  },
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

