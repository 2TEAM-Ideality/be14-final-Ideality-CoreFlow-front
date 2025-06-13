<script setup lang="ts">
import BasicLayout from '@/components/layout/BasicLayout.vue';
import api from '@/util/api';
import { ref, onMounted } from 'vue'
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


const nodeTypes = {
  custom: TemplateViewNode
}

const router = useRouter();

const templateName = ref('')
const templateDescription = ref('')

const loadProject = ref(false)
const completedProjectList = ref([])
const selectedProject = ref(null)
const showModal = ref(false)

const flowNodes = ref([])
const flowEdges = ref([])

onMounted(() => {
  fetchProjectList()
})

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
    showModal.value = false;

    const rawNodes = selectedProject.value.nodeList.map((node: any) => ({
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

    // 🔥 여기서 자동 배치된 노드를 할당
    flowNodes.value = generateLayoutedFlowData(rawNodes, rawEdges)
    flowEdges.value = rawEdges

  } catch (err) {
    console.error('프로젝트 상세 조회 실패 ❌', err);
  }
}


const editTemplateTask = () => {
  console.log('편집 모드')
  router.push("/template/create/task")

}
const viewFullScreen = () => {
  console.log('전체 보기 클릭')

  
}
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
              hide-details
              density="comfortable"
              @change="openModal"
            />
            <v-text-field
              v-if="loadProject && selectedProject"
              :model-value="selectedProject.name"
              readonly
              variant="outlined"
              density="comfortable"
              class="dropdown"
            />
            <v-text-field
              v-if="loadProject && !selectedProject"
              model-value="선택 안 함"
              readonly
              variant="outlined"
              density="comfortable"
              class="dropdown"
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

      </div>

      
    
    </template>

    <!-- 오른쪽 영역 -->
    <template #sidebar>
        오른쪽 영역
    </template>
  </BasicLayout>
</template>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom : 20px;
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
  align-items: center;
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
.basic-button{
  color :#757575;
  border-radius: 5px;
  border : solid 1px #D9D9D9;
  font-weight: 500;
  height: 30px;
  background-color: white;
}

</style>