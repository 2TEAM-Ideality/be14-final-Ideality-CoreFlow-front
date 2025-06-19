<script setup>
import { computed, ref } from 'vue'
import CompleteProjectModal from '@/components/project/CompleteProjectModal.vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  projectInfo : {
    type: Object, 
    required: true
  },
  allTaskList : {
    type: Array,
    required: true
  },
  completedTaskList: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['start', 'delete', 'report']) // 'complete' 제거 (모달 내부에서 emit할 예정)

const menuOpen = ref(false)
const showCompleteModal = ref(false)

const statusIcon = computed(() => {
  switch (props.status) {
    case 'PENDING': return { icon: 'mdi-play-circle', color: '#1976D2' }
    case 'PROGRESS': return { icon: 'loading', color: '#1976D2' }
    case 'COMPLETED': return { icon: 'mdi-check-circle', color: '#43A047' }
    case 'DELETED': return { icon: 'mdi-delete', color: '#424242' }
    case 'CANCELLED': return { icon: 'mdi-close-circle', color: '#E53935' }
    default: return { icon: 'mdi-help-circle', color: '#9E9E9E' }
  }
})



</script>

<template>
  <v-menu v-model="menuOpen" offset-y>
    <template #activator="{ props }">
      <v-btn icon v-bind="props" size="big" variant="text">
        <template v-if="statusIcon.icon === 'loading'">
          <v-progress-circular indeterminate size="24" width="3" color="primary" />
        </template>
        <template v-else>
          <v-icon :style="{ color: statusIcon.color }">{{ statusIcon.icon }}</v-icon>
        </template>
      </v-btn>
    </template>

    <v-list dense>
      <v-list-item v-if="status === 'PENDING'" @click="emit('start')">
        <v-list-item-title>프로젝트 시작</v-list-item-title>
      </v-list-item>

      <v-list-item v-if="status === 'PROGRESS' || 'PENDING'" @click="showCompleteModal = true">
        <v-list-item-title>프로젝트 완료</v-list-item-title>
      </v-list-item>
      
      <v-list-item v-if="status === 'COMPLETED'" @click="emit('report')">
        <v-list-item-title>분석 리포트 다운로드</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="status !== 'DELETED' && status !== 'CANCELLED'"
        @click="emit('delete')"
      >
        <v-list-item-title class="text-red">프로젝트 삭제</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>

  <!-- ✅ 프로젝트 완료 모달 -->
  <CompleteProjectModal
    v-model:show="showCompleteModal"
    :projectInfo="props.projectInfo"
    :allTaskList="props.allTaskList"
    :completedTaskList="props.completedTaskList"
    @complete="() => {
      showCompleteModal = false
      emit('complete')
    }"
    @close="showCompleteModal = false"
  />
</template>

<style scoped>
.text-red {
  color: #E53935;
  font-weight: 500;
}
</style>