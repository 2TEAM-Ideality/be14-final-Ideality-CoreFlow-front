<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import { useRoute } from 'vue-router'
import api from '@/api' 


const route = useRoute()
const projectId = route.params.id

const { viewport } = useVueFlow()
const zoomLevel = computed(() => viewport.value.zoom)
const { updateNodeData } = useVueFlow()


onMounted(() => {
  window.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleGlobalClick)
})




const props = defineProps(['data', 'id'])
const emit = defineEmits(['addNode', 'click', 'openMenu'])

const handleGlobalClick = (e) => {
  const nodeEl = document.getElementById(`node-${props.id}`)
  if (!nodeEl?.contains(e.target)) {
    updateNodeData(props.id, { toolbarVisible: false })
  }
}

const handleToolbarAction = (action) => {
  selectedAction.value = action
  confirmDialog.value = true
}


function canChangeStatus(current, target) {
    if (current === target) return false
    if (target === 'completed') return ['pending', 'progress'].includes(current)
    if (current === 'pending') return ['cancelled', 'deleted', 'progress'].includes(target) // ✅ 추가
    if (['progress', 'cancelled', 'deleted', 'warning'].includes(current)) return true
    return false
}

const confirmAction = async () => {
  const action = selectedAction.value
  const current = props.data.status?.toLowerCase()
  let target = ''

  const map = {
    '태스크 시작': 'progress',
    '태스크 완료' : 'completed',
    '태스크 중단': 'cancelled',
    '태스크 삭제': 'deleted',
    '복원 요청': 'pending',
    '완전 삭제': 'deleted', // 별도 처리 가능
    '결과 확인': null
  }

  target = map[action]

  if (!target) {
    confirmDialog.value = false
    return
  }

  if (current === target) {
    alert('이미 동일한 상태입니다.')
    confirmDialog.value = false
    return
  }


  if (!canChangeStatus(current, target)) {
    alert(`상태를 '${current}'에서 '${target}'으로 변경할 수 없습니다.`)
    confirmDialog.value = false
    returniconColor
  }

  try {
    await api.patch(`/api/task/${target}/${props.id}`)
    updateNodeData(props.id, { status: target, toolbarVisible: false })
  } catch (e) {
    console.error('상태 변경 실패:', e)
    alert(e.response?.data?.message || '상태 변경에 실패했습니다.')
  }

  confirmDialog.value = false
  selectedAction.value = ''
}


const toggleToolbar = () => {
  updateNodeData(props.id, { toolbarVisible: !props.data.toolbarVisible })
}

const actionMap = {
  pending: ['태스크 시작', '태스크 삭제'],
  progress: ['태스크 완료', '태스크 중단', '태스크 삭제'],
  completed: ['결과 확인', '태스크 삭제'],
  cancelled: ['다시 요청', '태스크 삭제'],
  deleted: ['복원 요청', '완전 삭제'],
  warning: ['태스크 시작', '태스크 삭제'] 
}

const iconMap = {
  pending: 'mdi-play-circle-outline',
  progress: 'mdi-pause-circle-outline',
  completed: 'mdi-check-circle-outline',
  deleted: 'mdi-close-circle-outline',
  cancelled: 'mdi-cancel',
  warning: 'mdi-alert-circle-outline', // ⚠️ 추가
}

const colorMap = {
  pending: '#B2B2B2',
  progress: '#307CFF',
  completed: '#34C759',
  deleted: '#9CA3AF',
  cancelled: '#EF4444',
  warning: '#FFA000' 
}

const backgroundMap = {
  pending: '#FFFFFF',
  progress: '#F0F5FF',
  completed: '#F6FCF7',
  deleted: '#F5F5F5',
  cancelled: '#FFF5F5',
  warning: '#FFF8E1' 
}

const confirmDialog = ref(false)
const selectedAction = ref('') // 어떤 액션 눌렀는지 저장


const delay = props.data?.delayDays ?? 0
const delayText = delay > 0 ? `+${delay}일` : '0일'
const delayColor = delay > 0 ? 'text-red' : 'text-grey'
const progressColor = 'deep-purple-lighten-1'

const status = computed(() => props.data?.status?.toLowerCase() || 'pending')
const icon = computed(() => iconMap[status.value])
const iconColor = computed(() => colorMap[status.value])
const backgroundColor = computed(() => backgroundMap[status.value])
const statusActions = computed(() => actionMap[status.value] || ['작업 없음'])


const cardStyle = computed(() => ({
  backgroundColor: backgroundColor.value,
  border: `1px solid ${iconColor.value}`,
  borderRadius: '5px',
}))
const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#1e293b',
}
</script>

<template>
  <v-dialog v-model="confirmDialog" width="400">
    <v-card>
      <v-card-title class="text-h6">🔔 확인</v-card-title>
      <v-card-text>
        <span>“{{ selectedAction }}” 작업을 진행할까요?</span>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text color="grey" @click="confirmDialog = false">취소</v-btn>
        <v-btn text color="primary" @click="confirmAction">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 툴바 -->
  <NodeToolbar
    :is-visible="data.toolbarVisible"
    :position="Position.Top"
    class="node-toolbar"
    :style="{
      transform: `scale(${zoomLevel})`,
      transformOrigin: 'top left',
    }"
  >
    <v-list elevation="2" density="compact" class="toolbar-list">
      <v-list-item
        v-for="action in statusActions"
        :key="action"
        @click="handleToolbarAction(action)"
      >
        <v-list-item-title>{{ action }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </NodeToolbar>

  <!-- 노드 바디 -->
  <div class="custom-node-horizontal">
    <Handle type="target" :position="Position.Left" :style="handleStyle" />
    <Handle type="source" :position="Position.Right" :style="handleStyle" />

    <v-card flat elevation="0" class="node-card" :style="cardStyle">
      <!-- 헤더 -->
      <div class="node-header">
        <div class="left-header">
          <v-btn
            icon
            variant="plain"
            class="icon-btn"
            :ripple="false"
            @click.stop="toggleToolbar"  
          >
            <v-icon size="28" :color="iconColor">{{ icon }}</v-icon>
          </v-btn>
          <span class="title">{{ data.label || '작업 이름' }}</span>
        </div>
        <v-btn icon size="x-small" variant="text">
          <v-icon>mdi-dots-horizontal</v-icon>
        </v-btn>
      </div>

      <!-- 날짜 -->
      <div class="date-info">
        <div v-if="status === 'pending'">예상 시작일: {{ data.startExpect || '-' }}</div>
        <div v-if="status === 'pending'">예상 마감일: {{ data.endExpect || '-' }}</div>

        <div v-if="status === 'progress'">실제 시작일: {{ data.startReal || '-' }}</div>
        <div v-if="status === 'progress'">예상 마감일: {{ data.endExpect || '-' }}</div>

        <div v-if="status === 'completed'">실제 시작일: {{ data.startReal || '-' }}</div>
        <div v-if="status === 'completed'">실제 종료일: {{ data.endReal || '-' }}</div>

        <div v-if="status === 'warning'">예상 시작일: {{ data.startExpect || '-' }}</div>
        <div v-if="status === 'warning'">예상 마감일: {{ data.endExpect || '-' }}</div>

        <div v-if="status === 'cancelled' || status === 'deleted'">기간 없음</div>
      </div>

      <!-- 진행 정보 -->
      <div class="metrics">
        <div class="metric">
          <div class="label">진척률</div>
          <v-progress-circular
            :model-value="data.progressRate || 0"
            :color="progressColor"
            size="40"
            width="4"
          >
            {{ (data.progressRate || 0) + '%' }}
          </v-progress-circular>
        </div>
        <div class="metric">
          <div class="label">경과율</div>
          <v-progress-circular
            :model-value="data.passedRate || 0"
            :color="progressColor"
            size="40"
            width="4"
          >
            {{ (data.passedRate || 0) + '%' }}
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

.icon-btn {
  padding: 0 !important;
  min-width: 0 !important;
  width: 28px;
  height: 28px;
  margin-right: 6px;
  background-color: transparent !important;
  box-shadow: none !important;
}
.selected-action {
  background-color: #E3F2FD;
  font-weight: bold;
}
.node-toolbar {
  width: 220px;
}
.toolbar-list {
  padding: 0;
  width: 100%;
}


</style>
