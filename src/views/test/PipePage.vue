<script setup>
import { nextTick, ref , watch, onMounted } from 'vue'
import { Panel, VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import CustomNode from './CustomNode.vue'
import '@/assets/vue-flow-style.css'
import { useRouter } from 'vue-router';
import { useLayout } from './useLayout'
import NodeEditModal from '@/components/common/NodeEditModal.vue'
import api from '@/api.js'
import { nanoid } from 'nanoid' 

const props = defineProps({
  nodes: Array,
  edges: Array,
  templateName: String,
  templateDescription: String,
  updatedBy: String
})

const emit = defineEmits(['save']) 

const { fitView, zoomTo, onPaneReady, setCenter, addEdges, onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges } = useVueFlow()

onPaneReady(() => {
  zoomTo(0.8)
})

const router = useRouter() 
const { layout } = useLayout()
const nodeTypes = { custom: CustomNode }

const localNodes = ref(props.nodes.map(n => ({
  ...n,
  position: n.position ?? { x: 0, y: 0 }
})))

const localEdges = ref([...props.edges])
const selectedNode = ref(null)
const showModal = ref(false)
const deptList = ref([])

onMounted(() => {
  fetchDeptList()
})

const fetchDeptList = async () => {
  const res = await api.get('/api/dept/all')
  deptList.value = res.data.data
}

function onConnect({ source, target }) {
  if (!source || !target) return
  const id = `e-${source}-${target}-${Date.now()}`
  localEdges.value.push({ id, source, target, type: 'default' })
}

async function layoutGraph(direction) {
  localNodes.value = layout(localNodes.value, localEdges.value, direction)
  nextTick(() => fitView())
}

onNodesChange(async (changes) => {
  const nextChanges = []
  for (const change of changes) {
    if (change.type === 'remove') {
      const confirmed = confirm(`노드 ${change.id} 삭제할까요?`)
      if (!confirmed) continue

      // 삭제 반영
      const idsToRemove = [change.id]
      localNodes.value = localNodes.value.filter(n => !idsToRemove.includes(n.id))
      localEdges.value = localEdges.value.filter(
        e => !idsToRemove.includes(e.source) && !idsToRemove.includes(e.target)
      )
    } else {
      nextChanges.push(change)
    }
  }
  applyNodeChanges(nextChanges)
})

onEdgesChange(async (changes) => {
  const nextChanges = []
  for (const change of changes) {
    if (change.type === 'remove') {
      const confirmed = confirm(`엣지 ${change.id} 삭제할까요?`)
      if (!confirmed) continue
      localEdges.value = localEdges.value.filter(e => e.id !== change.id)
    } else {
      nextChanges.push(change)
    }
  }
  applyEdgeChanges(nextChanges)
})

function onAddNode(parentId) {
  const parent = localNodes.value.find(n => n.id === parentId)
  if (!parent) return
  const newId = nanoid(6)
  const newNode = {
    id: newId,
    type: 'custom',
    position: { x: parent.position.x + 250, y: parent.position.y + 100 },
    data: { label: '새 태스크', description: '', deptList: [], duration: null, slackTime: null }
  }
  localNodes.value.push(newNode)
  localEdges.value.push({ id: `e-${parentId}-${newId}`, source: parentId, target: newId, type: 'default' })
}

function onCreateNewNode() {
  const newId = nanoid(6)
  const newNode = {
    id: newId,
    type: 'custom',
    position: { x: 100, y: 100 + localNodes.value.length * 120 },
    data: { label: '새 태스크', description: '', deptList: [], duration: null, slackTime: null }
  }
  localNodes.value.push(newNode)
}

function onNodeClick(nodeId) {
  const node = localNodes.value.find(n => n.id === nodeId)
  if (node) {
    selectedNode.value = JSON.parse(JSON.stringify(node))
    showModal.value = true
  }
}

function saveNodeDataFromChild(updatedNode) {
  const index = localNodes.value.findIndex(n => n.id === updatedNode.id)
  if (index !== -1) {
    const updatedData = { ...updatedNode.data }
    delete updatedData.deptListString
    const newNode = { ...localNodes.value[index], data: { ...updatedData } }
    localNodes.value.splice(index, 1, newNode)
  }
  showModal.value = false
}

function calculateTotalDuration(nodeList, edgeList) {
  const nodeMap = new Map(nodeList.map(n => [n.id, n]))
  const adj = new Map()
  const inDegree = new Map()
  nodeList.forEach(n => { adj.set(n.id, []); inDegree.set(n.id, 0) })
  edgeList.forEach(edge => { adj.get(edge.source).push(edge.target); inDegree.set(edge.target, inDegree.get(edge.target) + 1) })
  const queue = [], durationMap = new Map()
  nodeList.forEach(node => {
    const id = node.id, base = +node.data.duration || 0, slack = +node.data.slackTime || 0
    if (inDegree.get(id) === 0) { queue.push(id); durationMap.set(id, base + slack) }
    else durationMap.set(id, 0)
  })
  while (queue.length) {
    const current = queue.shift(), currentDuration = durationMap.get(current)
    adj.get(current).forEach(next => {
      const nextNode = nodeMap.get(next), base = +nextNode.data.duration || 0, slack = +nextNode.data.slackTime || 0
      durationMap.set(next, Math.max(durationMap.get(next), currentDuration + base + slack))
      inDegree.set(next, inDegree.get(next) - 1)
      if (inDegree.get(next) === 0) queue.push(next)
    })
  }
  return Math.max(...durationMap.values())
}

function exportTemplateData() {
  const nodeList = localNodes.value.map(n => ({ ...n }))
  const edgeList = localEdges.value.map(e => ({ ...e }))
  const duration = calculateTotalDuration(nodeList, edgeList)
  const taskCount = nodeList.length
  if (taskCount === 0) return alert('최소 하나 이상의 태스크가 필요합니다.')
  if (nodeList.some(n => !n.data.duration)) return alert('모든 태스크에 소요일(duration)을 입력해주세요.')
  const payload = {
    name: props.templateName,
    description: props.templateDescription,
    updatedBy: props.updatedBy,
    duration,
    taskCount,
    nodeList,
    edgeList
  }
  emit('save', payload)
}

watch(() => props.nodes, (newVal) => {
  localNodes.value = newVal.map(n => ({ ...n, position: n.position ?? { x: 0, y: 0 } }))
}, { immediate: true })

watch(() => props.edges, (newVal) => {
  localEdges.value = [...newVal]
}, { immediate: true })
</script>


<template>
  <div class="layout-flow">
<VueFlow
  :nodes="localNodes"
  :edges="localEdges"
      :node-types="nodeTypes"
      :connectable="false"
      @connect="onConnect"
      @nodes-initialized="handleNodesInitialized"
      @nodes-delete="handleNodesDelete"
      @edges-delete="handleEdgesDelete"
      @selection-change="(s) => console.log('선택 변경:', s)"
    >
      <template #node-custom="{ id, data }">
        <CustomNode :id="id" 
          :data="data" 
          @addNode="onAddNode" 
          @click="() => onNodeClick(id)" 
          @nodes-change="onNodesChange"
          />
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
        :deptList="deptList"
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
