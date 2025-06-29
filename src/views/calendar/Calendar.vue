<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed, watch  } from 'vue'
import CalendarLayout from '@/components/layout/CalendarLayout.vue'
import { dummySchedule } from '@/data/dummySchedule' 
import VueCal from 'vue-cal'
import { useUserStore } from '@/stores/userStore'
import 'vue-cal/dist/vuecal.css'
import api from '@/api'

const userStore = useUserStore()
const miniCalRef = ref(null)
const vueCalRef = ref(null)
const selectedEvent = ref(null)
const showEventModal = ref(false)
const selectedDate = ref(null)      // 미니맵에서 선택한 날짜

const isLoading = ref(false)

const scheduleList = ref([])        // 개인 일정 리스트
const deptScheduleList = ref([])      // 부서 일정 리스트

const deptProjectList = ref([])   // 부서 참여 프로젝트 리스트 
const selectedProjectIds = ref([]) // 선택된 프로젝트 ID 목록
const view = ref('month')

// 선택한 이벤트 상세 보기
const eventDetailPanel = ref(null)  
const editableStart = ref('')
const editableEnd = ref('')
const isAllDay = ref(false)   // 종일인지 여부

const showCalendar = ref(false) 
const showPersonal = ref(true)
const showDepartment = ref(true)

const currentViewDate = ref({})

const showAddPanel = ref(false)
const newScheduleTitle = ref('')
const newScheduleContent = ref('')
const newScheduleStart = ref('')
const newScheduleEnd = ref('')
const newScheduleIsAllDay = ref(true)






const filteredScheduleList = computed(() =>
  scheduleList.value.filter(item => item.status !== 'DELETED')
)


// 프로젝트 체크박스
const filteredDeptScheduleList = computed(() => {
  if (selectedProjectIds.value.length === 0) return []

  return deptScheduleList.value.filter(event =>
    selectedProjectIds.value.includes(event.projectId) &&
    event.status !== 'DELETED'
  )
})

// 개인 일정 불러오기
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
      const end   = new Date(item.endAt)
      const format = d => d.toISOString().slice(0,10)

      return {
        type:    'PERSONAL',            // 개인 일정 타입
        title:   item.name,
        content: item.content,
        start:   format(start),
        end:     format(end),
        class:   'event-personal',
        attributes: {
          title: `${item.name}\n${item.content}`
        }
      }
    })

    console.log('📆 최종 이벤트 목록:', scheduleList.value)
  } catch (err) {
    console.error('❌ 일정 조회 실패:', err)

    // 🔽 실패 시 더미 데이터 주입
    scheduleList.value = dummySchedule
    console.warn('📄 더미 일정으로 대체됨')
  }
}

// 부서 세부일정 목록 조회하기 
async function fetchDeptSchedule () {
  try {
    if (!userStore.id) {
      console.warn('⛔ userId 없음: 부서 일정 조회 중단')
      return
    }

    console.log('부서 일정 조회 요청')
    const res = await api.get('/api/task/dept', {
      params: {
        userId: userStore.id
      }
    })
    console.log('부서 세부일정:', res.data)
    deptScheduleList.value = (res.data.data || []).map(item => {
      const start = new Date(item.startReal ?? item.startExpect)
      const end = new Date(item.endReal ?? item.endExpect)
      const format = (date) => date.toISOString().split('T')[0]

      return {
        type:      'DEPT_DETAIL',  
        title: item.taskName,
        content: item.taskDescription,
        projectName: item.projectName,
        start: format(start),
        end: format(end),
        projectId: item.projectId, 
        class: 'event-dept',
        attributes: {
          title: `[${item.projectName}] ${item.taskName}\n${item.taskDescription}`
        }
      }
    })
  } catch(err){
    console.log('부서 일정 조회 실패')
  }
  // 실패 시 더미 데이터

}

watch(view, (val) => {
  console.log('📌 현재 뷰:', val)
})

// 부서 + 개인 일정 조합
const mergedEvents = computed(() => {
  const events = []
  if (showPersonal.value) {
    events.push(
      ...filteredScheduleList.value.map(ev => ({
        ...ev,
        type: 'PERSONAL'
      }))
    )
  }
  if (showDepartment.value) {
    events.push(
      ...filteredDeptScheduleList.value.map(ev => ({
        ...ev,
        type: 'DEPT_DETAIL'
      }))
    )
  }
  return events
})
watch(mergedEvents, v => console.log('합쳐진 일정:', v))

// 오늘의 일정

// 오늘의 일정
// UTC 대신 로컬 시간 기준 문자열 만들기
const today = new Date().toLocaleDateString('sv') // 'YYYY-MM-DD' 반환

const todayList = computed(() => {
  return mergedEvents.value.filter(event => {
    const start = event.start
    const end   = event.end ?? event.start
    return start <= today && today <= end
  })
})

// 부서별 참여 프로젝트 목록 조회
async function fetchDeptProject () {
  console.log("부서별 참여 프로젝트 조회 요청")
  try {
    console.log(userStore.deptName)
    const res = await api.post('/api/projects/dept', {
      deptName: userStore.deptName
    })

    console.log('📌 부서 프로젝트 목록:', res.data.data.projectList)
    deptProjectList.value = res.data.data.projectList
    selectedProjectIds.value = deptProjectList.value.map(p => p.id)
  } catch (err) {
    console.error('❌ 부서 프로젝트 조회 실패:', err)
  }
}

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
// 오늘 날짜
const todayFormatted = computed(() => {
  const today = new Date()
  const month = today.getMonth() + 1
  const date = today.getDate()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()]
  return `${month}월 ${date}일 ${weekday}요일`
})

// 메인 달력 뷰 변경
function switchToYearView() {
  view.value = 'year'
  vueCalRef.value?.switchView('year')
}

function switchToYearsView() {
  view.value = 'years'
  vueCalRef.value?.switchView('years')
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
  isLoading.value = true
  await nextTick()
  showCalendar.value = true
  await nextTick()
  vueCalRef.value?.switchView('month')

  // 🟢 여기서 두 요청을 병렬로 날려서 기다리는 시간을 반으로!
  await Promise.all([
    fetchDeptSchedule(),
    fetchDeptProject()
  ])
  isLoading.value = false

})

// 셀 클릭 처리
const onCellClick = ({ date, events }) => {
  console.log(selectedDate.value)

  console.log('📌 날짜 클릭:', date, events)
}
// 이벤트 클릭 처리 
const onEventClick = (event) => {
  console.log('✅ 이벤트 클릭됨:', event)
  selectedEvent.value = event
  eventDetailPanel.value = true
}

const onCellDblClick = ({ date }) => {
  const formatted = toDateInputString(selectedDate.value)

  selectedDate.value = formatted // ✅ 선택된 날짜 저장
  selectedEvent.value = null
  showAddPanel.value = true

  newScheduleTitle.value = ''
  newScheduleContent.value = ''
  newScheduleStart.value = formatted   // ✅ 시작일
  newScheduleEnd.value = formatted     // ✅ 종료일도 동일하게
  newScheduleIsAllDay.value = true
}

//  선택한 일정 상세 보기
const handleClickOutside = (e) => {
  const isInsideEvent = e.target.closest('.vuecal__event')
  const isInsidePanel = eventDetailPanel.value?.contains(e.target)

  if (isInsideEvent || isInsidePanel) return

  // 이벤트 상세 닫기
  if (selectedEvent.value) {
    selectedEvent.value = null
  }

  // 새 일정 생성 패널 닫기
  if (showAddPanel.value) {
    showAddPanel.value = false
  }
}

// 프로젝트 전체 선택
const toggleAllProjects = () => {
  if (selectedProjectIds.value.length === deptProjectList.value.length) {
    // 모두 선택된 경우 → 전체 해제
    selectedProjectIds.value = []
  } else {
    // 일부 또는 없음 → 전체 선택
    selectedProjectIds.value = deptProjectList.value.map(p => p.id)
  }
}




function toDateInputString(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}` // YYYY-MM-DD
}
//  localDateTime 형태로 수정
function toLocalDateTimeString(date) {
  const d = new Date(date)
  if (isNaN(d.getTime())) return null // 🚫 유효하지 않은 날짜일 경우 null 반환
  const yyyy = d.getFullYear()
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`
}


const submitNewSchedule = async () => {
  if (!newScheduleTitle.value || !newScheduleStart.value) {
    alert('제목과 시작일은 필수입니다.')
    return
  }

  // 이벤트 생성
  const newEvent = {
    createdBy : userStore.id,
    name: newScheduleTitle.value,
    content: newScheduleContent.value,
    startDate: toLocalDateTimeString(newScheduleStart.value),
    endDate: toLocalDateTimeString(newScheduleEnd.value || newScheduleStart.value),    isRepeat: false,
    frequencyInfo : null,
    eventType : "PERSONAL",
    class: 'event-personal',
    attributes: {
      title: `${newScheduleTitle.value}\n${newScheduleContent.value}`
    }
  }

  // 예시: 로컬에 추가 (실제 앱에서는 API POST)
  scheduleList.value.push(newEvent)
  try {
    const res = await api.post( `/api/calendar/create`, newEvent)
    console.log("✅개인 일정 생성 성공", res.data)
    // 서버 기준 일정 다시 불러오기 (정합성 보장)
    if (currentViewDate.value.year && currentViewDate.value.month) {
      await fetchMonthlySchedule(currentViewDate.value.year, currentViewDate.value.month)
    }
  } catch (err) {
    console.log('🚫 개인 일정 생성 실패', err)
    
  }

  // 초기화
  showAddPanel.value = false
  newScheduleTitle.value = ''
  newScheduleContent.value = ''
}


watch(selectedEvent, event => {
  if (!event) return;
  // event.start, event.end 는 'YYYY-MM-DD' 문자열이므로 Date 생성한 뒤
  editableStart.value = toLocalDateTimeString(event.start);
  editableEnd.value   = toLocalDateTimeString(event.end  || event.start);
  isAllDay.value = event.start === event.end;
});


function goPrevMonth() {
  vueCalRef.value?.previous()
}

function goNextMonth() {
  vueCalRef.value?.next()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(selectedDate, async (newDate) => {
  if (newDate && vueCalRef.value) {
    await nextTick()
    vueCalRef.value.switchView('month', new Date(newDate))
  }
})

watch(selectedProjectIds, (val) => {
  console.log('✅ 선택된 프로젝트 IDs:', val)
})

watch(selectedEvent, (event) => {
  if (event) {
    editableStart.value = toDateInputString(event.start)
    editableEnd.value = toDateInputString(event.end) // ✅ 여기서 NaN 방지
  }
})

</script>

<template>
      <CalendarLayout>
        <v-overlay
          :model-value="isLoading"
          class="d-flex justify-center align-center"
          opacity="0.4"
          persistent
        >
          <v-progress-circular indeterminate size="48" color="primary" />
        </v-overlay>
        <template #left>
          <div class="left-cal">
            <div style="height: 250px; font-size: 12px; border: none; width: 100%; margin: 0 auto;">
              <VueCal
                class="mini-calendar"
                ref="miniCalRef"
                date-picker
                :views-bar="false"
                view="month"    
                :views="['month']"
                :selected-date="selectedDate"
                default-view="month"
                :available-views="['month']"
                hide-view-selector
                time="24"
                @cell-focus="selectedDate = $event"
                @ready="() => miniCalRef?.switchView('month')"
                
                locale="ko"
                :locales="{
                  ko: {
                    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
                    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                    firstDayOfWeek: 0 // 일요일: 0, 월요일: 1
                  }
                }"
              />
            </div>
            <div style="height: 300px; text-align: left;">
              <h5
                @click="toggleAllProjects"
                style="display: flex; align-items: center; gap: 6px; font-weight: 600; margin-bottom: 10px; color: #757575; cursor: pointer;"
              >
                <v-icon size="18" class="me-1" icon="mdi-format-list-bulleted" />
                부서 프로젝트 목록
              </h5>

              <v-virtual-scroll
                :items="deptProjectList"
                :height="240"
                item-height="48"
              >
                <template #default="{ item: project }">
                  <label class="custom-checkbox">
                    <input
                      style="margin-left:5px;"
                      type="checkbox"
                      :value="project.id"
                      v-model="selectedProjectIds"
                    />
                    <div class="checkbox-label">
                      <div class="project-name" :title="project.name">
                        {{ project.name || '(이름 없음)' }}
                      </div>
                      <div class="project-dates">
                        {{ project.startDate }} → {{ project.endDate?.slice(5) }}
                      </div>
                    </div>
                  </label>
                </template>
              </v-virtual-scroll>

              <p v-if="!deptProjectList.length" style="font-size: 13px;">📭 참여 중인 프로젝트가 없습니다.</p>
            </div>
          </div>
          
        </template>
            
        <template #center>
          <div style="height: 100%; display: flex; flex-direction: column;">

            <div style="display: flex; flex-direction:row;  gap: 8px; margin-bottom: 12px;">
              <h2 style="font-weight: normal; margin: 0; cursor:pointer;" @click="switchToYearsView"> {{ currentViewDate.year }}년 </h2>
              <h2 style="cursor:pointer;" @click="switchToYearView">{{ currentViewDate.month }}월</h2>
            </div>


            <div style="display: flex; flex-direction: row; align-items:center; justify-content: space-between;">
              <div class="d-flex align-center gap-4 mb-2">
                <v-checkbox v-model="showPersonal" label="👤 개인일정 보기" hide-details density="compact" />
                <v-checkbox v-model="showDepartment" label="🏢 부서일정 보기" hide-details density="compact" />
              </div>
              <div>
                <v-btn color="black" @click="goToToday" style="width: fit-content" variant="plain">Today</v-btn>
                <v-btn icon variant="text" @click="goPrevMonth">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn icon variant="text" @click="goNextMonth">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
              
            </div>

            <div style="flex: 1; overflow: hidden;">
              <VueCal
                class="main-cal"
                v-if="showCalendar"
                ref="vueCalRef"
                v-model:view="view"
                :views="{
                  month: {},
                  year: {},
                  yaers: {}
                }"
                :available-views="['month', 'year', 'years']"
                default-view="month"
                :events="mergedEvents"
                :prevent-event-details="true"
                :disable-views="['day', 'week']"
                :disable-views-transition="true"
                :selected-date="selectedDate"
                events-on-month-view
                time="24"
                @cell-focus="selectedDate = $event"
                @view-change="onViewChange"
                @cell-click="onCellClick"
                @cell-dblclick="onCellDblClick"
                @event-click="onEventClick"
                style="height: 100%;"
                locale="ko"
                :locales="{
                  ko: {
                    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
                    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                    firstDayOfWeek: 0
                  }
                }"
              />

            </div>
          </div>
        </template>


        <template #right>
          <!-- background-color: #f5f5f5;  -->
          <div style="min-height: 100vh; padding: 15px; font-size: 13px;" ref="eventDetailPanel">
            <div v-if="selectedEvent"  class="event-detail-panel" @click.stop>
              <h4>📌 이벤트</h4>
              <div style="diaplsy: flex; flex-direction: column; background-color: #f5f5f5; padding: 10px;">          
                
                <div><strong>{{ selectedEvent?.title }}</strong></div>
                <div class="content-section">
                  {{ selectedEvent?.content }}
                </div>

              </div>


              <div style="display: flex; flex-direction: column; width: 100%; text-align: left; justify-content: flex-start; gap: 6px;">
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                  <span>
                    <v-icon icon="mdi-calendar" size="15" class="mr-1"/>
                    <span class="mr-3"><strong>시작일</strong></span>
                  </span>
                  
                  <span>{{ new Date(selectedEvent?.start).toISOString().slice(0, 10) }}</span>
                  <!-- <input type="datetime-local" v-model="editableStart" readonly /> -->
                </div>
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                  <span>
                    <v-icon icon="mdi-calendar" size="15" class="mr-1"/>
                    <span class="mr-3"><strong>마감일</strong></span>
                  </span>
                  
                  <span>{{ new Date(selectedEvent?.end).toISOString().slice(0, 10) }}</span>
                  <!-- <input type="datetime-local" v-model="editableStart" readonly /> -->
                </div>
              </div>
              <v-switch 
                label="종일" 
                readonly="true"
                v-model="isAllDay"
                density="compact"
                hide-details
                style="height: 20px;"
                class="small-switch mt-2 custom-switch"
                color="success" />
              
            </div>
            <div v-else-if="showAddPanel" class="event-detail-panel" @click.stop>
              <h4>📌 새 일정 생성</h4>
              <v-text-field
                v-model="newScheduleTitle"
                label="제목"
                dense
                hide-details
              />
              
              <v-textarea
                v-model="newScheduleContent"
                label="내용"
                rows="2"
                dense
                hide-details
              />
              <div class="mt-2" style="display:flex; flex-direction: row; gap: 8px;">
                <span><strong>시작일</strong></span>
                <input type="date" v-model="selectedEvent.value.start" />
              </div>
              <div style="display:flex; flex-direction: row; gap: 8px;">
                <span><strong>종료일</strong></span>
                <input type="date" v-model="newScheduleEnd" />
              </div>
              <v-switch
                label="종일"
                v-model="newScheduleIsAllDay"
                density="compact"
                hide-details
                color="success"
                class="small-switch mt-2 custom-switch"
              />
              <div class="mt-4">
                <v-btn color="primary" @click="submitNewSchedule">생성</v-btn>
                <v-btn class="ml-2" variant="text" @click="showAddPanel = false">취소</v-btn>
              </div>
            </div>
            
            <div v-else>
              <h4 style="color: #818181; display: flex; align-items: center; gap: 6px; margin-bottom: 15px;">
                <v-icon size="18" icon="mdi-calendar" />
                예정된 이벤트
              </h4>
              <h4 style="color: #FF4545; margin-bottom: 15px; text-align: left;">TODAY. {{ todayFormatted }}</h4>


              <!-- 캐러셀 태스트 -->
                <div v-if="todayList.length && !selectedEvent" class="today-carousel">
                  <v-slide-group
                    show-arrows
                    direction="vertical"
                    style="max-height: 500px; overflow: hidden;"
                    prev-icon="mdi-chevron-up"
                    next-icon="mdi-chevron-down"
                  >
                    <v-slide-item
                      v-for="(event, idx) in todayList.slice(0, 6)"
                      :key="idx"
                    >
                      <v-card flat class="pa-3 mb-2"
                      :style="{
                      fontSize:      '12px',
                      padding:       '10px 15px',
                      backgroundColor: event.type === 'PERSONAL' ? '#FFF0F8' : '#eef3f9',
                      borderRadius:  '5px',
                      marginBottom:  '5px',
                    }"
                    >
                        <div class="d-flex flex-column">
                          <strong class="mb-1 truncate">{{event.type==='PERSONAL' ? '⭐' : '👥' }} {{ event.title }}</strong>
                          <div class="truncate mb-1" style="font-size: 13px; color: #555">
                            {{ event.content }}
                          </div>
                          <div class="today-project-name truncate" style="font-size: 12px; color: #888">
                            {{ event.projectName }}
                          </div>
                        </div>
                      </v-card>
                    </v-slide-item>
                  </v-slide-group>
                </div>

              <div v-else>
                일정이 없습니다.
              </div>
            </div>

            
          </div>
        </template>
      </CalendarLayout>
</template>

<style>
.vuecal {
  /* background-color: #eef3f9; */
  background-color: #ffffff;
  border-radius: 8px;
  /* padding: 10px; */
  --vc-border-color: #d0d7de;
}
.vuecal__title-bar {
  display: none !important;
  /* display: flex !important;  */
  background-color: #ececec;
  color: rgb(41, 41, 41);
  font-weight: bold;
  font-size: 16px;
  border-radius: 4px 4px 0 0;
  justify-content: flex-start;
  align-items: center;display: none !important;
  padding-left: 12px;
  height: 40px;
}
.vuecal__title .button {
  display: none !important; /* ⛔ 뷰 전환 버튼 숨김 */
}

.vuecal__title {
  justify-content: flex-start !important;
  text-align: left !important;
}
.vuecal__title span {
  display: none !important;
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
.vuecal__view {
  transition: none !important;
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
  /* color: white; */
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}


.vuecal--years-view .vuecal__cell-content,
.vuecal--year-view .vuecal__cell-content,
.vuecal--month-view .vuecal__cell-content {
  justify-content: flex-start;
  cursor: default;
}
.event-personal {
  background-color: #FFF0F8;
}
.event-dept {
  background-color: #eef3f9;
}
.event-orange {
  background-color: #ff9800;
}
.event-red {
  background-color: #f44336;
}

/* 클릭한 날짜에 대한 효과 */
.vuecal__cell--selected {
  background-color: #dedfff !important; /* 연파랑 배경 */
  border: 2px solid #7578ee !important; /* 파란 테두리 */
  border-radius: 6px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
}

/* 오늘 날짜에 하이라이트 */
.vuecal__cell--today {
  /* background-color: #bbdefb !important; */
  background-color: #ffacac !important;
}
/* 이벤트 있는 셀에 하이라이트 */
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
.left-cal{
  width: 100%;
  /* padding: 14px; */
  background-color: #F7F7F7;
  /* height: 100%; */
  min-height: 100%;
  height: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 50px;
}
.mini-calendar {
  border: none !important;
  box-shadow: none !important;
  padding: 0;
  background-color: rgba(0,0,0,0);
  margin-bottom: 20px;
}

.mini-calendar .vuecal__title-bar {
  background-color: rgba(0,0,0,0);
  font-size: 12px;
  /* pointer-events: none; */
}

.mini-calendar .vuecal__flex .vuecal__title {
  pointer-events: none;
}

.mini-calendar .vuecal__cell-date {
  font-size: 8px;
}

.main-cal {
  border: none !important;
  box-shadow: none !important;
}
/* 선택한 이벤트 정보 */
.event-detail-panel {
  display: flex; 
  flex-direction: column;
  gap: 10px;
}

/* input[type="date"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
} */
.custom-switch .v-label {
  font-size: 13px !important; /* ✅ 라벨 글자 크기 */
}
.small-switch {
  --v-switch-track-height: 16px;
  --v-switch-track-width: 32px;
  --v-switch-thumb-size: 12px;
  font-size: 12px;
}
.content-section {
  background-color: white;
}
.checkbox-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.custom-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  font-size: 12px;
}

.custom-checkbox input[type="checkbox"] {
  transform: scale(1.1);
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  flex-direction: column;
}

.project-name {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.project-dates {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}
.v-virtual-scroll {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #c4c4c4 transparent;
}

/* Chrome, Edge, Safari */
.v-virtual-scroll::-webkit-scrollbar {
  width: 6px;               /* 수직 스크롤 너비 */
}

.v-virtual-scroll::-webkit-scrollbar-thumb {
  background-color: #b0b0b0; /* 회색 막대 */
  height: 15px;
  border-radius: 6px;
}
.custom-checkbox:hover {
  background-color: #f0f0f0; /* 연회색 배경 */
  border-radius: 4px;        /* 모서리 둥글게 (선택사항) */
  cursor: pointer;           /* 마우스 커서 포인터 */
}
li:hover {
  background-color: #e0e0e0;
  transition: background-color 0.2s;
}

.today-item{
  text-align: left;
}
.today-project-name {
  white-space: nowrap;       /* 한 줄로 고정 */
  overflow: hidden;          /* 넘치는 텍스트 자르기 */
  text-overflow: ellipsis;   /* 말줄임표 표시 */
  /* 필요에 따라 너비 지정 */
  max-width: 200px;
}
.today-carousel {
  margin-top: 16px;
}

/* 텍스트가 넘치면 … 처리 */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


</style>
