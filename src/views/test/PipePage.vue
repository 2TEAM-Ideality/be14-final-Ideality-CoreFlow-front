<script setup>
import { nextTick, ref , watch, onMounted } from 'vue'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import CustomNode from './CustomNode.vue'
import '@/assets/vue-flow-style.css'
import { useRouter } from 'vue-router';
import { useLayout } from './useLayout'
import NodeEditModal from '@/components/common/NodeEditModal.vue'
import { nanoid } from 'nanoid' // 노드 ID 생성용

const props = defineProps({
  // templateName: {
  //   type: String,
  //   required: true
  // },
  nodes: {
    type: Array,
    required: true
  },
  edges: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['save']) // 
const templateName = defineModel('templateName')

const { zoomTo, fitView, onPaneReady } = useVueFlow()

onPaneReady(() => {
  zoomTo(0.35)
})

const router = useRouter() 
const { layout } = useLayout()

const nodes = ref(props.nodes.map(n => ({
  ...n,
  position: n.position ?? { x: 0, y: 0 }
})))

const edges = ref([...props.edges])
const nodeTypes = { custom: CustomNode }
const selectedNode = ref(null)
const showModal = ref(false)
const duration = ref(0)  // 총 소요일
const taskCount = ref(0)  // 전체 태스크 개수 



function onConnect({ source, target }) {
  if (!source || !target) return

  const id = `e-${source}-${target}-${Date.now()}`
  edges.value.push({ id, source, target, type: 'default' })
}

async function layoutGraph(direction) {
  nodes.value = layout(nodes.value, edges.value, direction)
  nextTick(() => fitView())
}

function onAddNode(parentId) {
  const parent = nodes.value.find(n => n.id === parentId)
  if (!parent) return

  const newId = nanoid(6)
  const newNode = {
    id: newId,
    type: 'custom',
    position: {
      x: parent.position.x + 250,
      y: parent.position.y + 100,
    },
    data: {
      label: `새 태스크`,
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

function onCreateNewNode() {
  const newId = nanoid(6)
  const newNode = {
    id: newId,
    type: 'custom',
    position: { x: 100, y: 100 + nodes.value.length * 120 },
    data: {
      label: `새 태스크`,
      description: '',
      deptList: [],
      duration: null,
      slackTime: null
    }
  }
  nodes.value.push(newNode)
}

function onNodeClick(nodeId) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) {
    const cloned = JSON.parse(JSON.stringify(node))
    cloned.data.deptListString = Array.isArray(cloned.data.deptList)
      ? cloned.data.deptList.map(d => (typeof d === 'object' && d !== null ? d.name : d)).join(', ')
      : ''
    selectedNode.value = cloned
    showModal.value = true
  }
}

function saveNodeDataFromChild(updatedNode) {
  const index = nodes.value.findIndex(n => n.id === updatedNode.id)
  if (index !== -1) {
    const updatedData = {
      ...updatedNode.data,
      deptList: updatedNode.data.deptListString
        ? updatedNode.data.deptListString.split(',').map(name => ({ name: name.trim() }))
        : []
    }
    delete updatedData.deptListString

    const newNode = {
      ...nodes.value[index],
      data: { ...updatedData }
    }

    nodes.value = [
      ...nodes.value.slice(0, index),
      newNode,
      ...nodes.value.slice(index + 1)
    ]
  }

  showModal.value = false
}




function saveNodeData() {
  const index = nodes.value.findIndex(n => n.id === selectedNode.value.id)
  if (index !== -1) {
    const updated = { ...selectedNode.value.data }
    updated.deptList = updated.deptListString
      ? updated.deptListString.split(',').map(name => ({ name: name.trim() }))
      : []
    delete updated.deptListString

    const oldNode = nodes.value[index]
    const newNode = {
      ...oldNode,
      data: { ...updated }
    }

    nodes.value = [
      ...nodes.value.slice(0, index),
      newNode,
      ...nodes.value.slice(index + 1)
    ]
  }

  showModal.value = false
}

function exportTemplateData() {
  const nodeList = nodes.value.map(({ data, id, type, position }) => ({
    id,
    type,
    position,
    data: { ...data }
  }))

  const edgeList = edges.value
  const duration = nodeList.reduce((sum, node) => sum + (Number(node.data.duration) || 0), 0)
  const taskCount = nodeList.length

  // 유효성 검사 추가
  if (taskCount === 0) {
    alert('최소 하나 이상의 태스크가 필요합니다.')
    return
  }

  if (nodeList.some(n => !n.data.duration)) {
    alert('모든 태스크에 소요일(duration)을 입력해주세요.')
    return
  }

  const payload = {
    nodeList,
    edgeList,
    duration,
    taskCount,
  }

  emit('save', payload)
}


function deleteNode(nodeId) {
  nodes.value = nodes.value.filter(n => n.id !== nodeId)
  edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)
}

function updateEdge(edgeId, newTargetId) {
  const index = edges.value.findIndex(e => e.id === edgeId)
  if (index !== -1) {
    edges.value[index].target = newTargetId
  }
}

async function handleNodesInitialized() {
  await nextTick()
  requestAnimationFrame(() => {
    layoutGraph('LR')
  })
}

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
          <button title="새로운 태스크 생성" @click="onCreateNewNode">
            ➕ 새로운 태스크 생성
          </button>
          <button title="정렬" @click="layoutGraph('LR')">
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
