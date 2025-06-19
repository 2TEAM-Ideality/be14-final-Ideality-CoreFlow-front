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
  },
  isDirector : {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['start', 'delete', 'report']) // 'complete' 제거 (모달 내부에서 emit할 예정)

const menuOpen = ref(false)
const showCompleteModal = ref(false)



// 프로젝트 상태에 따른 버튼 아이콘
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

/*
  PENDING (시작 전)
  - 프로젝트 시작
  - 프로젝트 삭제
  - 프로젝트 취소 

  PROGRESS (진행 중)
  - 프로젝트 완료
  - 프로젝트 삭제 
  - 프로젝트 취소

  COMPLETED (완료)
  - 분석 리포트 생성
  - 프로젝트 삭제
  - 프로젝트 취소 

  DELETED (삭제)
  - 복구

  CANCELD (취소)
  - 재시작

*/

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
      <!-- PENDING 상태일 때 -->
      <template v-if="status === 'PENDING'">
        <v-list-item @click="emit('start')">
          <v-list-item-title>프로젝트 시작</v-list-item-title>
        </v-list-item>
        <v-list-item @click="showCompleteModal = true">
          <v-list-item-title>프로젝트 완료</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('delete')">
          <v-list-item-title class="text-red">프로젝트 삭제</v-list-item-title>
        </v-list-item>
      </template>

      <!-- PROGRESS 상태일 때 -->
      <template v-else-if="status === 'PROGRESS'">
        <v-list-item @click="showCompleteModal = true">
          <v-list-item-title>프로젝트 완료</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('delete')">
          <v-list-item-title class="text-red">프로젝트 삭제</v-list-item-title>
        </v-list-item>
      </template>

      <!-- COMPLETED 상태일 때 -->
      <template v-else-if="status === 'COMPLETED'">
        <v-list-item @click="emit('report')" :disabled="!isDirector">
          <v-list-item-title>분석 리포트 다운로드</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('delete')">
          <v-list-item-title class="text-red">프로젝트 삭제</v-list-item-title>
        </v-list-item>
      </template>

      <!-- DELETED 상태일 때 -->
      <template v-else-if="status === 'DELETED'">
        <v-list-item @click="emit('restore')">
          <v-list-item-title>프로젝트 복구</v-list-item-title>
        </v-list-item>
      </template>

      <!-- CANCELD 상태일 때 -->
      <template v-else>
        <v-list-item @click="emit('restart')">
          <v-list-item-title>재시작</v-list-item-title>
        </v-list-item>
      </template>
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