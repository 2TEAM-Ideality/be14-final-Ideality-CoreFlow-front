<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api' 
import CompleteTaskModal from '@/components/task/CompleteTaskModal.vue'

const props = defineProps({
  id : {
    type: [String, Number],
    required: true
  },
  data : {
    type: Object,
    required : true
  },
  showFullscreenView : Boolean
})

const emit = defineEmits([
  'addNode',
  'click',
  'openMenu',
  'edit',
  'delete',
  'start'
])

const { viewport } = useVueFlow()
const zoomLevel = computed(() => viewport.value.zoom)
const { updateNodeData } = useVueFlow()

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const showCompleteModal = ref(false)    // 완료 처리 모달

const confirmDialog = ref(false)
const confirmDeleteDialog = ref(false)  // 삭제 확인 창


const selectedAction = ref('') // 어떤 액션 눌렀는지 저장

// 지연 위험 태스크 여부 
const isWarningActive = computed(() => props.data.warning === true)     
// 배경색도 warning일 때 강제 적용

// 지연이 1일 이상인 경우 (지연된 태스크 여부)
const isDelayedActive = computed(() => 
status.value !== 'completed' && (props.data.delayDays ?? 0) >= 1
)

const delay = props.data?.delayDays ?? 0
const delayText = delay > 0 ? `+${delay}일` : '0일'
const delayColor = delay > 0 ? 'text-red' : 'text-grey'
const progressColor = 'deep-purple-lighten-1'

const status = computed(() => props.data?.status?.toLowerCase() || 'pending')


// 아이콘 & 색상 관련
const icon = computed(() =>
  isWarningActive.value ? iconMap.warning : iconMap[status.value]
)
const iconColor = computed(() => {
  if (isWarningActive.value)      return colorMap.warning
  if (status.value === 'completed') return colorMap.completed
  if (isDelayedActive.value)      return colorMap.delayed
  return colorMap[status.value]
})

const backgroundColor = computed(() => {
  if (isWarningActive.value) return backgroundMap.warning
  if (isDelayedActive.value)  return backgroundMap.delayed
  return backgroundMap[status.value]
})


const statusActions = computed(() => actionMap[status.value] || ['작업 없음'])

const menuVisible = ref(false)


onMounted(() => {
  window.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleGlobalClick)
})


const handleGlobalClick = (e) => {
  const nodeEl = document.getElementById(`node-${props.id}`)
  if (!nodeEl?.contains(e.target)) {
    updateNodeData(props.id, { toolbarVisible: false })
  }
}

const handleToolbarAction = (action) => {
  if (action === '태스크 완료' || action === '결과 확인') {
    // 진척률 100% 검사
    // if ((props.data.progressRate ?? 0) < 100) {
    //   alert('진척률이 100%여야 완료할 수 있습니다.')
    //   return
    // }

    showCompleteModal.value = true
    return
  }

  selectedAction.value = action
  confirmDialog.value = true
}

// 완료 모달에서 emit되는 데이터 받기
const handleComplete = async (completedInfo) => {
  try {
    console.log('완료', completedInfo)
    await api.patch(`/api/task/complete/${props.id}`)
    updateNodeData(props.id, { status: 'completed', toolbarVisible: false })
    showCompleteModal.value = false
  } catch (e) {
    alert(e.response?.data?.message || '태스크 완료 처리 중 오류 발생')
  }
}

// 삭제 확인
const handleDelete = () => {
  emit('delete', props.id)
  confirmDeleteDialog.value = false
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
    // '완전 삭제': 'deleted', // 별도 처리 가능
    '결과 확인': 'completed'
  }

  if (action === '완전 삭제') {
    try {
      // ❌ 여기서 직접 delete API 호출 안 함
      emit('delete', props.data)  // 그냥 부모에게 요청
      alert('태스크가 완전히 삭제 되었습니다.')
    } catch (e) {
      alert(e.response?.data?.message || '완전 삭제 중 오류 발생')
    }

    confirmDialog.value = false
    selectedAction.value = ''
    return
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
   // ✅ 추가: 완료는 진척률 100%일 때만 가능
  if (target === 'completed' && (props.data.progressRate ?? 0) < 100) {
    alert('진척률이 100%여야 완료할 수 있습니다.')
    confirmDialog.value = false
    return
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

// 태스크 상세 페이지로 이동 
const goToTask = () => {
  router.push(`/task/${props.id}`)
}

const toggleToolbar = () => {
  updateNodeData(props.id, { toolbarVisible: !props.data.toolbarVisible })
}
// 지연 위험→결재 요청 페이지로 이동 (taskId 전달)
const goCreateApproval = () => {
  router.push({
    path: '/approval/create',
    query: { taskId: props.id, type: 'delay' },
    
  })
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
  warning: '#FFA000' ,
  delayed:   '#EF4444'    
}

const backgroundMap = {
  pending: '#FFFFFF',
  progress: '#F0F5FF',
  completed: '#F6FCF7',
  deleted: '#F5F5F5',
  cancelled: '#FFF5F5',
  warning: '#FFF8E1' ,
  delayed:   '#FFF5F5'
}



const cardStyle = computed(() => ({
  backgroundColor: isWarningActive.value ? '#FFF8E1' : backgroundColor.value,
  border: `1px solid ${iconColor.value}`,
  borderRadius: '5px',
}))

const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#1e293b',
}


// onMounted(() => {
//   console.log(props.data)
// })


</script>

<template>
  <!-- 태스크 완료 처리 모달 -->
  <CompleteTaskModal 
    v-if="showCompleteModal"
    :show="showCompleteModal"
    :taskInfo="props.data"
    :taskId="props.id"
    :allTaskList="[]" 
    :dataType="'pipe'"
    :completedTaskList="[]"
    @close="showCompleteModal = false"
    @complete="handleComplete"
  />
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
  <!-- 태스크 삭제 확인 모달창 -->
  <v-dialog v-model="confirmDeleteDialog" width="400">
    <v-card>
      <v-card-title class="text-h6">🗑️ 삭제 확인</v-card-title>
      <v-card-text>정말로 이 태스크를 삭제하시겠습니까?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text color="grey" @click="confirmDeleteDialog = false">취소</v-btn>
        <v-btn text color="red" @click="handleDelete">삭제</v-btn>
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
        :disabled="action === '태스크 완료' && (data.progressRate ?? 0) < 100"
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

    <div flat elevation="0" class="node-card" :style="cardStyle">
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
          
        <!-- DOT more 버튼 메뉴 (툴팁처럼 보이는 스타일) -->
        <v-btn
        v-if=" showFullscreenView === true"
        size="small"
        variant="text"
        icon
        @click.stop="emit('edit', props.id)"
        ><v-icon style="color: gray;">mdi-pencil</v-icon>
        </v-btn>
        <v-btn
        v-if="showFullscreenView === false"
          @click.stop="goToTask"
          icon
          size="small"
          variant="text"
          @mousedown.stop
          @mouseup.stop
          style="z-index: 10;"
        >
          <v-icon style="color: gray;">mdi-open-in-new</v-icon>
        </v-btn>
      </div>


      <div style="display: flex; flex-direction: column; padding: 10px;">
        <!-- 날짜 -->
        <div class="date-info">
          <div v-if="status === 'null'">예상 시작일: {{ data.startExpect || '-' }}</div>
          <div v-if="status === 'null'">예상 마감일: {{ data.endExpect || '-' }}</div>

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


        <!-- <div class="dept-info">
        📁 {{ data.deptList.join(', ')  || '참여 부서 정보 없음'}}
        </div> -->

        <div class="dept-info">
          <template v-if="data.deptList?.length">
            <span style="margin-right: 6px;">📁</span>
            <v-chip
              v-for="(dept, index) in data.deptList"
              :key="index"
              size="small"
              class="ma-1"
              color="indigo lighten-5"
              text-color="indigo darken-2"
              variant="tonal"
              style="font-size: 11px;"
            >
              {{ dept }}
            </v-chip>
          </template>
          <template v-else>
            📁 참여 부서 정보 없음
          </template>
        </div>
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
          <span style="font-size: 12px; font-weight: bold;">
            {{ (data.progressRate || 0) + '%' }}
          </span>
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
          <span style="font-size: 12px; font-weight: bold">
            {{ (data.passedRate || 0) + '%' }}
          </span>
          </v-progress-circular>
        </div>
        <div class="metric">
          <div class="label">지연일</div>
          <div :class="['delay-text', delayColor]" style="margin-bottom: 15px; font-size: 25px;">{{ delayText }}</div>
        </div>
      </div>
            <!-- ⚠️ 지연 위험 표시 -->
          <div v-if="isWarningActive"  >
            <v-btn @click="goCreateApproval" class="warning-banner" style="width:100%;">⚠️ 지연 사유서 작성</v-btn>
          </div>
      <v-btn
        v-if="showFullscreenView"
        icon
        size="small"
        class="add-btn"
        @click.stop="emit('addNode', props.id)"
      >
        <v-icon size="20" color="white">mdi-plus</v-icon>
      </v-btn>
      
    </div>

    
    
  </div>

  

</template>




<style scoped>
.custom-node-horizontal {
  position: relative;
}
.node-card {
  padding: 16px 16px 10px 16px;
  width: 300px;
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
  display: flex;
  /* flex-direction: column; */
  flex-direction: row;
  gap:12px;
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
  font-size: 12px;
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
  background: #fff;
  border-radius: 6px;
  border: 1px solid #ccc;
  padding: 6px;
}
.toolbar-list {
  border: none;
  font-size: 13px !important;
  text-align: left;
  padding: 4px 6px;
  cursor: pointer;
  color: #333;
}
.add-btn {
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #7578ee !important;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 18px;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.dot-menu {
  width :150px;
}
.tooltip-actions {
  display: flex;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 15px;
  background-color: rgb(56, 56, 56);
  color: white;
}

.warning-banner {
  background-color: #fff3cd;
  color: #b86a00;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
  margin-bottom: 10px;
  text-align: center;
}
.dept-info {
  display: flex;
  flex-direction: row;
  /* justify-content: left; */
  font-size: 12px;
  color: gray;
  align-items: center;
  margin-bottom: 12px;

}
</style>
