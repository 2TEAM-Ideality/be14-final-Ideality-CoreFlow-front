<script setup>
import { nextTick, ref } from 'vue'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import Icon from './Icon.vue'
import CustomNode from './CustomNode.vue'
import '@/assets/vue-flow-style.css'

import { initialEdges, initialNodes } from './initial-elements.js'
import { useLayout } from './useLayout'

const nodes = ref(initialNodes)
const edges = ref(initialEdges)
const nodeTypes = { custom: CustomNode }

const selectedNode = ref(null)
const showModal = ref(false)

const { layout } = useLayout()
const { fitView } = useVueFlow()

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
  const nodeList = nodes.value.map(n => ({
    ...n,
    data: {
      ...n.data,
      deptListString: undefined
    }
  }))
  const edgeList = edges.value

  const payload = { nodeList, edgeList }

  // 예시로 로그 출력 (→ axios.post 가능)
  console.log(JSON.stringify(payload, null, 2))
}

</script>


<template>
    
    <div class="layout-flow">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :node-types="nodeTypes"
        @nodes-initialized="layoutGraph('LR')"
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
          <h3>노드 정보 수정</h3>
            <input v-model="selectedNode.data.label" placeholder="Label" />
            <input v-model="selectedNode.data.description" placeholder="설명" />
            <input v-model.number="selectedNode.data.duration" placeholder="소요일 (숫자)" type="number" />
            <input v-model.number="selectedNode.data.slackTime" placeholder="슬랙 타임 (숫자)" type="number" />
            <input v-model="selectedNode.data.deptListString" placeholder="담당 부서 (쉼표 구분)" />

  
          <div class="modal-actions">
            <button @click="saveNodeData">저장</button>
            <button @click="showModal = false">취소</button>
          </div>
        </div>
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
    padding: 20px;
    border-radius: 8px;
    width: 300px;
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
  </style>
  

<style>
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
  padding: 20px;
  border-radius: 8px;
  width: 300px;
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
</style>
