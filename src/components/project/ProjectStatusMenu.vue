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
      <v-list-item
        v-if="status === 'PENDING'"
        @click="emit('start')"
      >
        <v-list-item-title>프로젝트 시작</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="status === 'PROGRESS'"
        @click="emit('complete')"
      >
        <v-list-item-title>프로젝트 완료</v-list-item-title>
      </v-list-item>

      <v-list-item
        v-if="status !== 'DELETED' && status !== 'CANCELLED'"
        @click="emit('delete')"
      >
        <v-list-item-title class="text-red">프로젝트 삭제</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['start', 'complete', 'delete'])

const menuOpen = ref(false)

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

<style scoped>
.text-red {
  color: #E53935;
  font-weight: 500;
}
</style>
