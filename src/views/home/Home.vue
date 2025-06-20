<template>
  <div class="container">
    <div class="profile-header">
      <div class="welcome-text">
        <h1 style="color: #2D2D2D; text-align: center;">
          안녕하세요, {{ userStore.name || '' }}님 👋
        </h1>
        <div class="current-time">
          현재 시각: {{ currentTime }}
        </div>
      </div>
    </div>
   

    <v-divider class="border-opacity-100" style="border-color: white;"></v-divider>

    <div class="home-content">
      
      <!-- 오늘의 일정 개수 표시 -->
      <div class="content-item">
        <!-- 프로젝트 이슈 (일정 포함) -->
        <RecentIssue 
          :deptInfo ="userStore.deptName"
          :todayDeptList="todayDeptList"
          :todayCount="todayCount"
        />
      </div>

      <!-- 최근 진행한 프로젝트- 캐러셀 -->
      <div class="content-item" >
        <div class="d-flex align-center"   >
          <v-icon @click="goToProject" class="me-2" color="#73726E">mdi-view-list</v-icon>
          <span class="text-subtitle-1 font-weight-medium" style="color: #73726E;">
            최근 진행한 프로젝트
          </span>
        </div>
        <RecentProjectList  :projectList = "myProject"/>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { onMounted,onBeforeUnmount ,  ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import api from '@/api.js'
import RecentProjectList from '@/components/home/RecentProjectList.vue'
import RecentIssue from '@/components/home/RecentIssue.vue'
import {useRouter} from 'vue-router'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import updateLocale from 'dayjs/plugin/updateLocale'
import 'dayjs/locale/ko'

dayjs.extend(weekday)
dayjs.extend(updateLocale)
dayjs.locale('ko')

const currentTime = ref(dayjs().format('M월 D일 (dd) HH:mm'))

let timer = null
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = dayjs().format('M월 D일 (dd) HH:mm')
  }, 60000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const todayDeptList = ref([])
const todaySchedule = ref([])
const filteredTodaySchedule = ref([])
const myProject = ref([])

const todayStr = new Date().toISOString().split('T')[0]

// 📌 오늘 포함된 개인 일정만 필터링
const todayCount = computed(() => filteredTodaySchedule.value.length)

watch(todaySchedule, () => {
  filteredTodaySchedule.value = todaySchedule.value.filter(event => {
    return event.start <= todayStr && todayStr <= event.end
  })
})


// ✅ 참여중인 프로젝트 목록 조회 
const fetchMyProject = async () => {
  try {
    const res = await api.get(`/api/projects/list`, {
      params : { userId : userStore.id }
    })
    myProject.value = res.data.data
    console.log("✅ 최근 참여 프로젝트 목록 조회 확인", myProject.value)
  }catch(err){
    console.error('❌ 프로젝트 조회 실패:', err)
  }
}


// ✅ 부서 일정 불러오기
const fetchDeptToday = async () => {
  try {
    const res = await api.get('/api/task/dept/today', {
      params: { userId: userStore.id }
    })
    todayDeptList.value = res.data.data
    console.log("✅ 오늘의 부서 일정 확인", todayDeptList.value)
  } catch (err) {
    console.error('❌ 부서 일정 조회 실패:', err)
  }
}

// ✅ 개인 일정 불러오기
const fetchScheduleToday = async (year, month) => {
  try {
    const res = await api.get('/api/calendar/personal/month', {
      params: {
        userId: userStore.id,
        year,
        month
      }
    })

    todaySchedule.value = (res.data.data || []).map(item => {
      const format = (date) => new Date(date).toISOString().split('T')[0]
      return {
        title: item.name,
        content: item.content,
        start: format(item.startAt),
        end: format(item.endAt),
        class: 'event-personal',
        attributes: {
          title: `${item.name}\n${item.content}`
        }
      }
    })

    console.log('📆 전체 개인 일정 목록:', todaySchedule.value)
  } catch (err) {
    console.error('❌ 개인 일정 조회 실패:', err)
  }
}

onMounted(() => {
  const today = new Date()
  fetchDeptToday()
  fetchScheduleToday(today.getFullYear(), today.getMonth() + 1)
  fetchMyProject()  
})

const goToProject = () => {
  router.push(`project/list`)
}


</script>


<style scoped>
.container {
  height: 100vh;
  background-color: #FFFFFF;
  padding: 5% 15% 0 15%;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  /* margin-bottom: 3%; */
}

.profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.welcome-text {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 5%;
}

.dept-info {
  font-size: 15px;
  color: rgb(149, 149, 149);
}

.home-content {
  display: flex;
  flex-direction: column;
  gap: 50px;
}

.current-time {
  color: #888;
  font-size: 14px;
  text-align: center;
}

</style>
