<template>
  <div class="donut-wrapper">
    <canvas ref="chartRef"></canvas>
    <div v-if="props.taskInfo.selectTask.progressRate > 0.0" class="center-text">
      <strong>{{ props.taskInfo.selectTask.progressRate }}%</strong>
      <div>완료</div>
    </div>
    <div v-else class="zero-progress">
      <strong>{{ props.taskInfo.selectTask.progressRate }}%</strong>
      <div>완료</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref, computed, nextTick } from 'vue'
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
} from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, Title, DoughnutController)

const props = defineProps({
  taskInfo: { type: Object, required: true },
  detailList: { type: Array, default: () => [] },
  taskDeadlineWarning : {type: Number, default: () => 0}
})

// ✅ 완료 여부 체크
const isCompleted = computed(() => props.taskInfo?.selectTask?.progressRate >= 100)

const chartRef = ref(null)
let chartInstance = null


onMounted(() => {
  console.log(props.taskInfo)
})
// ✅ 상태별 카운트 계산
const statusCounts = computed(() => {
  const pending = props.detailList.filter(d => d.status === 'PENDING').length
  // const delay = props.detailList.filter(d => d.delayDays > 0).length
  const delay = props.taskDeadlineWarning
  const progress = props.detailList.filter(d => d.status === 'PROGRESS').length
  const completed = props.detailList.filter(d => d.status === 'COMPLETED').length
  return [pending, delay, progress, completed]
})

// ✅ 차트 그리기
const renderChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const rawData = statusCounts.value
  const allZero = rawData.every(v => v === 0)

  const baseData = isCompleted.value
    ? [1]
    : allZero
      ? [1]
      : rawData

  const baseColors = isCompleted.value
    ? ['#56D193']
    : allZero
      ? ['#DADADA']
      : ['#DADADA', '#FF914D', '#4D91FF', '#56D193']

  const labels = isCompleted.value
    ? ['완료됨']
    : allZero
      ? ['진행 없음']
      : ['해야 할 일', '지연 발생', '진행 중', '완료']

  const data = {
    labels,
    datasets: [
      {
        data: baseData,
        backgroundColor: baseColors,
        borderWidth: 0
      }
    ]
  }

  const options = {
    cutout: '70%',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  }

  chartInstance = new Chart(chartRef.value, {
    type: 'doughnut',
    data,
    options
  })
}

// ✅ 마운트 및 감시
onMounted(async () => {
  await nextTick()
  renderChart()
})

watch(statusCounts, () => {
  renderChart()
})

onUnmounted(() => {
  chartInstance?.destroy()
})
</script>

<style scoped>
.donut-wrapper {
  position: relative;
  width: 200px;
  aspect-ratio: 1 / 1;
  text-align: center;
}
canvas {
  width: 100% !important;
  height: 100% !important;
}
.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 18px;
  color: #333;
}
.center-text strong {
  font-size: 24px;
  color: #3cb371;
}
.zero-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 18px;
  color: #DADADA;
}
.zero-progress strong {
  font-size: 24px;
}

</style>
