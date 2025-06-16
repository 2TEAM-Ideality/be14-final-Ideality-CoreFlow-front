<script setup>
import { watch, computed, reactive } from 'vue'

const props = defineProps({
  show: Boolean,
  deptList: Array,
  initialData: Object,
  existingNodes: Array
})
const emit = defineEmits(['close', 'create', 'update:show', 'update'])

const dialogVisible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

// ✅ reactive 사용
const localNode = reactive({
  id: '',
  label: '',
  description: '',
  startBase: '',
  endBase: '',
  deptList: [],
  parentIds: []
})

watch(
  () => props.initialData,
  (val) => {
    if (val && val.data) {
      localNode.id = val.id || ''
      localNode.label = val.data.label || ''
      localNode.description = val.data.description || ''
      localNode.startBase = val.data.startBase || ''
      localNode.endBase = val.data.endBase || ''
      localNode.deptList = val.data.deptList || []
      localNode.parentIds = [] // 필요시 계산
    }
  },
  { immediate: true }
)

</script>

<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <div class="input-group">
        <label>태스크명</label>
        <input v-model="localNode.label" placeholder="태스크명" />
      </div>
      <div class="input-group">
        <label>설명</label>
        <input v-model="localNode.description" placeholder="설명" />
      </div>
      <div class="input-group">
        <label>시작 베이스라인</label>
        <input v-model="localNode.startBase" type="date" />
      </div>
      <div class="input-group">
        <label>마감 베이스라인</label>
        <input v-model="localNode.endBase" type="date" />
      </div>
      <div class="input-group">
        <label>담당 부서</label>
        <v-select
          v-model="localNode.deptList"
          :items="props.deptList"
          item-title="deptName"
          item-value="deptId"
          multiple
          chips
        />
      </div>
      <div class="input-group">
        <label>선행 태스크</label>
        <v-select
            v-model="localNode.parentIds"
            :items="props.existingNodes"
            item-title="data.label"
            item-value="id"
            multiple
            chips
            placeholder="선행 태스크 선택"
        />
        </div>

      <!-- 생성 vs 수정 구분 -->
    <button @click="$emit('close')">취소</button>
    <template v-if="props.initialData">
    <button @click="() => {
    console.log('📦 수정할 localNode 데이터:', localNode)
    $emit('update', localNode)
    }">수정</button>
    </template>
    <template v-else>
        <button @click="$emit('create')">생성</button>
    </template>
    </div>
  </div>
</template>



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
  z-index: 1000;
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
  font-size: 24px;
  margin-bottom: 20px;
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