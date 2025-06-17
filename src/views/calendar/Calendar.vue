<script setup>
import { ref, nextTick, onMounted } from 'vue'
import CalendarLayout from '@/components/layout/CalendarLayout.vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'

const vueCalRef = ref(null)
const selectedEvent = ref(null)
const showEventModal = ref(false)


const events = [
  {
    start: '2025-06-20',
    end: '2025-06-20',
    title: 'PJT.A 디자인',
    content: '디자인팀 리뷰',
    class: 'event-green',
    attributes: {
      title: 'PJT.A 디자인\n디자인팀 리뷰'
    }
  },
  {
    start: '2025-10-05',
    end: '2025-10-05',
    title: '납기 일정 점검',
    content: '생산팀 확인',
    class: 'event-orange',
    attributes: {
      title: '납기 일정 점검\n생산팀 확인'
    }
  },
  {
    start: '2025-10-23',
    end: '2025-10-23',
    title: '샘플 제작',
    content: '오전 9시 시작',
    class: 'event-red',
    attributes: {
      title: '샘플 제작\n오전 9시 시작'
    }
  },
]




const showCalendar = ref(false)

onMounted(async () => {
  await nextTick()
  showCalendar.value = true
  await nextTick()
  if (vueCalRef.value) {
    vueCalRef.value.switchView('month') // 뷰 강제 변경
  }
})


const onCellClick = ({ date, events }) => {
  console.log('날짜 클릭됨:', date, events)
}

const onEventClick = (event) => {
  console.log('이벤트 클릭됨:', event)
  selectedEvent.value = event
  showEventModal.value = true
}

</script>

<template>
  <CalendarLayout>
    <template #left>
      <div style="background-color: #f5f5f5; height: 100vh;">좌측</div>
    </template>

    <template #center>
      <h2>부서 일정</h2>
      <div style="height: 100%;">
        <VueCal
          v-if="showCalendar"
          ref="vueCalRef"
          default-view="month"
          :available-views="['month', 'week', 'day']"
          :events="events"
          events-on-month-view
          :views="{ days: { cols: 5, rows: 1 }, month: {} }"
          time="24"
          @cell-click="onCellClick"
          @event-click="onEventClick"
          style="height: 100%; font-family: 'Noto Sans KR', sans-serif;"
        />
      </div>

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
/* 달력 기본 스타일 개선 */
.vuecal {
  background-color: #eef3f9;
  border-radius: 8px;
  padding: 10px;
  --vc-border-color: #d0d7de;
}

.vuecal__title-bar {
  background-color: #1976d2;
  color: white;
  font-weight: bold;
  border-radius: 4px 4px 0 0;
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
  width :100%;
  height: fit-content;
}
.vuecal--years-view .vuecal__cell-content, .vuecal--year-view .vuecal__cell-content, .vuecal--month-view .vuecal__cell-content {
    justify-content: flex-start;
}
.vuecal__cell-date {
  font-weight: bold;
  font-size: 13px;
  text-align: left;
  padding-left: 4px;
}

/* 이벤트 스타일 */
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
  white-space: nowrap;           /* 🔑 줄바꿈 방지 */
  overflow: hidden;              /* 🔑 넘치면 숨기기 */
  text-overflow: ellipsis;       /* 🔑 말줄임 (...) 처리 */
  box-sizing: border-box;
}

/* 이벤트 색상 지정 */
.event-green {
  background-color: #4caf50;
}
.event-orange {
  background-color: #ff9800;
}
.event-red {
  background-color: #f44336;
}

/* 오늘 날짜 강조 */
.vuecal__cell--today {
  background-color: #bbdefb !important;
  border: 2px solid #2196f3;
}
.vuecal__cell--has-events {background-color: #fffacda8;}
.vuecal__menu {
  display: none !important;
}
</style>
