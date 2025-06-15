<template>
  <div class="layout-flow" style="position: relative; overflow: visible">
    <VueFlow
      ref="vueFlowRef"
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :connectable="false"
      :default-edge-options="{ type: 'smoothstep', animated: true }"
      @connect="onConnect"
      @nodes-initialized="handleNodesInitialized"
    >
      <template #node-task="{ id, data }">
        <TaskNode :id="id" :data="data" @click="() => console.log('Clicked', id)" />
      </template>

      <Background />

      <Panel class="process-panel" position="top-right">
        <div class="layout-panel">
          <button title="정렬" @click="layoutGraph('LR')">
            ↔️ 정렬
          </button>
          <button title="전체 보기" @click="showFullscreenView = true">
            🔍 전체 보기
          </button>
        </div>
      </Panel>
    </VueFlow>

    <v-dialog v-model="showFullscreenView" fullscreen transition="dialog-bottom-transition" persistent>
      <v-card class="pa-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <h3 class="text-h6">📌 전체 프로세스 보기</h3>
          <v-btn icon @click="showFullscreenView = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          :node-types="nodeTypes"
          :connectable="false"
          fit-view
          style="height: calc(100vh - 100px);"
        >
          <Background />
        </VueFlow>
      </v-card>
    </v-dialog>

  </div>
</template>



<script setup>
import { nextTick, ref, onMounted } from 'vue'
import { Panel, VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import TaskNode from '@/components/flow/TaskNode.vue'
import '@/assets/vue-flow-style.css'
import { useRouter, useRoute } from 'vue-router'
import { useLayout } from '@/views/test/useLayout'
import api from '@/util/api.js'
import { markRaw } from 'vue'
import dagre from '@dagrejs/dagre'

const nodeTypes = {
  task: markRaw(TaskNode)
}

const router = useRouter()
const route = useRoute()
const projectId = route.params.id

const showFullscreenView = ref(false)
const vueFlowRef = ref(null)

const nodes = ref([])
const edges = ref([])


const { layout } = useLayout()
const { fitView, zoomTo } = useVueFlow()


// 프로젝트 파이프라인 데이터 가져오기
async function fetchPipeline() {
  try {
    const res = await api.get(`/api/projects/${projectId}/pipeline`, {
      params: { projectId }
    })
    const data = res.data.data
    console.log(data)

    const rawNodes = data.nodeList
    const rawEdges = data.edgeList

    // 중복 제거한 엣지
    const uniqueEdges = Array.from(
      new Map(rawEdges.map(e => [`${e.source}-${e.target}`, e])).values()
    )

    // 노드 변환
    const convertedNodes = rawNodes.map(node => ({
      id: String(node.id),
      type: 'task',
      position: { x: 0, y: 0 },
      data: {
        label: node.name,
        description: node.description,
        startBase: node.startBase,
        endBase: node.endBase,
        startExpect: node.startExpect,
        endExpect: node.endExpect,
        startReal : node.startReal,
        endReal : node.endReal,
        progressRate : node.progressRate,
        delayDays : node.delayDays,
        status: node.status,
        deptList: Array.from(new Set(node.deptList.map(d => d.name))), // 중복 부서 제거
        toolbarVisible: false
      }
    }))

    // 엣지 변환
    const convertedEdges = uniqueEdges.map(edge => ({
      id: edge.id || `e-${edge.source}-${edge.target}`,
      source: String(edge.source),
      target: String(edge.target),
      type: 'bezier', // 곡선 타입
      animated: true,
      sourcePosition: Position.Right,
      targetPosition: Position.Left
    }))

    // 레이아웃 처리
    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 })

    convertedNodes.forEach(n => {
      g.setNode(n.id, { width: 240, height: 130 })
    })

    convertedEdges.forEach(e => {
      g.setEdge(e.source, e.target)
    })

    dagre.layout(g)

    // 위치 반영
    nodes.value = convertedNodes.map(n => {
      const pos = g.node(n.id)
      return {
        ...n,
        position: { x: pos.x, y: pos.y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      }
    })

    edges.value = convertedEdges
    await nextTick()
    fitView()
  } catch (err) {
    console.error('파이프라인 불러오기 실패:', err)
  }
}

onMounted(() => {
  fetchPipeline()
})

function onConnect({ source, target }) {
  if (!source || !target) return
  const id = `e-${source}-${target}-${Date.now()}`
  edges.value.push({ id, source, target, type: 'default' })
}

async function layoutGraph(direction) {
  nodes.value = layout(nodes.value, edges.value, direction)
  await nextTick()
  zoomTo(0.85)
}

async function handleNodesInitialized() {
  await nextTick()
  requestAnimationFrame(() => {
    layoutGraph('LR')
  })
}


</script>



<style scoped>
.layout-flow {
  /* background-color: #ffffff; */
  height: 1000px;
  width: 100%;
}

.left-panel {
  padding: 10px;
  font-weight: bold;
  font-size: 16px;
}

.process-panel,
.layout-panel {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.process-panel button {
  border: none;
  cursor: pointer;
  background-color: #4a5568;
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
}

.process-panel button:hover {
  background-color: #2563eb;
}

.fullscreen-flow {
  height: calc(100vh - 100px); /* 상단 여백 확보 (제목 + 버튼 등) */
  background-color: #ffffff;   /* 또는 원하는 색상 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
}
.vue-flow__viewport {
  overflow: visible !important;
  z-index: auto !important; /* 또는 적당히 높은 수치 */
}


</style>