<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import CalendarLayout from '@/components/layout/CalendarLayout.vue'
import VueCal from 'vue-cal'
import { useUserStore } from '@/stores/userStore'
import 'vue-cal/dist/vuecal.css'
import api from '@/api'

const userStore = useUserStore()

const vueCalRef = ref(null)
const selectedEvent = ref(null)
const showEventModal = ref(false)
const scheduleList = ref([]) // 개인 일정 리스트
const showCalendar = ref(false)

const currentViewDate = ref({})

const showPersonal = ref(true)
const showDepartment = ref(true)

// ✅ 일정 불러오기
async function fetchMonthlySchedule(year, month) {
  try {
    const res = await api.get('/api/calendar/personal/month', {
      params: {
        userId: userStore.id,
        year,
        month
      }
    })

    console.log('📅 일정 응답:', res.data)

    scheduleList.value = (res.data.data || []).map(item => {
    const start = new Date(item.startAt)
    const end = new Date(item.endAt)

    const format = (date) => date.toISOString().split('T')[0]  // YYYY-MM-DD

    return {
      title: item.name,
      content: item.content,
      start: format(start),
      end: format(end),
      class: 'event-green',
      attributes: {
        title: `${item.name}\n${item.content}`
      }
    }
  })
  console.log('📆 최종 이벤트 목록:', scheduleList.value)
  } catch (err) {
    console.error('❌ 일정 조회 실패:', err)
  }
}

const mergedEvents = computed(() => {
  const events = []
  if (showPersonal.value) events.push(...scheduleList.value)
  if (showDepartment.value) events.push(...departmentScheduleList.value)
  return events
})

// 오늘 날짜로 이동하기
const goToToday = () => {
  const today = new Date()
  if (vueCalRef.value) {
    vueCalRef.value.switchView('month', today)
    
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    currentViewDate.value = { year, month }

    fetchMonthlySchedule(year, month)
  }
}


// ✅ 뷰 변경 시 월별 일정 다시 요청
const onViewChange = ({ startDate }) => {
  const date = new Date(startDate) // startDate는 Date 객체 또는 ISO 문자열
  if (!isNaN(date)) {
    const currentYear = date.getFullYear()
    const currentMonth = date.getMonth() + 1 // JS는 0부터 시작

    console.log(`현재 보고 있는 달: ${currentYear}년 ${currentMonth}월`)
    currentViewDate.value = {
      year: currentYear,
      month: currentMonth
    }
    fetchMonthlySchedule(currentYear, currentMonth)
  } else {
    console.warn('Invalid startDate:', startDate)
  }
}

// ✅ 초기 mount 시 현재 보이는 달로 요청
onMounted(async () => {
  await nextTick()
  showCalendar.value = true
  await nextTick()
  if (vueCalRef.value) {
    vueCalRef.value.switchView('month')
    console.log(vueCalRef.value)
    const initialDate = new Date(vueCalRef.value.viewStartDate)
    fetchMonthlySchedule(initialDate.getFullYear(), initialDate.getMonth() + 1)
  }
})

// ✅ 이벤트 클릭 처리
const onCellClick = ({ date, events }) => {
  console.log('📌 날짜 클릭:', date, events)
}

const onEventClick = (event) => {
  selectedEvent.value = event
  showEventModal.value = true
}
</script>

<template>
  <CalendarLayout>
    <template #left >
      <VueCal
        date-picker
        :disable-views="['week', 'day']"
        default-view="month"
        style="height: 300px; font-size: 12px; border: none; width: 100%;"
      />
    </template>
    
    <template #center>
      <h2>개인 일정</h2>
      <div>{{ currentViewDate.year }} {{ currentViewDate.month }}</div>
      <div class="d-flex align-center gap-4 mb-2">
        <v-checkbox
          v-model="showPersonal"
          label="👤 개인일정 보기"
          hide-details
          density="compact"
        />
        <v-checkbox
          v-model="showDepartment"
          label="🏢 부서일정 보기"
          hide-details
          density="compact"
        />
      </div>
      <v-btn color="primary" @click="goToToday">Today</v-btn>
      <div style="height: 100%;">
        <div></div>
        <VueCal
          v-if="showCalendar"
          ref="vueCalRef"
          default-view="month"
          :available-views="['month', 'week', 'day']"
          :events="scheduleList"
          events-on-month-view
          :views="{ days: { cols: 5, rows: 1 }, month: {} }"
          time="24"
          @view-change="onViewChange"
          @cell-click="onCellClick"
          @event-click="onEventClick"
          style="height: 100%; font-family: 'Noto Sans KR', sans-serif;"
        />
      </div>

      <!-- 일정 디테일 모달 -->
      <v-dialog v-model="showEventModal" max-width="400">
        <v-card>
          <v-card-title>{{ selectedEvent?.title }}</v-card-title>
          <v-card-text>
            <p>{{ selectedEvent?.content }}</p>
            <p><strong>날짜:</strong> {{ selectedEvent?.start }}</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" text @click="showEventModal = false">닫기</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <template #right>
      <div style="background-color: #f5f5f5; height: 100vh;">우측</div>
    </template>
  </CalendarLayout>
</template>

<style>
.vuecal {
  /* background-color: #eef3f9; */
  background-color: #ffffff;
  border-radius: 8px;
  padding: 10px;
  --vc-border-color: #d0d7de;
}
.vuecal__title-bar {
  background-color: #ececec;
  color: rgb(41, 41, 41);
  font-weight: bold;
  font-size: 16px;
  border-radius: 4px 4px 0 0;
  display: flex;
  justify-content: flex-start; /* ⬅️ 여기 추가 */
  align-items: center;
  padding-left: 16px; /* ⬅️ 추가 */
}
.vuecal__title {
  text-align: left !important;     /* 텍스트 왼쪽 정렬 */
}
.vuecal__flex .vuecal__title {
  text-align: left;
  justify-content: flex-start;
}
.vuecal__cell-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;
  padding: 4px;
  max-height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.vuecal__cell-events-count {
  width: 100%;
  height: fit-content;
}
.vuecal__cell-date {
  font-weight: bold;
  font-size: 13px;
  text-align: left;
  padding-left: 4px;
}
.vuecal__event {
  text-align: left;
  display: block;
  width: 100%;
  margin: 1px 0;
  font-size: 11px;
  padding: 2px 6px;
  height: 20px;
  border-radius: 4px;
  background-color: gray;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}
.vuecal--years-view .vuecal__cell-content,
.vuecal--year-view .vuecal__cell-content,
.vuecal--month-view .vuecal__cell-content {
  justify-content: flex-start;
}
.event-green {
  background-color: #4caf50;
}
.event-orange {
  background-color: #ff9800;
}
.event-red {
  background-color: #f44336;
}
.vuecal__cell--today {
  /* background-color: #bbdefb !important; */
  background-color: #ffacac !important;
  border: 2px solid #2196f3;
}
.vuecal__cell--has-events {
  background-color: #fffacda8;
}
.vuecal__menu {
  display: none !important;
}
.col-left,
.col-right {
  flex: 1.8;
  padding: 16px;
  background-color: #f5f5f5; /* 구분용 */
}
.col-center {
  flex: 8.4;
  padding: 24px;
}
</style>
