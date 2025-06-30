<template>
  <div>
    <!-- 상태 버튼 + 메뉴 -->
    <v-menu
        v-model="menu"
        :attach="true"
        location="top"
        location-strategy="connected"
        scroll-strategy="reposition"
        attach="body"
    >
        <template #activator="{ props: menuActivator }">
            <v-btn
            icon
            variant="plain"
            class="icon-btn"
            ripple="false"
            v-bind="menuActivator"
            @click.stop
            >
            <v-icon size="35" :color="iconColor">{{ icon }}</v-icon>
            </v-btn>
        </template>

      <v-list>
        <div v-for="action in actions" :key="action">
          <v-tooltip v-if="isDisabled(action)" activator="parent" location="right">
            진척률이 100%일 때만 완료할 수 있습니다.
          </v-tooltip>

          <v-list-item
            @click="!isDisabled(action) && handleSelect(action)"
            :disabled="isDisabled(action)"
          >
            <v-list-item-title>{{ action }}</v-list-item-title>
          </v-list-item>
        </div>
      </v-list>
    </v-menu>

    <!-- 상태별 모달 -->
    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ status }} 상태 - {{ selectedAction }}
        </v-card-title>

        <v-card-text>
            <div v-if="selectedAction === '태스크 시작'">
                <p>이 태스크를 시작하시겠습니까?</p>
                <v-btn color="#7578ee" @click="confirmStart">시작</v-btn>
            </div>
             <div v-else-if="selectedAction === '태스크 완료'">
                <p>진행 중인 태스크를 중단하시겠습니까?</p>
                <v-btn color="#7578ee" @click="confirmComplete">완료</v-btn>
            </div>
            <div v-else-if="selectedAction === '태스크 중단'">
                <p>진행 중인 태스크를 중단하시겠습니까?</p>
                <v-btn color="warning" @click="confirmStop">중단</v-btn>
            </div>

            <div v-else-if="selectedAction === '삭제'">
                <p>이 태스크를 삭제하시겠습니까?</p>
                <v-btn color="red" @click="confirmDelete">삭제 확정</v-btn>
            </div>

            <div v-else-if="selectedAction === '상세 보기'">
                <p><strong>상태:</strong> {{ status }}</p>
                <p>태스크의 자세한 정보를 여기에 표시합니다.</p>
            </div>

            <div v-else>
                <p>모달 내용이 준비되지 않았습니다.</p>
            </div>
        </v-card-text>


        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <CompleteTaskModal 
      v-if="showCompleteModal"
      :show="showCompleteModal"
      :taskInfo="props.task"
      :allTaskList="[]" 
      :dataType="'task'"
      :completedTaskList="[]"
      @close="showCompleteModal = false"
      @complete="handleComplete"
    />
  </div>
</template>

<script setup>
import CompleteTaskModal from '@/components/task/CompleteTaskModal.vue'
import { ref, computed, reactive, onMounted } from 'vue'

const props = defineProps({
  status: String,
  id: String,
  task: Object,
  detailList: Array
})

const emit = defineEmits(['menuAction'])

const menu = ref(false)
const showDialog = ref(false)
const selectedAction = ref(null)
const showCompleteModal = ref(false)  // 태스크 완료 모달 


const form = reactive({
  label: '',
  description: ''
})

const iconMap = {
  PENDING: 'mdi-play-circle-outline',
  PROGRESS: 'mdi-pause-circle-outline',
  COMPLETED: 'mdi-check-circle-outline',
  DELETED: 'mdi-close-circle-outline',
  WARNING: 'mdi-alert-circle-outline', // 경고 아이콘도 추가
  CANCELED: 'mdi-cancel'
}

const iconColorMap = {
  PENDING: '#B2B2B2',
  PROGRESS: '#307CFF',
  COMPLETED: '#34C759',
  WARNING: '#FFA000', // 주황색 계열 추가
  DELETED: '#9CA3AF',
  CANCELED: '#EF4444'
}


function isDisabled(action) {
  return action === '태스크 완료' && props.task?.progressRate !== 100
}

const icon = computed(() => iconMap[props.status] || 'mdi-help-circle-outline')
const iconColor = computed(() => iconColorMap[props.status] || '#ccc')

const actions = computed(() => {
  switch (props.status) {
    case 'PENDING':
      return ['태스크 시작', '삭제']
    case 'PROGRESS':
      return ['태스크 중단', '태스크 완료', '삭제']
    case 'COMPLETED':
      return ['상세 보기']
    case 'WARNING':
      return ['상세 보기']
    default:
      return ['상세 보기']
  }
})


function handleSelect(action) {
  selectedAction.value = action
  menu.value = false

  switch (action) {
    case '태스크 시작':
      onStartTask()
      break
    case '태스크 완료':
      onCompleteTask()
      break
    case '태스크 중단':
      onStopTask()
      break
    case '삭제':
      onDelete()
      break
    case '상세 보기':
      onViewDetail()
      break
    default:
      console.warn(`정의되지 않은 액션: ${action}`)
      break
  }
}


function onStartTask() {
  showDialog.value = true
  emit('menuAction', { id: props.id, action: '태스크 시작' })
}
//  태스크 완료 처리 
// function onCompleteTask() {
//   showDialog.value = true
//   emit('menuAction', { id: props.id, action: '태스크 완료' })
// }

function handleComplete() {
  showCompleteModal.value = false
  emit('menuAction', { id: props.id, action: '태스크 완료 확정' })
}

function onCompleteTask() {
  showCompleteModal.value = true
  emit('menuAction', { id: props.id, action: '태스크 완료' })
}


function onStopTask() {
  showDialog.value = true
  emit('menuAction', { id: props.id, action: '태스크 중단' })
}


// 
function confirmStart() {
  showDialog.value = false
  emit('menuAction', { id: props.id, action: '태스크 시작 확정' })
}

function confirmComplete() {
  showDialog.value = false
  emit('menuAction', { id: props.id, action: '태스크 완료 확정' })
}

function confirmStop() {
  showDialog.value = false
  emit('menuAction', { id: props.id, action: '태스크 중단 확정' })
}


function onViewDetail() {
  showDialog.value = true
  emit('menuAction', { id: props.id, action: '상세 보기' })
}

function onDelete() {
  showDialog.value = true
  emit('menuAction', { id: props.id, action: '삭제' })
}

function confirmDelete() {
  showDialog.value = false
  emit('menuAction', { id: props.id, action: '삭제 확정' })
}


onMounted(() => {
  console.log(props.taskList)
  console.log(props.detailList)
})
</script>

<style scoped>
.icon-btn {
  padding: 0 !important;
  min-width: 0 !important;
  width: 35px;
  height: 35px;
  margin-right: 6px;
  background-color: transparent !important;
  box-shadow: none !important;
}
.v-menu__content,
.v-overlay-container {
  z-index: 9999 !important;
}
</style>
