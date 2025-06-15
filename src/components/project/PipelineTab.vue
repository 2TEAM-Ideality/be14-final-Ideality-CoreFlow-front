<script setup>
import { nextTick, ref } from 'vue'
import { Panel, VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import TaskNode from '@/components/flow/TaskNode.vue'
import '@/assets/vue-flow-style.css'
import { useRouter } from 'vue-router'
import { useLayout } from '@/views/test/useLayout'
import api from '@/util/api.js'


// 프로젝트용 초기 노드/엣지 데이터 (임시)
import { initialProjectNodes, initialProjectEdges } from '@/components/flow/project-elements.js'

const { layout } = useLayout()
const { fitView } = useVueFlow()

const router = useRouter()

const showFullscreenView = ref(false)
const vueFlowRef = ref(null)


const nodes = ref(initialProjectNodes.map(n => ({
  ...n,
  position: { x: 0, y: 0 }  // ❗ 모든 노드에 기본값 주기
})))
const edges = ref(initialProjectEdges)
const nodeTypes = { task: TaskNode }


function onConnect({ source, target }) {
  if (!source || !target) return
  const id = `e-${source}-${target}-${Date.now()}`
  edges.value.push({ id, source, target, type: 'default' })
}

async function layoutGraph(direction) {
  nodes.value = layout(nodes.value, edges.value, direction)
  await nextTick()
  zoomTo(0.6)
}

async function handleNodesInitialized() {
  await nextTick()
  requestAnimationFrame(() => {
    layoutGraph('LR')
  })
}
</script>

<template>
  <div class="layout-flow">
    <VueFlow
      ref="vueFlowRef"
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :connectable="false"

      @connect="onConnect"
      @nodes-initialized="handleNodesInitialized"
    >
      <template #node-task="{ id, data }">
        <TaskNode :id="id" :data="data" @click="() => console.log('Clicked', id)" />
      </template>

      <Background />

      <Panel class="process-panel" position="top-right">
        <div class="layout-panel">
          <!-- <button @click="layoutGraph('LR')">↔️ 가로 정렬</button>
          <button @click="layoutGraph('TB')">↕️ 세로 정렬</button>
          <button @click="router.back()">⬅️ 뒤로가기</button> -->
          <button @click="showFullscreenView = true">🔍 전체 보기</button>
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


</style>