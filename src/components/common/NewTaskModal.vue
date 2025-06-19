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
  parentIds: [],
  childIds: [] 
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
      localNode.parentIds = val.data.parentIds || []
      localNode.childIds = val.data.childIds || []
    }
  },
  { immediate: true }
)

watch(() => props.show, (val) => {
  // 모달이 닫힐 때 (false로 변경될 때)
  if (!val) {
    localNode.id = ''
    localNode.label = ''
    localNode.description = ''
    localNode.startBase = ''
    localNode.endBase = ''
    localNode.deptList = []
    localNode.parentIds = []
    localNode.childIds = []
  }
})


// 선행 태스크 목록
const filteredParentOptions = computed(() => {
  if (!localNode.startBase) return props.existingNodes

  const startDate = new Date(localNode.startBase)

  return props.existingNodes.filter(node => {
    const endBase = node.data?.endBase
    if (!endBase) return false
    return new Date(endBase) < startDate
  })
})

// 후행 태스크 목록
const filteredChildOptions = computed(() => {
  if (!localNode.endBase) return []

  const endDate = new Date(localNode.endBase)

  return props.existingNodes.filter(node => {
    if (!node.data?.startBase) return false
    return new Date(node.data.startBase) > endDate
  })
})





// 총 소요일 계산 메서드
const totalDuration = computed(() => {
  if (!localNode.startBase || !localNode.endBase) return null;

  const start = new Date(localNode.startBase);
  const end = new Date(localNode.endBase);

  if (end < start) return 'invalid';

  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return diff > 0 ? diff : null;
});

// 태스크 생성 유효성 검사
const handleCreate = () => {
  if (!localNode.label || !localNode.label.trim()) {
    alert('태스크명을 입력해주세요.')
    return
  }
  if (!localNode.startBase || !localNode.endBase) {
    alert('시작일과 마감일을 모두 입력해주세요.')
    return
  }
  if (totalDuration.value === 'invalid') {
    alert('종료일은 시작일보다 빠를 수 없습니다.')
    return
  }
  console.log(localNode.id, localNode)
  emit('create', localNode)
}


const getNodeLabel = (item) => {
  const id = item?.value
  const found = props.existingNodes.find(n => String(n.id) === String(id))
  return found?.data?.label || `ID: ${id}`
}
</script>

<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <h3 >📌 태스크 생성</h3>
      <div class="divider"></div>

      <div class="input-group">
        <label>태스크명</label>
        <input v-model="localNode.label" placeholder="태스크명" />
      </div>
      <div class="input-group">
        <label>설명</label>
        <input v-model="localNode.description" placeholder="설명" />
      </div>
      <!-- 날짜 입력 + 총 소요일 표시를 한 덩어리로 감싸기 -->
      <div style="display: flex; flex-direction: column; width: 100%;">
        <div style="display: flex; flex-direction: row; justify-content: space-between; gap: 10px;">
          <div class="input-group" style="width: 100%;">
            <label>시작 베이스라인</label>
            <input v-model="localNode.startBase" type="date" />
          </div>
          <div class="input-group" style="width: 100%;">
            <label>마감 베이스라인</label>
            <input v-model="localNode.endBase" type="date" />
          </div>
        </div>

        <!-- ✅ 총 소요일: 우측 정렬 -->
        <div
          v-if="totalDuration"
          style="align-self: flex-end; font-size: 12px; margin-top: -10px;"
          :style="{ color: totalDuration === 'invalid' ? '#FF4545' : '#666' }"
        >
          <template v-if="totalDuration === 'invalid'">
            종료일은 시작일보다 이후여야 합니다
          </template>
          <template v-else>
            총 소요일: {{ totalDuration }}일
          </template>
        </div>
      </div>
      
      
      <div class="input-group">
        <label>담당 부서</label>
        <v-select
          v-model="localNode.deptList"
          :items="props.deptList"
          item-title="deptName"
          item-value="deptId"
          multiple
          density="compact"
          chips
        />
      </div>
      <div style="display:flex; flex-direction: row; justify-content: space-between; gap: 10px;">
        <div class="input-group" style="width: 100%;">
        <label>선행 태스크</label>
        <v-select
          v-model="localNode.parentIds"
          :items="filteredParentOptions"
          :disabled="!localNode.startBase"
          item-title="data.label"
          item-value="id"
          multiple
          density="compact"
          :attach="false" 
          placeholder="선행 태스크 선택 (시작일 먼저 선택)"
        >
          <template v-slot:selection="{item, index}">
            {{  console.log('🎯 item:', item)  }}
            <v-chip v-if="index < 1">{{ getNodeLabel(item) }}</v-chip>
            <span
            v-if="index === 1"
            class="text-grey text-caption align-self-center" >
          +{{ localNode.parentIds.length - 1 }}
          </span>
          </template>
        </v-select>
        </div>
        <div class="input-group" style="width: 100%;">
          <label>후행 태스크</label>
          <v-select
            v-model="localNode.childIds"
            :items="filteredChildOptions"
            :disabled="!localNode.endBase"
            item-title="data.label"
            item-value="id"
            density="compact"
            multiple
            :attach="false"
            placeholder="후행 태스크 선택 (마감일 먼저 선택)"
          >
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index < 1">{{ getNodeLabel(item) }}</v-chip>
              <span
                v-if="index === 1"
                class="text-grey text-caption align-self-center"
              >
                +{{ localNode.childIds.length - 1 }}
              </span>
            </template>
          </v-select>
        </div>
      </div>
      

      <!-- 생성 vs 수정 구분 -->
      <div class="button-section">
        <button @click="$emit('close')" class="basic-button">취소</button>
        
        <template v-if="props.initialData && props.initialData.id">
          <button @click="() => {
            $emit('update', localNode)
          $emit('close')
            }" class="color-button">수정</button>
        </template>
        <template v-else>
          <button
            class="color-button"
            @click="handleCreate"
          >생성</button>
        </template>
      </div>
    </div>
  </div>
</template>



<style scoped>
.divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 15px 0;
  border: none;
}
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
.v-select .v-field__input {
  height: 30px;
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
.button-section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.basic-button {
  color: #757575;
  border-radius: 5px;
  border: solid 1px #D9D9D9;
  font-weight: 600;
  font-size: 12px;
  height: 36px;
  padding: 0 14px;
  line-height: 1.6;
  z-index: 10;
  background-color: white;
  width: 100px;
}
.color-button {
  background-color: #25BEAD;
  color: white;
  font-weight: 600;
  font-size: 12px;
  height: 36px;
  padding: 0 14px;
  line-height: 1.6;
  border-radius: 5px;
  width: 100px;
}

</style>