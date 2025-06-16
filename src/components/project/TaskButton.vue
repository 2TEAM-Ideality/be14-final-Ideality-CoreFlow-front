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
        <v-list-item v-for="action in actions" :key="action" @click="handleSelect(action)">
          <v-list-item-title>{{ action }}</v-list-item-title>
        </v-list-item>
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
                <v-btn color="primary" @click="confirmStart">시작</v-btn>
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
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  status: String,
  id: String
})
const emit = defineEmits(['menuAction'])

const menu = ref(false)
const showDialog = ref(false)
const selectedAction = ref(null)

const form = reactive({
  label: '',
  description: ''
})

const iconMap = {
  pending: 'mdi-pause-circle-outline',
  progress: 'mdi-play-circle-outline',
  completed: 'mdi-check-circle-outline',
  deleted: 'mdi-close-circle-outline',
  cancelled: 'mdi-cancel'
}

const iconColorMap = {
  pending: '#B2B2B2',
  progress: '#307CFF',
  completed: '#34C759',
  deleted: '#9CA3AF',
  cancelled: '#EF4444'
}

const icon = computed(() => iconMap[props.status] || 'mdi-help-circle-outline')
const iconColor = computed(() => iconColorMap[props.status] || '#ccc')

const actions = computed(() => {
  switch (props.status) {
    case 'pending':
      return ['태스크 시작', '삭제']
    case 'progress':
      return ['태스크 중단', '삭제']
    case 'completed':
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

function onStopTask() {
  showDialog.value = true
  emit('menuAction', { id: props.id, action: '태스크 중단' })
}

function confirmStart() {
  showDialog.value = false
  emit('menuAction', { id: props.id, action: '태스크 시작 확정' })
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
