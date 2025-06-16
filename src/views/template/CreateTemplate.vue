<script setup lang="ts">
import BasicLayout from '@/components/layout/BasicLayout.vue';
import api from '@/api';
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import SelectProjectModal from '@/components/template/SelectProjectModal.vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import TemplateViewNode from '@/components/template/TemplateViewNode.vue'
import dagre from '@dagrejs/dagre'
import { Position } from '@vue-flow/core'
import EditTemplateTask from './EditTemplateTask.vue';
import { useRouter } from 'vue-router'
import { markRaw } from 'vue'
import InfoField from '@/components/common/SideInfoField.vue'
import { useUserStore } from '@/stores/userStore' 
import PipePage from '@/views/test/PipePage.vue'


const nodeTypes = {
  custom: markRaw(TemplateViewNode)
}

const user = useUserStore() 
const router = useRouter();

const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}



// 템플릿 작성 정보
const templateName = ref('')
const templateDescription = ref('')

// 자동 입력 정보
const createdBy = ref(user?.deptName +" "+ user?.name +" "+ user?.jobRankName)
const createdAt = ref(formatDate(new Date()))
const duration = ref(0)
const taskCount = ref(0)



const completedProjectList = ref([])
const selectedProject = ref(null)
const loadProject = ref(false)
const showModal = ref(false)        // 템플릿화 할 프로젝트 선택
const showFullScreen = ref(false)   // 템플릿 플로우 차트 전체 화면으로 보기 

const vueFlowRef = ref(null)
const flowNodes = ref([])
const flowEdges = ref([])


const usedDeptList = computed(() => {
  const all = flowNodes.value
    .flatMap(node => node.data?.deptList || [])
    .map(d => ({
      id: d.id ?? d.deptId ?? d,
      name: d.name ?? d.deptName ?? d
    }))

  const uniqueMap = new Map()
  all.forEach(d => {
    if (!uniqueMap.has(d.id)) uniqueMap.set(d.id, d)
  })

  return Array.from(uniqueMap.values())
})




onMounted(() => {
  console.log(user.id)
  fetchProjectList()

})

// 완료된 프로젝트 목록 가져오기 
const fetchProjectList = async () => {
  const res = await api.get('/api/projects/completed')
  completedProjectList.value = res.data.data;
  console.log(res)
}


const openModal = () => {
  showModal.value = true
}
const closeModal = () => {
  showModal.value = false
}

const generateLayoutedFlowData = (nodesRaw, edgesRaw) => {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 })
  g.setDefaultEdgeLabel(() => ({}))

  const NODE_WIDTH = 240
  const NODE_HEIGHT = 130

  nodesRaw.forEach(node => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edgesRaw.forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const layoutedNodes = nodesRaw.map((node) => {
    const { x, y } = g.node(node.id)
    return {
      ...node,
      position: { x, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left
    }
  })

  return layoutedNodes
}

// 선택한 프로젝트 정보 가져와서 노드 리스트로 변환
const handleSelectProject = async (project: any) => {
  try {
    const res = await api.get(`/api/projects/${project?.id}/pipeline`);
    selectedProject.value = res.data.data;
    loadProject.value = true;
    showModal.value = false;

    const nodeList = selectedProject.value.nodeList;

    // ✅ 태스크 수는 노드 개수
    taskCount.value = nodeList.length;

    // ✅ 총 소요일 = 모든 노드의 (duration + slackTime) 합
    duration.value = nodeList.reduce((total, node) => {
      return total + (node.duration || 0) + (node.slackTime || 0);
    }, 0);

    const rawNodes = nodeList.map((node: any) => ({
      id: node.id.toString(),
      type: 'custom',
      data: {
        label: node.name,
        description: node.description,
        progressRate: node.progressRate,
        status: node.status,
        deptList: node.deptList
      }
    }));

    const rawEdges = selectedProject.value.edgeList.map((edge: any) => ({
      id: edge.id,
      source: edge.source.toString(),
      target: edge.target.toString(),
      type: edge.type || 'default',
      animated: true
    }));

    flowNodes.value = generateLayoutedFlowData(rawNodes, rawEdges);
    flowEdges.value = rawEdges;

  } catch (err) {
    console.error('프로젝트 상세 조회 실패 ❌', err);
  }
}


const fitToView = () => {
  if (!flowNodes.value.length) return

  // 현재 flowNodes를 기반으로 rawNodes/Edges 추출
  const rawNodes = flowNodes.value.map((node: any) => ({
    ...node,
    position: { x: 0, y: 0 } // 초기화하여 재정렬
  }))
  const rawEdges = flowEdges.value

  // 정렬 적용
  flowNodes.value = generateLayoutedFlowData(rawNodes, rawEdges)

  // 다음 tick에 fitView 호출하여 화면 맞춤
  nextTick(() => {
    const vueFlow = vueFlowRef.value
    if (vueFlow?.fitView) {
      vueFlow.fitView()
    }
  })
}


const editTemplateTask = () => {
  console.log('편집 모드')
  showFullScreen.value = true
  // router.push("/template/create/task")

}
const viewFullScreen = () => {
  showFullScreen.value = true
}
const cancelCreate = () => {
  router.back()
}


// 템플릿 생성 
const createNewTemplate = async () => {
  if (!templateName.value.trim()) {
    alert('템플릿 이름을 입력해주세요.')
    return
  }

  if (!flowNodes.value.length) {
    alert('태스크를 최소 1개 이상 등록해주세요.')
    return
  }

  const creatorId = user?.id

  if (!creatorId) {
    alert('사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.')
    return
  }

  const nodeList = flowNodes.value.map(({ id, type, data }) => {
    return {
      id,
      type,
      data: {
        label: data.label,
        description: data.description,
        duration: data.duration,
        slackTime: data.slackTime,
        deptList: (data.deptList || [])
          .map(d => ({
            id: d.id ?? d.deptId,
            name: d.name ?? d.deptName ?? ''
          }))
          .filter(d => d.id != null)
      }
    }
  })

  const payload = {
    name: templateName.value,
    description: templateDescription.value,
    createdBy: creatorId,
    duration: duration.value,
    taskCount: taskCount.value,
    nodeList,
    edgeList: flowEdges.value
  }

  try {
    const res = await api.post('/api/template', payload)
    // const createdId = res.data.data.id
    alert('템플릿이 성공적으로 생성되었습니다.')
    router.push(`/template`)
  } catch (error) {
    console.error('템플릿 생성 실패 ❌', error)
    alert('템플릿 생성 중 오류가 발생했습니다.')
  }
}

const onEditTemplateTaskSave = (payload) => {
  flowNodes.value = payload.nodeList
  flowEdges.value = payload.edgeList
  duration.value = payload.duration
  taskCount.value = payload.taskCount
  showFullScreen.value = false
}

watch(loadProject, (newVal) => {
  if (!newVal) {
    selectedProject.value = null
    flowNodes.value = []
    flowEdges.value = []
  }
})
</script>

<template>
  <BasicLayout>
    <template #main >
      <div class="page-title">
        템플릿 생성
      </div>
      <div class="section-label">템플릿 이름</div>
      <v-text-field
        v-model="templateName"
        placeholder="템플릿 이름을 입력해주세요."
        variant="outlined"
        class="mb-4"
      />

      <div class="section-label">템플릿 설명</div>
      <v-text-field
        v-model="templateDescription"
        placeholder="템플릿 설명을 입력해주세요."
        variant="outlined"
        class="mb-4"
      />

      <div class="section-label">프로세스 구조도</div>
      <div class="process-header">
        <div class="left-controls">
          <v-checkbox
            v-model="loadProject"
            label="프로젝트 불러오기"
            :disabled="!selectedProject"
          />
          <v-text-field
            :model-value="selectedProject?.name || '선택 안 함'"
            readonly
            variant="outlined"
            density="comfortable"
            class="dropdown"
            style="cursor: pointer"
            append-inner-icon="mdi-menu-down"
            @click="openModal()"
          />

          <SelectProjectModal
            :show="showModal"
            :projects="completedProjectList"
            @close="closeModal"
            @select="handleSelectProject"
          />
        </div>


        <div class="flow-wrapper">
          <div class="flow-toolbar">
            <v-btn variant="outlined" class="basic-button" @click="editTemplateTask" size="small">
              <v-icon start>mdi-pencil-outline</v-icon>
              편집하기
            </v-btn>
            <v-btn  variant="outlined" class="basic-button" @click="fitToView" size="small">
              정렬
              <v-icon end>mdi-sort</v-icon>
            </v-btn>
            <v-btn variant="outlined" class="basic-button" @click="viewFullScreen" size="small">
              전체 보기
              <v-icon end>mdi-open-in-new</v-icon>
            </v-btn>
            
          </div>

          <VueFlow
            ref="vueFlowRef" 
            v-model:nodes="flowNodes"
            v-model:edges="flowEdges"
            fit-view
            class="template-flow"
            :node-types="nodeTypes"
          >
            <Background />
            <Controls />
          </VueFlow>
        </div>


        <div class="button-section">
          <v-btn variant="outlined" color="grey-darken-2" size="small" class="basic-button" @click="cancelCreate">
            <v-icon icon="mdi-delete-outline" class="mr-1" />
            생성 취소
          </v-btn>
          <v-btn size="small" class="color-button" @click="createNewTemplate" elevation="0">
            <v-icon icon="mdi-pencil-outline" class="mr-1" />
            템플릿 생성
          </v-btn>
        </div>
      </div>
      <!-- 전체 보기 모달 -->
      <v-dialog v-model="showFullScreen" fullscreen persistent transition="dialog-bottom-transition">
        <v-card class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6">프로세스 편집</h3>
            <div class="d-flex align-center gap-2">
              <v-btn icon @click="fitToView">
                <v-icon>mdi-sort</v-icon>
              </v-btn>
              <v-btn icon @click="showFullScreen = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <PipePage
            :templateName="templateName"
            :templateDescription="templateDescription"
            :nodes="flowNodes"
            :edges="flowEdges"
            :updatedBy="user?.id || user.id"
            @save="onEditTemplateTaskSave"
          />
        </v-card>
      </v-dialog>

      <!-- <v-dialog v-model="showFullScreen" fullscreen persistent transition="dialog-bottom-transition">
        <v-card class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6">프로세스 전체 보기</h3>
            <div class="d-flex align-center gap-2">
              <v-btn icon @click="fitToView">
                <v-icon>mdi-sort</v-icon>
              </v-btn>
              <v-btn icon @click="showFullScreen = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <VueFlow
            :nodes="flowNodes"
            :edges="flowEdges"
            :node-types="nodeTypes"
            class="fullscreen-flow"
            fit-view
            ref="fullScreenFlowRef"
          >
            <Background />
            <Controls />
          </VueFlow>
        </v-card>
      </v-dialog> -->

    </template>

    <!-- 오른쪽 영역 -->
    <template #sidebar>
      <div class="sidebar-section">
        <InfoField label="작성자" icon="mdi-account" :value="createdBy" />
        <InfoField label="생성일" icon="mdi-calendar" :value="createdAt" />
        <InfoField label="총 소요 기간" icon="mdi-timer-sand" :value="duration + ' 일'" />
        <InfoField label="전체 태스크 수" icon="mdi-format-list-numbered" :value="taskCount + '개'" />
        
        <div>
          <div class="section-label">참여 부서</div>
          <div class="d-flex flex-wrap dept-chip-wrap">
            <v-chip
              v-for="dept in usedDeptList"
              :key="dept.id"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ dept.name }}
            </v-chip>
          </div>
        </div>
      </div>
    </template>
    
    
    
  </BasicLayout>
</template>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom : 30px;
  text-align: left;
}
.section-label {
    font-weight: 500;
    font-size: 15px;
    margin-bottom : 10px;
    width: fit-content;
    text-align: left;
}

.process-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
}

.left-controls {
  display: flex;
  align-items: baseline;
  /* align-items: center; */
  align-content: center;
  gap: 12px;
}

.dropdown {
  min-width: 240px;
}

.right-controls {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}


.template-flow {
  height: 400px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  margin-top: 16px;
  border-radius: 10px;
}
.flow-wrapper {
  position: relative;
  margin-top: 16px;
}

.flow-toolbar {
  position: absolute;
  top: 30px;
  right: 12px;
  z-index: 10;
  display: flex;
  gap: 10px;
}

.template-flow {
  height: 400px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.button-section {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: flex-end;
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
}
.color-button {
  background-color: #25BEAD;
  color: white;
  font-weight: 600;
  font-size: 12px;
  height: 36px;
  padding: 0 14px;
  line-height: 1.6;
}

.sidebar-section {
  display:flex;
  flex-direction : column;
  gap: 40px;
  border-radius: 20px;
}

.dept-chip-wrap {
  gap: 8px; 
}

/* 전체 보기 모달 */
.fullscreen-flow {
  height: calc(100vh - 80px);
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
}
</style>