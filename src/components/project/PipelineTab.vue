
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

import pipelineData from '@/assets/data/warning-dummy.json'


const nodeTypes = {
  task: markRaw(TaskNode)
}

const { layout } = useLayout()

const { fitView, zoomTo, setCenter, addEdges, onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges } = useVueFlow()
// TEST
onNodesChange(async (changes) => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      console.log('REMOVE')

      const confirmed = confirm(`노드 ${change.id} 삭제할까요?`)
    } else {
      nextChanges.push(change)
    }
  }

  applyNodeChanges(nextChanges)
})

// 엣지 삭제 시점에 모달 띄우기  
onEdgesChange(async (changes) => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      const confirmed = await showEdgeDeleteConfirm(change.id)
      if (!confirmed) continue

      const edge = edges.value.find(e => e.id === change.id)
      if (edge) {
        await updateNextPrevTasksAfterEdgeDelete(edge.source, edge.target)
        edges.value = edges.value.filter(e => e.id !== change.id)
        console.log(`✅ 엣지 ${change.id} 삭제 및 백엔드 반영 완료`)
      }
    } else {
      nextChanges.push(change)
    }
  }

  applyEdgeChanges(nextChanges)
})
// 모달 띄우는 함수
function showEdgeDeleteConfirm(id) {
  return new Promise((resolve) => {
    const confirmed = window.confirm(`엣지 ${id}를 삭제하시겠습니까?`)
    resolve(confirmed)
  })
}

// 노드만 backsapce 로 삭제 시 업데이트 함수
async function updateNextPrevTasksAfterNodeDelete(deletedNodeId) {
  const sid = Number(deletedNodeId)
  const idToNameMap = Object.fromEntries(deptList.value.map(d => [d.deptId, d.deptName]))

  // 삭제된 노드 기준으로 source/target 찾기
  const prevNodes = getParentIds(sid) // 이 노드를 자식으로 갖던 노드들
  const nextNodes = getChildIds(sid)  // 이 노드를 부모로 갖던 노드들

  const updateTargets = [...new Set([...prevNodes, ...nextNodes])]

  for (const tid of updateTargets) {
    const targetNode = nodes.value.find(n => Number(n.id) === tid)
    if (!targetNode) continue

    const newPrev = getParentIds(tid).filter(id => id !== sid)
    const newNext = getChildIds(tid).filter(id => id !== sid)

    const deptNames = (targetNode.data.deptList || []).map(d =>
      typeof d === 'number' ? idToNameMap[d] : d
    )

    const requestBody = {
      taskName: targetNode.data.label,
      taskId: tid,
      projectId: Number(projectId),
      description: targetNode.data.description,
      deptLists: deptNames,
      prevTaskList: newPrev,
      nextTaskList: newNext,
      startExpect: targetNode.data.startBase,
      endExpect: targetNode.data.endBase
    }

    try {
      await api.patch(`/api/task/modify/${tid}`, requestBody)
      console.log(`✅ 노드 ${tid}의 연결 갱신 완료 (삭제된 ${sid} 반영)`)
    } catch (err) {
      console.error(`❌ 노드 ${tid} 갱신 실패`, err)
    }
  }
}


// 엣지만 backspace 삭제 시 업데이트 함수
async function updateNextPrevTasksAfterEdgeDelete(sourceId, targetId) {
  const sid = Number(sourceId)
  const tid = Number(targetId)

  // ⛳ 변경된 관계 계산
  const sourceNewNext = getChildIds(sid).filter(id => id !== tid)
  const targetNewPrev = getParentIds(tid).filter(id => id !== sid)

  const sourceNode = nodes.value.find(n => Number(n.id) === sid)
  const targetNode = nodes.value.find(n => Number(n.id) === tid)

  const idToNameMap = Object.fromEntries(deptList.value.map(d => [d.deptId, d.deptName]))

  try {
    // ✅ source 노드 갱신 요청
    await api.patch(`/api/task/modify/${sid}`, {
      taskName: sourceNode.data.label,
      taskId: sid,
      projectId: Number(projectId),
      description: sourceNode.data.description,
      deptLists: (sourceNode.data.deptList || []).map(d => typeof d === 'number' ? idToNameMap[d] : d),
      prevTaskList: getParentIds(sid),
      nextTaskList: sourceNewNext,
      startExpect: sourceNode.data.startBase,
      endExpect: sourceNode.data.endBase
    })

    // ✅ target 노드 갱신 요청
    await api.patch(`/api/task/modify/${tid}`, {
      taskName: targetNode.data.label,
      taskId: tid,
      projectId: Number(projectId),
      description: targetNode.data.description,
      deptLists: (targetNode.data.deptList || []).map(d => typeof d === 'number' ? idToNameMap[d] : d),
      prevTaskList: targetNewPrev,
      nextTaskList: getChildIds(tid),
      startExpect: targetNode.data.startBase,
      endExpect: targetNode.data.endBase
    })
  } catch (err) {
    console.error('❌ 엣지 삭제 반영 실패:', err)
    alert('엣지 삭제 중 오류가 발생했습니다.')
  }
}



const route = useRoute()

const projectId = route.params.id
const projectInfo = ref({})   // 프로젝트 정보
const projectName = ref('')
const nodes = ref([])   // 원본 노드 데이터 
const edges = ref([])   // 원본 엣지 데이터 

const deptList = ref([])    // 부서 목록 
const showFullscreenView = ref(false)   // 전체 보기 
const vueFlowRef = ref(null)    // 

const showEditModal = ref(false)    // 수정 모달 
const showNewTask = ref(false)      // 태스크 생성 모달 
const editingNode = ref(null)       // 수정 대상 태스크  

const newTasks = ref([])        // 생성할 태스크 목록 

const projectStatus = ref(null);

const totalTasks = ref(0)

// 프로젝트 파이프라인 데이터 가져오기
async function fetchPipeline() {
  try {
    // api
    const res = await api.get(`/api/projects/${projectId}/pipeline`, {
      params: { projectId }
    })
    const data = res.data.data

    // warning TEST 용 
    // const data = pipelineData.data

    console.log('✅ 파이프라인 데이터 조회', data)
   
    projectName.value = data.name
    projectStatus.value = data.status
    
    const rawNodes = data.nodeList
    const rawEdges = data.edgeList

    
    // 상태별 개수 계산
    const statusCounts = rawNodes.reduce((acc, node) => {
      const status = node.status?.toUpperCase() || 'UNKNOWN'

      // 기본 상태 카운트
      acc[status] = (acc[status] || 0) + 1

      // 추가: warning 필드가 true면 WARNING으로도 카운트
      if (node.warning === true) {
        acc['WARNING'] = (acc['WARNING'] || 0) + 1
      }

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
        passedRate : node.passedRate,
        delayDays : node.delayDays,
        status: node.status,
        warning: node.warning,
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

// 부서 목록 조회
const fetchDeptList = async () => {
  const res = await api.get(`/api/projects/${projectId}/participants/leaderDept`)
  deptList.value = res.data.data;
  console.log('✅ 부서 목록', res)
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
  console.log('✅ Started task', taskId)
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

    console.log('편집 시 전달할 부서목록', deptNames)

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
  console.log("✅ 태스크 삭제 요청")
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
  console.log('✅ 업데이트 요청 확인', updatedData)
  try {
    const requestBody = {
      taskName: updatedData.label,
      taskId: Number(updatedData.id),
      projectId: Number(projectId),
      description: updatedData.description,
      deptLists: deptNames,  // ✅ 부서명 문자열 리스트
      prevTaskList: updatedData.parentIds,
      nextTaskList: updatedData.childIds,
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

  // ✅ 수정 직후 파이프라인 최신화
  await fetchPipeline()
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



async function onSaveTasks() {
  console.log('📌 현재 노드 목록', nodes.value)
  try {
    showFullscreenView.value = false
    const idMap = new Map()

    // ✅ 엣지 먼저 갱신
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
    // ✅ 노드 ID 갱신
    nodes.value = nodes.value.map(n => {
      const newId = idMap.get(n.id)
      if (!newId) return n
      return {
        ...n,
        id: String(newId),
        data: { ...n.data }
      }
    })
    

    // for (const node of nodes.value) {
    //   const parentIds = getParentIds(node.id)
    //   const childIds = getChildIds(node.id)

    //   let deptData = node.data.deptList

    //   // 숫자일 경우 부서명으로 변환
    //   if (typeof deptData?.[0] === 'number') {
    //     const idToNameMap = Object.fromEntries(
    //       deptList.value.map(d => [d.deptId, d.deptName])
    //     )
    //     deptData = deptData.map(id => idToNameMap[id]).filter(Boolean)
    //   }

    //   const requestBody = {
    //     taskName: node.data.label,
    //     taskId: Number(node.id),
    //     projectId: Number(projectId),
    //     description: node.data.description,
    //     deptLists: deptData,
    //     prevTaskList: parentIds,
    //     nextTaskList: childIds,
    //     startExpect: node.data.startBase,
    //     endExpect: node.data.endBase
    //   }

    //   console.log(`📌 엣지 기반 갱신 - 태스크 ${node.id}`, requestBody)
    //   await api.patch(`/api/task/modify/${node.id}`, requestBody)
    // }
    // ✅ 엣지만 수정되기 전
    for (const node of nodes.value) {
      if (!idMap.has(node.id)) {
        const parentIds = node.data.parentIds || getParentIds(node.id)
        const childIds = node.data.childIds || getChildIds(node.id)

        let deptData = node.data.deptList

        // ✅ deptList 값이 숫자일 경우 → 수정용 deptName 변환 필요
        if (typeof deptData?.[0] === 'number') {
          const idToNameMap = Object.fromEntries(
            deptList.value.map(d => [d.deptId, d.deptName])
          )
          deptData = deptData.map(id => idToNameMap[id]).filter(Boolean)
        }
        console.log('✅모든 태스크 편집 반영 확인', node)

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
        console.log('✅모든 태스크 편집 반영 확인',  requestBody )

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


// 노드 삭제
async function handleNodesDelete(deletedNodes) {
  console.log('🧨 삭제된 노드:', deletedNodes)

  for (const node of deletedNodes) {
    const nodeId = Number(node.id)

    try {
      // 🔁 연결된 노드들 관계 갱신
      await updateNextPrevTasksAfterNodeDelete(nodeId)

      // 서버에 소프트 삭제 요청
      await api.patch(`/api/task/delete/${nodeId}`)

      // 엣지에서도 해당 노드와 연결된 것 제거
      edges.value = edges.value.filter(
        e => e.source !== node.id && e.target !== node.id
      )

      console.log(`✅ 노드 삭제 반영 완료: ${nodeId}`)
    } catch (err) {
      console.error(`❌ 노드 삭제 실패: ${nodeId}`, err)
    }
  }

  await nextTick()
  layoutGraph('LR')
}


// 엣지 삭제 
async function handleEdgesDelete(deletedEdges) {
  console.log('🧨 삭제된 엣지:', deletedEdges)

  for (const edge of deletedEdges) {
    const sourceId = Number(edge.source)
    const targetId = Number(edge.target)

    try {
      // 🔁 source → nextTaskList 에서 target 제거
      const sourceParentIds = getParentIds(sourceId)
      const sourceChildIds = getChildIds(sourceId).filter(id => id !== targetId)

      await api.patch(`/api/task/modify/${sourceId}`, {
        taskId: sourceId,
        projectId: Number(projectId),
        prevTaskList: sourceParentIds,
        nextTaskList: sourceChildIds
      })

      // 🔁 target → prevTaskList 에서 source 제거
      const targetParentIds = getParentIds(targetId).filter(id => id !== sourceId)
      const targetChildIds = getChildIds(targetId)

      await api.patch(`/api/task/modify/${targetId}`, {
        taskId: targetId,
        projectId: Number(projectId),
        prevTaskList: targetParentIds,
        nextTaskList: targetChildIds
      })

      console.log(`✅ 엣지 삭제 반영 완료: ${sourceId} → ${targetId}`)
    } catch (err) {
      console.error('❌ 엣지 삭제 반영 실패:', err)
    }
  }

  // 💡 UI 재정렬 (선택)
  await nextTick()
  layoutGraph('LR')
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
    :totalTaskCount="projectInfo?.nodeList?.length || 0"
    :passedRate="projectInfo.passedRate"
    :progressRate="projectInfo.progressRate"
    :delayDays="projectInfo.delayDays"
    :statusCounts="projectInfo.statusCounts"
  />
  </div>
  <div class="layout-flow" style="position: relative; overflow: visible">
    
    <VueFlow
      fit-view-on-init
      ref="vueFlowRef"
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :connectable="false"
      :default-edge-options="{ type: 'smoothstep', animated: true }"
      @connect="onConnect"
      @nodes-initialized="handleNodesInitialized"
      @nodes-delete="handleNodesDelete"
      @edges-delete="handleEdgesDelete"
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
        :projectStatus="projectStatus"
        @create="handleCreateNewNode" 
        @update="handleUpdateTask"
        @close="handleCloseModal"

      />
      <v-card class="pa-4">
        <!-- 상단 메뉴 -->
        <div class="d-flex justify-space-between align-center mb-2">
          <h3 class="text-h6">📌 {{ projectName }}</h3>
          <div style="display: flex; flex-direction: row; gap: 20px; background-color: #F8F9FA; border-radius: 15px; padding: 15px 30px; margin-left: auto;">
            <!-- 총 소요일 -->
            <div style="display: flex; flex-direction: column; font-size: 14px;">
              <div style="color:#484848">총 소요일</div>
              <span style="color: #6750A4; font-size: 20px;"><strong>{{ projectInfo.delayDays }} 일</strong></span>
            </div>

            <!-- 전체 태스크 -->
            <div style="display: flex; flex-direction: column; font-size: 14px;">
              <div style="color:#484848">전체 태스크</div>
              <span style="color: #6750A4; font-size: 20px;"><strong>{{ projectInfo?.nodeList?.length || 0 }} 개</strong></span>
            </div>

            <!-- 부서 목록 -->
            <div style="display: flex; flex-direction: column; font-size: 14px;">
              <div style="color:#484848">부서 목록</div>
              <div class="chip-container" >
                <v-chip
                  size="small"
                  variant="outlined"
                  v-for="dept in deptList"
                  :key="dept.deptId"
                  style="margin-right: 3px;"
                >
                  {{ dept.name }}
                </v-chip>
              </div>
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
        @nodes-initialized="handleNodesInitialized"
        @nodes-delete="handleNodesDelete"
        @edges-delete="handleEdgesDelete"
        @selection-change="(s) => console.log('선택 변경:', s)"
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
            @nodes-change="onNodesChange"
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