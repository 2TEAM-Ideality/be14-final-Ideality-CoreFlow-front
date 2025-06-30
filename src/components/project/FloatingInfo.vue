<template>
  <div class="floating-modal" :style="{ top: topValue }">
    <div class="metrics">
      <div class="metric-item">
        <span class="label">총 태스크</span>
        <span class="value">{{ props.totalTaskCount }} <span style="font-size: 13px;"></span> </span>
      </div>
      <div class="metric-item">
        <span class="label">경과율</span>
        <span class="value">{{ props.passedRate }} <span style="font-size: 13px;">%</span> </span>
      </div>
      <div class="metric-item">
        <span class="label">진척률</span>
        <span class="value" :style="{ color: props.progressRate > 0 ? '#34C759' : '#444' }">
          {{ props.progressRate }} <span style="font-size: 13px;">%</span></span>
      </div>
      <div class="metric-item">
        <span class="label">지연일</span>
        <span
        class="value"
        :style="{ color: props.delayDays > 0 ? '#FF6577' : '#444' }"
        >
        {{ props.delayDays > 0 ? '+' : '' }}{{ props.delayDays }}일
        </span>
      </div>
    </div>

    <div class="status-list">
      <div
        class="status-item"
        v-for="item in statusItems"
        :key="item.key"
      >
        <v-tooltip location="right">
          <template #activator="{ props }">
            <div class="tooltip-target" v-bind="props">
              <v-icon :color="item.color" size="20">{{ item.icon }}</v-icon>
              <span class="count">{{ item.count }}</span>
            </div>
          </template>
          <span>{{ statusMessage[item.key] || item.key }}</span>
        </v-tooltip>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  totalTaskCount : Number,
  passedRate: Number,
  progressRate: Number,
  delayDays: Number,
  statusCounts: {
    type: Object,
    required: true
    // 예: { COMPLETED: 3, PROGRESS: 5, DELAYED: 1, PENDING: 2 }
  }
})

const topValue = ref('40%')



function updateTopOnScroll() {
  const scrollY = window.scrollY
  topValue.value = scrollY > 100 ? '20%' : '40%'
}

onMounted(() => {
  window.addEventListener('scroll', updateTopOnScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateTopOnScroll)
})

const fixedStatuses = [
  { key: 'COMPLETED', icon: 'mdi-check-circle-outline', color: 'green' },
  { key: 'PROGRESS', icon: 'mdi-progress-clock', color: 'blue' },
  { key: 'DELAYED', icon: 'mdi-alert-circle-outline', color: 'red' },
  { key: 'PENDING', icon: 'mdi-play-circle-outline', color: 'grey' },
  { key: 'WARNING', icon: 'mdi-alert-circle-outline', color: '#FFA000' }
]

const statusMessage = {
  COMPLETED: '완료',
  PROGRESS: '진행 중',
  DELAYED: '지연 발생',
  PENDING: '시작 전',
  WARNING: '지연 위험'
}

// statusCounts가 정의되어 있을 때만 접근하도록 수정
const statusItems = computed(() =>
  fixedStatuses.map(item => ({
    key: item.key, 
    icon: item.icon,
    color: item.color,
    count: props.statusCounts?.[item.key] ?? 0
  }))
)
</script>

<style scoped>
.floating-modal {
  position: fixed;
  left: 40px;
  width: fit-content;
  background: white;
  border-radius: 18px;
  border: solid 1px #eeeeee;
  box-shadow: 0 4px 10px rgba(103, 103, 103, 0.15);
  padding: 20px 16px;
  z-index: 900;
  transition: top 0.3s ease;
  text-align: center;
  justify-content: center;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #444;
}
.value {
    font-weight: bold;
    color: #444;
    font-size: 18px;
}
.count {
  font-weight: bold;
}
.tooltip-target {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
