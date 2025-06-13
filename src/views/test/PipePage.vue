<script setup>
import { nextTick, ref , watch, onMounted } from 'vue'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import CustomNode from './CustomNode.vue'
import '@/assets/vue-flow-style.css'
import { useRouter} from 'vue-router';
import { useLayout } from './useLayout'
import NodeEditModal from '@/components/common/NodeEditModal.vue'
// import { propsFactory } from 'vuetify/lib/util'

const props = defineProps({
  templateName: {
    type: String,
    required: true
  },
  nodes: {
    type: Array,
    required: true
  },
  edges: {
    type: Array,
    required: true
  }
})

const { zoomTo, fitView, onPaneReady } = useVueFlow()

onPaneReady(() => {
  zoomTo(0.35)      // 초기 줌 설정
  // fitView()         // 노드 전체 보기 자동 맞춤 (선택사항)
})


const router = useRouter() 

const nodes = ref(props.nodes.map(n => ({
  ...n,
  position: n.position ?? { x: 0, y: 0 }  // position 없으면 기본값
})))

const edges = ref([...props.edges])

const nodeTypes = { custom: CustomNode }

const selectedNode = ref(null)
const showModal = ref(false)

const { layout } = useLayout()

function onConnect({ source, target }) {
  if (!source || !target) return

  const id = `e-${source}-${target}-${Date.now()}`
  edges.value.push({
    id,
    source,
    target,
    type: 'default'
  })
}

// 노드 위치 재배치
async function layoutGraph(direction) {
  nodes.value = layout(nodes.value, edges.value, direction)
  nextTick(() => fitView())
}

// + 버튼으로 노드 추가
function onAddNode(parentId) {
  const parent = nodes.value.find(n => n.id === parentId)
  if (!parent) return

  const newId = `node-${Date.now()}`
  const newNode = {
    id: newId,
    type: 'custom',
    position: {
      x: parent.position.x + 250,
      y: parent.position.y
    },
    data: {
      label: '',
      description: '',
      deptList: [],
      duration: null,
      slackTime: null
    }
  }

  nodes.value.push(newNode)
  edges.value.push({
    id: `e-${parentId}-${newId}`,
    source: parentId,
    target: newId,
    type: 'default'
  })
}

// 노드 클릭 시 모달 오픈
function onNodeClick(nodeId) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) {
    const cloned = JSON.parse(JSON.stringify(node))
    cloned.data.deptListString = Array.isArray(cloned.data.deptList)
    ? cloned.data.deptList.map(d => {
        if (typeof d === 'object' && d !== null) return d.name
        return d
      }).join(', ')
    : ''
    selectedNode.value = cloned
    showModal.value = true
  }
}


// 저장 시 실제 노드 데이터 업데이트
function saveNodeData() {
  const index = nodes.value.findIndex(n => n.id === selectedNode.value.id)
  if (index !== -1) {
    const updated = { ...selectedNode.value.data }
    updated.deptList = updated.deptListString
    ? updated.deptListString.split(',').map(name => ({ name: name.trim() }))
    : []
    delete updated.deptListString

    // ✅ 완전히 새로운 객체로 할당 (Vue의 반응성 시스템이 감지하게끔)
    const oldNode = nodes.value[index]
    const newNode = {
      ...oldNode,
      data: { ...updated }
    }

    // 🔁 강제 재할당 (얕은 복사 아닌 새 배열로 할당해야 Vue가 갱신)
    nodes.value = [
      ...nodes.value.slice(0, index),
      newNode,
      ...nodes.value.slice(index + 1)
    ]
  }

  showModal.value = false
}



// 전체 저장
function exportTemplateData() {
  // 현재 노드 목록에서 deptListString은 제외하고 저장
  // const nodeList = nodes.value.map(n => ({
  //   ...n,
  //   data: {
  //     ...n.data,
  //     deptListString: undefined
  //   }
  // }))
  const nodeList = nodes.value.map(({ data, id, type, position }) => ({
    id,
    type,
    position, // 자동 계산된 위치
    data: { ...data }
  }))

  const edgeList = edges.value

  const payload = { nodeList, edgeList }

  // ✅ 콘솔에 현재 상태 출력
  console.log('%c📦 현재 저장되는 노드/엣지 상태:', 'color: #10b981; font-weight: bold;')
  console.log(JSON.stringify(payload, null, 2))
}

// 노드 삭제 시 엣지 삭제
function deleteNode(nodeId) {
  // 1. 해당 노드를 삭제
  nodes.value = nodes.value.filter(n => n.id !== nodeId)

  // 2. 해당 노드와 연결된 엣지를 삭제
  edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)
}

// 노드 연결 정보 업데이트 
function updateEdge(edgeId, newTargetId) {
  const index = edges.value.findIndex(e => e.id === edgeId)
  if (index !== -1) {
    edges.value[index].target = newTargetId
  }
}


async function handleNodesInitialized() {
  // 1. 렌더링 이후 한 프레임 기다리기
  await nextTick()
  requestAnimationFrame(() => {
    layoutGraph('LR')  // 정확한 dimensions 기준으로 layout 적용
  })
}

// 데이터 감시
watch(() => props.nodes, (newVal) => {
  nodes.value = newVal.map(n => ({
    ...n,
    position: n.position ?? { x: 0, y: 0 }
  }))
}, { immediate: true })

watch(() => props.edges, (newVal) => {
  edges.value = [...newVal]
}, { immediate: true })


</script>


<template>
    
    <div class="layout-flow">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        :connectable="true"
        @connect="onConnect"
        @nodes-initialized="handleNodesInitialized"
      >
        <template #node-custom="{ id, data }">
        <CustomNode :id="id" :data="data" @addNode="onAddNode" @click="() => onNodeClick(id)" />
        </template>
  
        <Background />
        <Panel position="top-left" class="left-panel">

            <v-text-field
              label="템플릿 이름"
              v-model="props.templateName"
              variant="outlined"
              hide-details
              density="comfortable"
              class="w-100"
               style="min-width: 280px; max-width: 400px;"
            />
        </Panel>

        <Panel class="process-panel" position="top-right">
          <div class="layout-panel">
            <!--  @click="layoutGraph('LR')"  -->
            <button title="새로운 태스크 생성"  @click="layoutGraph('LR')">
              ➕ 새로운 태스크 생성
            </button>
            <button title="새로운 태스크 생성"  @click="layoutGraph('LR')">
              ↔️ 정렬
            </button>
            <button title="전체 저장" @click="exportTemplateData">
            💾 편집 완료
            </button>
             <button title="편집 취소" @click="router.back()">
            ↙️
            </button>
          </div>
        </Panel>
      </VueFlow>
  
      <!-- 편집 모달 -->
      <div v-if="showModal" class="modal-backdrop">
        <NodeEditModal
          :show="showModal"
          :nodeData="selectedNode"
          @save="saveNodeDataFromChild"
          @close="showModal = false"
        />
      </div>

    </div>
  </template>
  
<style scoped>


.layout-flow {
  background-color: #ffffff;
  height: 100%;
  width: 100%;
}
/* 패널 관련 */
.left-panel  {
  width: fit-content;
}
.process-panel,
.layout-panel {
  display: flex;
  gap: 10px;
}

.process-panel {
  /* background-color: #2d3748; */
  padding: 10px;
  border-radius: 8px;
  /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); */
  flex-direction: column;
}

.process-panel button {
  border: none;
  cursor: pointer;
  background-color: #4a5568;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  /* width: 40px; */
  padding: 10px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-panel button:hover,
.layout-panel button:hover {
  background-color: #2563eb;
  transition: background-color 0.2s;
}

/* 모달 관련 */
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
    font-weight: 20px;
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
.input-group input {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
