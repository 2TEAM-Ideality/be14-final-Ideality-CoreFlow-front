<template>
  <div class="donut-wrapper">
    <Doughnut :data="chartData.value" :options="chartOptions" />
    <div class="center-text">
      <strong>{{ props.taskInfo.selectTask.progressRate }}%</strong>
      <div>완료</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  taskInfo: { type: Object, required: true },
  detailList: {
    type: Array,
    default: () => []
  }
})

const statusCounts = computed(() => {
  const todo = props.detailList.filter(d => d.status === 'PENDING').length
  const delay = props.taskInfo.selectTask?.delayDays || 0
  const doing = props.detailList.filter(d => d.status === 'PROGRESS').length
  const done = props.detailList.filter(d => d.status === 'COMPLETED').length

  return [todo, delay, doing, done]
})

console.log(statusCounts.value )


const chartData = computed(() => {
  if (!props.detailList || !Array.isArray(props.detailList)) {
    return {
      labels: [],
      datasets: []
    }
  }

  const todo = props.detailList.filter(d => d.status === 'PENDING').length
  const delay = props.taskInfo?.selectTask?.delayDays || 0
  const doing = props.detailList.filter(d => d.status === 'PROGRESS').length
  const done = props.detailList.filter(d => d.status === 'COMPLETED').length

  return {
    labels: ['해야 할 일', '지연일', '진행 중', '완료'],
    datasets: [
      {
        label: '상태 분포',
        data: [todo, delay, doing, done],
        backgroundColor: ['#DADADA', '#FF914D', '#4D91FF', '#56D193'],
        borderWidth: 0
      }
    ]
  }
})


const chartOptions = {
  cutout: '70%',
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  }
}
</script>


<style scoped>
.donut-wrapper {
  position: relative;
  width: 200px;
  text-align: center;
  height: 200px;
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
