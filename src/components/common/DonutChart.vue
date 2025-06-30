<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js'
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)
const props = defineProps({
    value: Number,
    label: String,
    color: String,
})

const chartRef = ref(null)
let chartInstance = null
  
const renderChart = () => {
    if (chartInstance) chartInstance.destroy()

    chartInstance = new Chart(chartRef.value, {
        type: 'doughnut',
        data: {
            datasets: [
                {
                    data: [props.value, 100 - props.value],
                    backgroundColor: [props.color, '#E0E0E0'],
                    borderWidth: 0,
                },
            ],
        },
        options: {
        cutout: '90%',
        responsive: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        },
    })
}

onMounted(renderChart)
onUnmounted(()=>chartInstance?.destroy())
watch(()=>props.value, renderChart)

</script>

<template>
    <div class="donut-chart">
        <canvas ref="chartRef"></canvas>
        <div class="center-text">{{ value }}%</div>
    </div>
</template>

<style scoped>
.donut-chart {
    position: relative;
    width: 48px;
    height: 48px;
}
canvas {
    width: 48px !important;
    height: 48px !important;
}
.center-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 13px;
    font-weight: bold;
    text-align: center;
    line-height: 1.2;
}
</style>