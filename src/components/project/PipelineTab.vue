
<script setup>
import FloatingInfo from '@/components/project/FloatingInfo.vue'
import { nextTick, ref, onMounted, watch } from 'vue'
import { Panel, VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import TaskNode from '@/components/flow/TaskNode.vue'
import NewTaskModal from '@/components/common/NewTaskModal.vue'

import '@/assets/vue-flow-style.css'
import { useRoute } from 'vue-router'
import { useLayout } from '@/views/test/useLayout'
import api from '@/api.js'
import { markRaw } from 'vue'
import dagre from '@dagrejs/dagre'
import { nanoid } from 'nanoid' 


const nodeTypes = {
  task: markRaw(TaskNode)
}

const { layout } = useLayout()
const { fitView, zoomTo } = useVueFlow()
const { setCenter } = useVueFlow()

const route = useRoute()

const projectId = route.params.id
const projectInfo = ref({})   // 프로젝트 정보
const projectName = ref('')
const nodes = ref([])   // 원본 노드 데이터 
const edges = ref([])   // 원본 엣지 데이터 

const deptList = ref([])    // 부서 목록 
console.log(deptList.value)
const showFullscreenView = ref(false)   // 전체 보기 
const vueFlowRef = ref(null)    // 

const showEditModal = ref(false)    // 수정 모달 
const showNewTask = ref(false)      // 태스크 생성 모달 
const editingNode = ref(null)       // 수정 대상 태스크  

const newTasks = ref([])        // 생성할 태스크 목록 

console.log(projectInfo.value)


// 프로젝트 파이프라인 데이터 가져오기
async function fetchPipeline() {
  try {
    const res = await api.get(`/api/projects/${projectId}/pipeline`, {
      params: { projectId }
    })
    const data = res.data.data
    console.log(data)
    // projectInfo.value = data
   
    projectName.value = data.name
    
    const rawNodes = data.nodeList
    const rawEdges = data.edgeList

    
    // 상태별 개수 계산
    const statusCounts = rawNodes.reduce((acc, node) => {
      const status = node.status?.toUpperCase() || 'UNKNOWN'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // 기존 projectInfo에 상태별 개수까지 포함해서 저장
     projectInfo.value = {
      ...data,
      statusCounts
    }
    console.log("✅ 프로젝트 파이프라인 데이터 확인", projectInfo.value)

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
    nodes.value = convertedNodes
    .filter(n => n.data.status?.toLowerCase() !== 'deleted')
    .map(n => {
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

// 부서 목록 가져오기
const fetchDeptList = async () => {
  // const res = await api.get('/api/dept/all')
  const res = await api.get(`/api/projects/${projectId}/participants/department`)
  deptList.value = res.data.data;
  console.log('부서 목록', res)
}

onMounted(() => {
  fetchPipeline()
  fetchDeptList() 
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

function handleStartTask(taskId) {
  // 태스크 시작 로직
  console.log('Started task', taskId)
}

// source/target task에 null 들어가는 것 방지
function getParentIds(nodeId) {
  return edges.value
    .filter(e => e.target === nodeId && e.source != null)
    .map(e => Number(e.source))
    .filter(id => !isNaN(id));
}

function getChildIds(nodeId) {
  return edges.value
    .filter(e => e.source === nodeId && e.target != null)
    .map(e => Number(e.target))
    .filter(id => !isNaN(id));
}

// 태스크 생성
async function handleCreateNewNode(nodeData) {
  try {
    const payload = {
      label: nodeData.label,
      description: nodeData.description,
      startBaseLine: nodeData.startBase,
      endBaseLine: nodeData.endBase,
      projectId: Number(projectId),
      deptList: nodeData.deptList,
      source: nodeData.parentIds,
      target: nodeData.childIds
    }

    const res = await api.post('/api/task', payload)
    const savedId = res.data.data  // 단일 숫자 ID만 반환됨

    console.log("✅ 태스크 생성 성공!", savedId)

    nodes.value.push({
      id: String(savedId),
      type: 'task',
      position: { x: 0, y: 0 }, // 임시 위치
      data: {
        label: nodeData.label,
        description: nodeData.description,
        startBase: nodeData.startBase,
        endBase: nodeData.endBase,
        status: 'pending',
        deptList: nodeData.deptList,
        toolbarVisible: false
      }
    })

    if (nodeData.parentIds?.length) {
      for (const parentId of nodeData.parentIds) {
        edges.value.push({
          id: `e-${parentId}-${savedId}`,
          source: String(parentId),
          target: String(savedId),
          type: 'bezier',
          animated: true,
          sourcePosition: Position.Right,
          targetPosition: Position.Left
        })
      }
    }

    await nextTick()
    await layoutGraph('LR') // ✅ 위치 계산 먼저

    // ✅ 정확한 위치 반영 후 중심 이동
    const createdNode = nodes.value.find(n => n.id === String(savedId))
    if (createdNode) {
      setCenter(createdNode.position.x, createdNode.position.y, {
        zoom: 1.5,
        duration: 500
      })
    }

  } catch (err) {
    console.error('태스크 생성 실패:', err)
    alert('태스크 생성 중 오류 발생')
  }
}


// 태스크 수정 모달 
function onEditNode(nodeId) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) {
    const parentIds = getParentIds(nodeId)
    const childIds = getChildIds(nodeId)

    // ✅ 부서 ID → 부서명으로 변환
    let deptNames = node.data.deptList
    if (typeof deptNames?.[0] === 'number') {
      const idToNameMap = Object.fromEntries(deptList.value.map(d => [d.deptId, d.deptName]))
      deptNames = deptNames.map(id => idToNameMap[id]).filter(Boolean)
    }

    editingNode.value = {
      ...node,
      data: {
        ...node.data,
        deptList: deptNames,  // ✅ 정확하게 'deptList' 키로 전달
        parentIds,
        childIds
      }
    }

    showNewTask.value = true
  }
}

// 태스크 삭제 연결
async function handleDeleteTask(nodeId) {
  console.log("태스크 삭제하러 옴")
  try {
    // 서버에 삭제 요청 (실제로는 soft-delete 처리)
    await api.patch(`/api/task/delete/${nodeId}`)

    // 성공 시: 로컬 노드/엣지에서 제거
    nodes.value = nodes.value.filter(n => n.id !== nodeId)
    edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)

    console.log(`태스크 ${nodeId} 삭제 완료`)
  } catch (err) {
    console.error('태스크 삭제 실패:', err)
    alert('태스크 삭제에 실패했습니다.')
  }
}

// 태스크 정보 수정
async function handleUpdateTask(updatedData) {
  if (!updatedData || !updatedData.id) return;

  const node = nodes.value.find(n => n.id === updatedData.id)
  if (!node) return

  // ✅ 부서 ID → 부서명 변환
  let deptNames = updatedData.deptList
  if (typeof deptNames?.[0] === 'number') {
    const idToNameMap = Object.fromEntries(deptList.value.map(d => [d.deptId, d.deptName]))
    deptNames = updatedData.deptList.map(id => idToNameMap[id]).filter(Boolean)
  }

  // 로컬 노드 데이터 반영
  Object.assign(node.data, {
    label: updatedData.label,
    description: updatedData.description,
    startBase: updatedData.startBase,
    endBase: updatedData.endBase,
    deptList: deptNames
  })

  try {
    const requestBody = {
      taskName: updatedData.label,
      taskId: Number(updatedData.id),
      projectId: Number(projectId),
      description: updatedData.description,
      deptLists: deptNames,  // ✅ 부서명 문자열 리스트
      prevTaskList: getParentIds(updatedData.id),
      nextTaskList: getChildIds(updatedData.id),
      startExpect: updatedData.startBase,
      endExpect: updatedData.endBase
    }

    await api.patch(`/api/task/modify/${updatedData.id}`, requestBody)
    console.log('✅ 태스크 수정 성공')
  } catch (err) {
    console.error('태스크 수정 실패:', err)
    alert('태스크 수정 요청에 실패했습니다.')
  }

  // 모달 상태 초기화 및 정렬
  showEditModal.value = false
  editingNode.value = null
  await nextTick()
  layoutGraph('LR')
}



// 태스크 노드 생성
// 노드에서 (+) 버튼으로 바로 생성되도록 수정
async function onAddNode(parentId = null) {
  const tempId = nanoid(6)

  const newNodeData = {
    label: '새 태스크',
    description: '',
    deptList: [],
    startBase: new Date().toISOString().split('T')[0],
    endBase: new Date().toISOString().split('T')[0],
    status: 'pending',
    progressRate: 0,
    passedRate: 0,
    delayDays: 0,
    toolbarVisible: false
  }

  const parentIds = parentId ? [parentId] : []
  const childIds = []  // ✅ 뒤 노드 없음

  const body = {
    label: newNodeData.label,
    description: newNodeData.description,
    startBaseLine: newNodeData.startBase,
    endBaseLine: newNodeData.endBase,
    projectId: Number(projectId),
    deptList: [],
    source: parentIds.filter(id => id !== undefined && id !== null), // ✅ 여기!
    target: []
  }
  
  try {
    console.log("+ 버튼으로 후행 태스크 생성 요청", body)
    const res = await api.post('/api/task', body)
    const savedTaskId = res.data.data  // 숫자 또는 문자열
    console.log("✅ + 버튼으로 후행 태스크 생성 완료", savedTaskId)

    const node = {
      id: String(savedTaskId),
      type: 'task',
      position: { x: 200, y: 200 + nodes.value.length * 100 },
      data: {
        ...newNodeData,         // 이 안에 label, deptList 등 있음
        toolbarVisible: false
      }
    }

    nodes.value.push(node)

    if (parentId) {
      edges.value.push({
        id: `e-${parentId}-${savedTaskId}`,
        source: String(parentId),
        target: String(savedTaskId),
        type: 'bezier',
        animated: true,
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      })
    }


    await nextTick()
    layoutGraph('LR')
  } catch (e) {
    console.error('태스크 생성 실패:', e)
    alert('태스크 생성 중 오류 발생')
  }
}

// function onAddNode(parentId = null) {
//   const newId = nanoid(6)
//   const newNode = {
//     id: newId,
//     type: 'task',
//     position: { x: 200, y: 200 + nodes.value.length * 100 },
//     data: {
//       label: `새 태스크`,
//       description: '',
//       deptList: [],
//       duration: null,
//       slackTime: null,
//       status: 'pending',
//       progressRate: 0,
//       passedRate: 0,
//       delayDays: 0,
//       toolbarVisible: false
//     }
//   }

//   nodes.value.push(newNode)
//   newTasks.value.push(newNode) // 🔥 저장 대상에 추가

//   if (parentId) {
//     edges.value.push({
//       id: `e-${parentId}-${newId}`,
//       source: parentId,
//       target: newId,
//       type: 'bezier',
//       animated: true,
//       sourcePosition: Position.Right,
//       targetPosition: Position.Left
//     })
//   }

//   nextTick(() => {
//     layoutGraph('LR')
//   })
// }


async function onSaveTasks() {
  console.log('📌 현재 노드 목록', nodes.value)
  try {
    showFullscreenView.value = false
    const idMap = new Map()

    // 1. 새 태스크 저장
    // for (const node of newTasks.value) {
    //   const payload = {
    //     label: node.data.label,
    //     description: node.data.description,
    //     startBaseLine: node.data.startBase,
    //     endBaseLine: node.data.endBase,
    //     projectId: Number(projectId),
    //     deptList: node.data.deptList || [],
    //     source: getParentIds(node.id).filter(Boolean),
    //     target: getChildIds(node.id).filter(Boolean)
    //     // source: getParentIds(node.id),  // 기존 엣지로부터 부모 추출
    //     // target: getChildIds(node.id)
    //   }

    //   const res = await api.post('/api/task', payload)
    //   const realId = res.data.data.taskId
    //   idMap.set(node.id, realId)
    // }

    // ✅ 2. 엣지 먼저 갱신
    edges.value = edges.value.map(e => {
      const newSource = idMap.get(e.source) || e.source
      const newTarget = idMap.get(e.target) || e.target

      // 👇 에러 방지용 로그
      if (!newSource || !newTarget) {
        console.warn('⚠️ 엣지 소스/타겟 ID 중 null 있음:', e)
      }

      return {
        ...e,
        id: `e-${newSource}-${newTarget}`,
        source: String(newSource),
        target: String(newTarget)
      }
    })
    // ✅ 3. 노드 ID 갱신
    nodes.value = nodes.value.map(n => {
      const newId = idMap.get(n.id)
      if (!newId) return n
      return {
        ...n,
        id: String(newId),
        data: { ...n.data }
      }
    })
    
    // ✅ 4. 이제 getParentIds / getChildIds 안전하게 사용 가능
    for (const node of nodes.value) {
      if (!idMap.has(node.id)) {
        const parentIds = getParentIds(node.id).map(Number)
        const childIds = getChildIds(node.id).map(Number)

        let deptData = node.data.deptList

        // ✅ deptList 값이 숫자일 경우 → 수정용 deptName 변환 필요
        if (typeof deptData?.[0] === 'number') {
          const idToNameMap = Object.fromEntries(
            deptList.value.map(d => [d.deptId, d.deptName])
          )
          deptData = deptData.map(id => idToNameMap[id]).filter(Boolean)
        }

        const requestBody = {
          taskName: node.data.label,
          taskId: Number(node.id),
          projectId: Number(projectId),
          description: node.data.description,
          deptLists: deptData, // ✅ 변환된 부서명 목록
          prevTaskList: parentIds,
          nextTaskList: childIds,
          startExpect: node.data.startBase,
          endExpect: node.data.endBase
        }

        console.log(`📌 태스크 수정 요청: ${node.id}`, requestBody)
        await api.patch(`/api/task/modify/${node.id}`, requestBody)
      }
    }

        newTasks.value = []

        await nextTick()
        layoutGraph('LR')
        fitView()

        console.log('✅ 전체 태스크 저장 및 연결 반영 완료')
      } catch (err) {
        console.error('편집 완료 중 오류 발생:', err)
        alert('편집 완료 중 오류가 발생했습니다.')
      }
    }




watch(showFullscreenView, async (isOpen) => {
  if (!isOpen) {
    nodes.value.forEach(n => {
      n.data.toolbarVisible = false
    })
    await nextTick() // DOM 반영 이후
    layoutGraph('LR') // 💡 정렬
    fitView()         // 💡 전체 보기로 줌
  }
})

function handleCloseModal() {
  showNewTask.value = false
  editingNode.value = null  
}

</script>


<template>
  <div>
    <FloatingInfo
    v-if="projectInfo.statusCounts && !showFullscreenView"
    :passedRate="projectInfo.passedRate"
    :progressRate="projectInfo.progressRate"
    :delayDays="projectInfo.delayDays"
    :statusCounts="projectInfo.statusCounts"
  />
  </div>
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
        <TaskNode
          :id="id"
          :data="data"
          @click="() => console.log('Clicked', id)"
          @addNode="onAddNode"
        />
      </template>

      <Background />

      <Panel class="process-panel" position="top-right">
        <div class="layout-panel">
          <button title="정렬" @click="layoutGraph('LR')">
            ↔️ 정렬
          </button>
          <button title="전체 보기" @click="showFullscreenView = true">
            ✏️ 편집하기
          </button>
        </div>
      </Panel>
    </VueFlow>

    <!-- 전체 보기 창 :  노드 생성 / 수정 임시 상태 -->
    <v-dialog v-model="showFullscreenView" fullscreen transition="dialog-bottom-transition" persistent>
      <NewTaskModal
        v-model:show="showNewTask"
        :projectId="Number(projectId)"
        :deptList="deptList"
        :existingNodes="nodes"
        :initialData="editingNode"
        @create="handleCreateNewNode" 
        @update="handleUpdateTask"
        @close="handleCloseModal"
      />
      <v-card class="pa-4">
        <!-- 상단 메뉴 -->
        <div class="d-flex justify-space-between align-center mb-2">
          <h3 class="text-h6">📌 {{ projectName }}</h3>
          <div style="display:flex; flex-direction: row;">
            <div style="display: flex; flex-direction: column; font-size: 14px;">
              <div style="color:#484848">지연일</div>
                <span style="color: #6750A4; font-size: 20px;" ><strong>{{ projectInfo.delayDays }} 일</strong></span>
              </div>
              <div style="display: flex; flex-direction: column; font-size: 14px;">
                <div  style="color:#484848">전체 태스크</div>
                <span style="color: #6750A4; font-size: 20px;" ><strong>{{projectInfo?.nodeList?.length ||0  }} 개</strong></span>
            </div>
          </div>
          <v-btn icon @click="showFullscreenView = false" variant="plain">
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
        <template #node-task="{ id, data }">
          <TaskNode
            :id="id"
            :data="data"
            :showFullscreenView="showFullscreenView"
            @addNode="onAddNode"
            @edit="onEditNode"
            @delete="handleDeleteTask"
            @start="handleStartTask"
          />
            <!-- @complete="handleCompleteTask" -->

        </template>

        <Background />
          <Panel class="process-panel" position="top-right">
            <div class="dialog-panel">
              <button title="태스크 생성" @click="showNewTask = true">
                📝 태스크 생성
              </button>
              <button title="정렬" @click="layoutGraph('LR')">
                🔀 정렬
              </button>
              <!-- @click="onSaveTasks" -->
              <button title="편집 완료"   @click="onSaveTasks">
                ✅ 편집 완료
              </button>
            </div>
          </Panel>
          
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
.vue-flow__viewport {
  overflow: visible !important;
  z-index: auto !important; /* 또는 적당히 높은 수치 */
}

.layout-panel {
  display: flex;
  flex-direction : row;
  gap : 10px;
}

.dialog-panel {
  display: flex;
  flex-direction : row;
  gap : 10px;
}
</style>