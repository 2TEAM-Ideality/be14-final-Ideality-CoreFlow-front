<script setup>
import { Handle, Position } from '@vue-flow/core'
const props = defineProps(['data', 'id'])
const emit = defineEmits(['addNode', 'click'])

const handleAdd = () => emit('addNode', props.id)
const handleSelect = () => emit('click', props.id)
</script>

<template>
  <!-- 노드 전체 클릭 시 'click' 이벤트 발생 -->
  <div class="custom-node" @click.self="handleSelect">
    <Handle type="target" :position="Position.Left" :style="handleStyle" />
    <Handle type="source" :position="Position.Right" :style="handleStyle" />

    <button class="edit-btn" @click.stop="handleSelect">✏️</button>

    <!-- 노드 내용 -->
    <div class="header">{{ data.label || '작업 없음' }}</div>

    <div class="info-row">
      <div>
        <div class="label">소요일</div>
        <div class="value red">{{ data.duration || '-' }}일</div>
      </div>
      <div>
        <div class="label">슬랙 타임</div>
        <div class="value">{{ data.slackTime || '-' }}일</div>
      </div>
    </div>

    <div class="dept-row">
      <div class="label">담당 부서 ({{ data.deptList?.length || 0 }})</div>
      <div class="dept-list">
        {{ data.deptList?.slice(0, 2).map(d => d.deptName || d.name || d).join(', ') }}
        <span v-if="data.deptList?.length > 2">+{{ data.deptList.length - 2 }}</span>
      </div>

    </div>

    <!-- + 버튼 클릭 시 addNode 이벤트만 발생 -->
    <button class="add-btn" @click.stop="handleAdd">+</button>

    

  </div>
</template>

<script>
const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#1e293b',
}
</script>

<style scoped>
.custom-node {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  min-width: 220px;
  font-size: 12px;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
.header {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 10px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.label {
  font-size: 11px;
  color: #374151;
}
.value {
  font-weight: bold;
  font-size: 14px;
}
.value.red {
  color: red;
}
.dept-row {
  font-size: 11px;
}
.dept-list {
  margin-top: 4px;
  font-size: 12px;
  color: #1f2937;
}
.add-btn {
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 18px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* 수정 */
.edit-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: #e5e7eb; /* 회색 */
  color: #374151;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-btn:hover {
  background-color: #cbd5e1;
}


</style>
