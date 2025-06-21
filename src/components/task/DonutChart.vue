<script setup>
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const chartData = {
  labels: ['해야 할 일', '지연일 발생', '진행 중', '완료'],
  datasets: [
    {
      label: '상태 분포',
      data: [11, 2, 4, 1],
      backgroundColor: ['#DADADA', '#FF914D', '#4D91FF', '#56D193'],
      borderWidth: 0,
    },
  ],
}

const chartOptions = {
  cutout: '70%',
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
}
</script>

<template>
  <div class="donut-wrapper">
    <Doughnut :data="chartData" :options="chartOptions" />
    <div class="center-text">
      <strong>6%</strong>
      <div>완료</div>
    </div>
  </div>
</template>

<style scoped>
.donut-wrapper {
  position: relative;
  width: 200px;
  height:  200px;
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
