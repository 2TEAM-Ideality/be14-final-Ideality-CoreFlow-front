<template>
  <div class="donut-wrapper">
    <canvas ref="chartRef"></canvas>
    <div class="center-text">
      <strong>{{ props.taskInfo.selectTask.progressRate }}%</strong>
      <div>완료</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref, computed } from 'vue'
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
  detailList: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chartInstance = null

const statusCounts = computed(() => {
  const todo = props.detailList.filter(d => d.status === 'PENDING').length
  const delay = props.taskInfo.selectTask?.delayDays || 0
  const doing = props.detailList.filter(d => d.status === 'PROGRESS').length
  const done = props.detailList.filter(d => d.status === 'COMPLETED').length
  return [todo, delay, doing, done]
})

const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const data = {
    labels: ['해야 할 일', '지연 발생', '진행 중', '완료'],
    datasets: [
      {
        data: [1, 1, 1, 1],
        backgroundColor: ['#DADADA', '#FF914D', '#4D91FF', '#56D193'],
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

onMounted(renderChart)
onUnmounted(() => chartInstance?.destroy())
watch(statusCounts, renderChart)
</script>

<style scoped>
.donut-wrapper {
  position: relative;
  width: 200px;
  aspect-ratio: 1 / 1; /* ✅ 정사각형 유지 */
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
</style>
