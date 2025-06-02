<script setup>
import { nextTick, ref } from 'vue'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import Icon from './Icon.vue'
import CustomNode from './CustomNode.vue'
import '@/assets/vue-flow-style.css'

// import { initialEdges, initialNodes } from './initial-elements.js'
import { initialEdges, initialNodes } from './test-elements.js'
import { useLayout } from './useLayout'

const nodes = ref(initialNodes.map(n => ({
  ...n,
  position: { x: 0, y: 0 }  // ❗ 모든 노드에 기본값 주기
})))
const edges = ref(initialEdges)
const nodeTypes = { custom: CustomNode }

const selectedNode = ref(null)
const showModal = ref(false)

const { layout } = useLayout()
const { fitView } = useVueFlow()

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
    cloned.data.deptListString = cloned.data.deptList?.join(', ') ?? ''
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
      ? updated.deptListString.split(',').map(s => s.trim()).filter(Boolean)
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
  
        <Panel class="process-panel" position="top-right">
          <div class="layout-panel">
            <button title="set horizontal layout" @click="layoutGraph('LR')">
              <Icon name="horizontal" />
            </button>
            <button title="set vertical layout" @click="layoutGraph('TB')">
              <Icon name="vertical" />
            </button>
            <button title="전체 저장" @click="exportTemplateData">
            💾
            </button>
          </div>
        </Panel>
      </VueFlow>
  
      <!-- 편집 모달 -->
      <div v-if="showModal" class="modal-backdrop">
        <div class="modal">
            <h3 class="modal-title">노드 정보 수정</h3>

            <div class="input-group">
            <label for="label">Label</label>
            <input id="label" v-model="selectedNode.data.label" placeholder="Label" />
            </div>

            <div class="input-group">
            <label for="description">설명</label>
            <input id="description" v-model="selectedNode.data.description" placeholder="설명" />
            </div>

            <div class="input-group">
            <label for="duration">소요일 (일)</label>
            <input id="duration" v-model.number="selectedNode.data.duration" type="number" placeholder="소요일 (숫자)" />
            </div>

            <div class="input-group">
            <label for="slackTime">슬랙 타임 (일)</label>
            <input id="slackTime" v-model.number="selectedNode.data.slackTime" type="number" placeholder="슬랙 타임 (숫자)" />
            </div>

            <div class="input-group">
            <label for="deptList">담당 부서</label>
            <input id="deptList" v-model="selectedNode.data.deptListString" placeholder="담당 부서 (쉼표 구분)" />
            </div>

            <div class="modal-actions">
            <button @click="saveNodeData">저장</button>
            <button @click="showModal = false">취소</button>
            </div>
        </div>
        </div>

    </div>
  </template>
  
<style scoped>


.layout-flow {
  background-color: #ffffff;
  height: 100%;
  width: 100%;
}

.process-panel,
.layout-panel {
  display: flex;
  gap: 10px;
}

.process-panel {
  background-color: #2d3748;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  flex-direction: column;
}

.process-panel button {
  border: none;
  cursor: pointer;
  background-color: #4a5568;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  width: 40px;
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
