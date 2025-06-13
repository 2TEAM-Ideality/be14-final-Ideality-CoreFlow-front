<!-- NodeEditModal.vue -->
<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <h3 class="modal-title">노드 정보 수정</h3>

      <div class="input-group">
        <label for="taskName">태스크명</label>
        <input id="taskName" v-model="nodeData.label" placeholder="태스크명" />
      </div>

      <div class="input-group">
        <label for="description">설명</label>
        <input id="description" v-model="nodeData.description" placeholder="설명" />
      </div>

      <div class="input-group">
        <label for="duration">총 소요일 (일)</label>
        <input id="duration" v-model.number="nodeData.duration" type="number" placeholder="숫자" />
      </div>

      <div class="input-group">
        <label for="slackTime">슬랙 타임 (일)</label>
        <input id="slackTime" v-model.number="nodeData.slackTime" type="number" placeholder="숫자" />
      </div>

      <div class="input-group">
        <label for="deptList">담당 부서</label>
        <input id="deptList" v-model="nodeData.deptListString" placeholder="쉼표로 구분된 부서 이름들" />
      </div>

      <div class="modal-actions">
        <button @click="onSave">저장</button>
        <button @click="$emit('close')">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  nodeData: Object
})
const emit = defineEmits(['save', 'close'])

function onSave() {
  emit('save', { ...props.nodeData })
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
