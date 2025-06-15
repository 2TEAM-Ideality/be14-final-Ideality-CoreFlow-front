<template>
  <div class="custom-node-horizontal" @click.self="handleSelect" >
    <Handle type="target" :position="Position.Left" :style="handleStyle" />
    <Handle type="source" :position="Position.Right" :style="handleStyle" />

    <v-card
      flat
      elevation="0"
      class="node-card"
      :style="cardStyle"
    >
      <!-- 헤더 -->
      <div class="node-header">
        <div class="left-header">
          <v-icon :color="iconColor" class="node-icon">{{ icon }}</v-icon>
          <span class="title">{{ data.label || '작업 이름' }}</span>
        </div>
        <v-btn icon size="x-small" variant="text">
          <v-icon>mdi-dots-horizontal</v-icon>
        </v-btn>
      </div>

      <!-- 날짜 -->
      <div class="date-info">
        <div>실제 시작일: {{ data.startDate || '-' }}</div>
        <div>{{ data.endLabel || '예상 마감일' }}: {{ data.endDate || '-' }}</div>
      </div>

      <!-- 진행 정보 -->
      <div class="metrics">
        <div class="metric">
          <div class="label">진척률</div>
          <v-progress-circular
            :model-value="data.progress || 0"
            :color="progressColor"
            size="40"
            width="4"
          >
            {{ (data.progress || 0) + '%' }}
          </v-progress-circular>
        </div>
        <div class="metric">
          <div class="label">경과율</div>
          <v-progress-circular
            :model-value="data.elapsed || 0"
            :color="progressColor"
            size="40"
            width="4"
          >
            {{ (data.elapsed || 0) + '%' }}
          </v-progress-circular>
        </div>
        <div class="metric">
          <div class="label">지연일</div>
          <div :class="['delay-text', delayColor]">{{ delayText }}</div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
const props = defineProps(['data', 'id'])
const emit = defineEmits(['addNode', 'click'])

const handleSelect = () => emit('click', props.id)

const iconMap = {
  'in-progress': 'mdi-play-circle-outline',
  'pending': 'mdi-pause-circle-outline',
  'done': 'mdi-check-circle-outline',
  'done-delayed': 'mdi-check-circle-outline',
  'delayed': 'mdi-alert-circle-outline'
}
const colorMap = {
  'in-progress': '#307CFF',
  'pending': '#B2B2B2',
  'done': '#34C759',
  'done-delayed': '#34C759',
  'delayed': '#FF6577'
}
const backgroundMap = {
  'in-progress': '#F0F5FF',
  'pending': '#FFFFFF',
  'done': '#F6FCF7',
  'done-delayed': '#F6FCF7',
  'delayed': '#FFF7F7'
}

const delay = props.data?.delay ?? 0
const delayText = delay > 0 ? `+${delay}일` : '0일'
const delayColor = delay > 0 ? 'text-red' : 'text-grey'
const progressColor = 'deep-purple-lighten-1'

const status = props.data?.status || 'pending'
const icon = iconMap[status]
const iconColor = colorMap[status]
const backgroundColor = backgroundMap[status]

const cardStyle = {
  backgroundColor,
  border: `1px solid ${iconColor}`,
  borderRadius: '5px'
}

const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#1e293b'
}
</script>


<style scoped>
.custom-node-horizontal {
  position: relative;
}
.node-card {
  padding: 16px;
  width: 220px;
  
}
.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.left-header {
  display: flex;
  align-items: center;
}
.node-icon {
  font-size: 24px;
  margin-right: 6px;
}
.title {
  font-weight: bold;
  font-size: 16px;
}
.date-info {
  font-size: 11px;
  color: #888;
  margin-bottom: 12px;
}
.metrics {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.label {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
}
.delay-text {
  font-weight: bold;
  font-size: 14px;
}
</style>
