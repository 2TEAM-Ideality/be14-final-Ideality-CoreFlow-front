<script setup>
import { watch, computed, reactive, onMounted, toRaw } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import api from '@/api'
import { useHolidayStore } from '@/stores/holidayStore'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(isSameOrBefore)


const holidayStore = useHolidayStore()

const props = defineProps({
  show: Boolean,
  projectId: Number,
  deptList: Array,
  initialData: Object,
  existingNodes: Array,
  projectStatus: String
})
const emit = defineEmits(['close', 'create', 'update:show', 'update'])

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

onMounted(() => {
  console.log(localNode.deptList)
  console.log("부서 목록 확인", props.deptList)
  if (holidayStore.holidaySet.size === 0) {
    holidayStore.fetchHolidays()
  }
})

watch(
  () => props.initialData,
  (val) => {
    console.log(props.initialData)

    if (val && val.data) {
      localNode.id = val.id || ''
      localNode.label = val.data.label || ''
      localNode.description = val.data.description || ''
      localNode.startBase = dayjs(val.data.startBase).format('YYYY-MM-DD') || ''
      localNode.endBase = dayjs(val.data.endBase).format('YYYY-MM-DD') || ''

      localNode.deptList = val.data.deptList
      localNode.parentIds = val.data.parentIds || []
      localNode.childIds = val.data.childIds || []

      console.log('✅수정할 노드', localNode)
    }
  },
  { immediate: true, deep: true }
)

watch(() => props.show, (val) => {
  console.log("체크", props.initialData)
  if (val) {
    // ✅ 모달 열릴 때
    if (!props.initialData || !props.initialData.id) {
      // 생성 모드일 경우 초기화
      localNode.id = ''
      localNode.label = ''
      localNode.description = ''
      localNode.startBase = ''
      localNode.endBase = ''
      localNode.deptList = []
      localNode.parentIds = []
      localNode.childIds = []
    }
  } else {
    // ✅ 모달 닫힐 때에도 초기화해줌 (예방적)
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

watch(() => localNode.startBase, (val) => {
  if (val instanceof Date || typeof val === 'string') {
    localNode.startBase = dayjs(val).format('YYYY-MM-DD')
  }
})

watch(() => localNode.endBase, (val) => {
  if (val instanceof Date || typeof val === 'string') {
    localNode.endBase = dayjs(val).format('YYYY-MM-DD')
  }
})

// 선행 태스크 목록
const filteredParentOptions = computed(() => {
  const startDate = new Date(localNode.startBase)
  return props.existingNodes.filter(node => {
    const isSelf = String(node.id) === String(localNode.id) // 자기 자신 제외
    return !isSelf
  })
})

// 후행 태스크 목록
const filteredChildOptions = computed(() => {
  return props.existingNodes.filter(node => {
    const isSelf = String(node.id) === String(localNode.id) // 자기 자신 제외
    return !isSelf
  })
})


// 시작일 변경 시 휴일 검사
const handleStartDateChange = (e) => {
  const date = e.target.value
  if (holidayStore.isHoliday(date)) {
    alert('시작일로 주말이나 공휴일은 선택할 수 없습니다.')
    localNode.startBase = ''
  } else {
    localNode.startBase = dayjs(date).format('YYYY-MM-DD')
  }
}

// 마감일 변경 시 휴일 검사
const handleEndDateChange = (e) => {
  const date = e.target.value
  if (holidayStore.isHoliday(date)) {
    alert('마감일로 주말이나 공휴일은 선택할 수 없습니다.')
    localNode.endBase = ''
  } else {
    localNode.endBase = dayjs(date).format('YYYY-MM-DD')
  }
}

// 총 소요일 계산 메서드
const totalDuration = computed(() => {
  if (!localNode.startBase || !localNode.endBase) return null

  const start = dayjs(localNode.startBase)
  const end = dayjs(localNode.endBase)

  if (end.isBefore(start)) return 'invalid'

  let count = 0
  let current = start.clone()

  while (current.isSameOrBefore(end)) {
    if (!holidayStore.isHoliday(current.format('YYYY-MM-DD'))) {
      count++
    }
    current = current.add(1, 'day')
  }

  return count
})


// 태스크 생성 유효성 검사
const handleCreate = async () => {
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

  try {
    localNode.parentIds = parentIds.value
    localNode.childIds = childIds.value
    console.log('✅ 태스크 생성 요청 전달', localNode)


    emit('create', cloneDeep(localNode))
    emit('close')

  } catch (err) {
    console.error('태스크 생성 실패', err)
  }
}

const handleUpdate = () => {
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
  // 부서 ID → 이름으로 
   console.log('전달할 부서 목록',  localNode.deptList)
  // const deptNames = localNode.deptList
  //   .map(id => {
  //     const found = props.deptList.find(d => d.deptId === id)
  //     return found?.deptName
  //   })
  //   .filter(Boolean)

  console.log('전달할 부서 목록', localNode.deptList)
    console.log('✅수정 요청 전달할 때 보낼 선행 태스크', parentIds.value)
    console.log('✅수정 요청 전달할 때 보낼 후행 태스크', childIds.value)
    localNode.parentIds = parentIds.value
    localNode.childIds = childIds.value

    console.log("✅ raw 전달 직전", toRaw(localNode))

    console.log("✅수정 요청 전달", localNode)

    const updatePayload = {
      ...toRaw(localNode),
      parentIds: parentIds.value,
      childIds: childIds.value,
      deptList: localNode.deptList
    }

    console.log("✅최종 전달", updatePayload)

    emit('update', cloneDeep(updatePayload))
    emit('close')
  }

// 선행 후행 태스크 예외처리
const parentIds = computed({
  get: () => localNode.parentIds.map(id => String(id)),
  set: (newIds) => {
    const overlap = newIds.filter(id => localNode.childIds.includes(id))
    if (overlap.length > 0) {
      alert(`⛔ 동일한 태스크를 선행/후행에 중복 지정할 수 없습니다: ${overlap.join(', ')}`)
      return
    }
    localNode.parentIds = newIds.map(id => String(id))
  }
})

const childIds = computed({
  get: () => localNode.childIds.map(id => String(id)),
  set: (newIds) => {
    const overlap = newIds.filter(id => localNode.parentIds.includes(id))
    if (overlap.length > 0) {
      alert(`⛔ 동일한 태스크를 선행/후행에 중복 지정할 수 없습니다: ${overlap.join(', ')}`)
      return
    }
    localNode.childIds = newIds.map(id => String(id))
  }
})


const getNodeLabel = (item) => {
  const id = item?.value
  const found = props.existingNodes.find(n => String(n.id) === String(id))
  return found?.data?.label || `ID: ${id}`
}
</script>

<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <h3 >📌 태스크 {{initialData ? '수정' : '생성'}}</h3>
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
            <label>{{ props.projectStatus === 'pending' ? "시작 베이스라인" : "예상 시작일"}}</label>
            <input v-model="localNode.startBase" type="date" @change="handleStartDateChange" value="localNode.startBase"/>
          </div>
          <div class="input-group" style="width: 100%;">
            <label>{{ props.projectStatus === 'pending' ? "마감 베이스라인" : "예상 마감일"}}</label>
            <input v-model="localNode.endBase" type="date" @change="handleEndDateChange" value="localNode.startBase"/>
          </div>
        </div>

        <!-- ✅ 총 소요일: 우측 정렬 -->
        <div
          v-if="totalDuration"
          style="align-self: flex-end; font-size: 12px; margin-top: -10px;"
          :style="{ color: totalDuration === 'invalid' ? '#FF4545' : '#1976D2' }"
        >
          <template v-if="totalDuration === 'invalid'">
            
            종료일은 시작일보다 이후여야 합니다
          </template>
          <template v-else>
            <v-icon start>mdi-calendar-clock</v-icon>
            워크데이 기반 총 소요일: <span><strong>  {{ totalDuration }}일</strong></span>
          </template>
        </div>
      </div>

      
      <div class="input-group">
        <label>담당 부서</label>
        <v-select
          v-model="localNode.deptList"          
          :items="props.deptList"               
          item-title="name"
          item-value="name" 
          multiple
          chips
          density="compact"
        />
      </div>
      <div style="display:flex; flex-direction: row; justify-content: space-between; gap: 10px;">
        <div class="input-group" style="width: 100%;">
        <label>선행 태스크</label>
        <v-select
          v-model="parentIds"
          :items="filteredParentOptions"
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
            v-model="childIds"
            :items="filteredChildOptions"
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
          <button @click="handleUpdate" class="color-button">수정</button>
          <!-- <button @click="() => {
            $emit('update', localNode)
          $emit('close')
            }" class="color-button">수정</button> -->
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
  background-color: #7578ee;
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