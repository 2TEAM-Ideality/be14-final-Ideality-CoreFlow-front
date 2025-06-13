<!-- NodeEditModal.vue -->
<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <h3 class="modal-title">노드 정보 수정</h3>

      <div class="input-group">
        <label for="taskName">태스크명</label>
        <input id="taskName" v-model="localNode.label" placeholder="태스크명" />
      </div>

      <div class="input-group">
        <label for="description">설명</label>
        <input id="description" v-model="localNode.description" placeholder="설명" />
      </div>

      <div class="input-group">
        <label for="duration">총 소요일 (일)</label>
        <input id="duration" v-model.number="localNode.duration" type="number" placeholder="숫자" />
      </div>

      <div class="input-group">
        <label for="slackTime">슬랙 타임 (일)</label>
        <input id="slackTime" v-model.number="localNode.slackTime" type="number" placeholder="숫자" />
      </div>

      <div class="input-group">
        <label for="deptList">담당 부서</label>
        <input id="deptList" v-model="localNode.deptListString" placeholder="쉼표로 구분된 부서 이름들" />
      </div>

      <div class="modal-actions">
        <button @click="onSave">저장</button>
        <button @click="$emit('close')">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  nodeData: Object
})

const emit = defineEmits(['save', 'close'])

const localNode = reactive({
  id: '',
  label: '',
  description: '',
  duration: 0,
  slackTime: 0,
  deptListString: ''
})

// nodeData 변경 시 localNode 초기화
watch(
  () => props.nodeData,
  (newVal) => {
    if (newVal && newVal.data) {
      localNode.id = newVal.id
      localNode.label = newVal.data.label || ''
      localNode.description = newVal.data.description || ''
      localNode.duration = newVal.data.duration || 0
      localNode.slackTime = newVal.data.slackTime || 0
      localNode.deptListString = newVal.data.deptListString || ''
    }
  },
  { immediate: true }
)

function onSave() {
  emit('save', {
    id: localNode.id,
    data: {
      label: localNode.label,
      description: localNode.description,
      duration: localNode.duration,
      slackTime: localNode.slackTime,
      deptListString: localNode.deptListString
    }
  })
}

</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  padding: 30px 60px;
  border-radius: 8px;
  width: 500px;
}
.modal input {
  margin-bottom: 10px;
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
}
.input-group {
  margin-bottom: 12px;
}
.input-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
  text-align: left;
}
</style>
