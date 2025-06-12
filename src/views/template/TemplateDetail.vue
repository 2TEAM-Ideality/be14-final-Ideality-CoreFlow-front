<template>
  <BasicLayout>
    <template #main>
      <div class="page-title">
        📁 {{ templateInfo?.name }}
      </div>

      <div class="button-section">
        <v-btn
          variant="outlined"
          color="grey-darken-2"
          size="small"
          class="basic-button"
          @click="deleteTemplate"
        >
          <v-icon icon="mdi-delete-outline" class="mr-1" />
          템플릿 삭제
        </v-btn>

        <v-btn
          size="small"
          class="color-button"
          @click="editTemplate"
          elevation = '0'
        >
          <v-icon icon="mdi-pencil-outline" class="mr-1" />
          템플릿 수정
        </v-btn>
      </div>
      

      
      <div class="section-label">템플릿 설명</div>
      <v-text-field variant="outlined" readonly>{{ templateInfo?.description }}</v-text-field>  
      
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="section-label">프로세스 구조도</span>
        <v-btn
          variant="outlined"
          color="grey-darken-2"
          size="small"
          class="basic-button"
          @click="fitToView"
        >
          전체 보기
          <v-icon end icon="mdi-arrow-top-right" />
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
            

    </template>

    <template #sidebar>
      <div class="sidebar-section">
        <div class="section-label">작성자</div>
        <v-text-field variant="outlined" readonly class="sidebar-input" density="compact" hide-details  style="border-radius : 15px;">
          {{ templateInfo?.createdBy }}
        </v-text-field>  
        <div class="section-label">소요 기간</div>
        <v-text-field variant="outlined" readonly class="sidebar-input" density="compact" hide-details >
          {{ templateInfo?.duration }}일
        </v-text-field>  
        <div class="section-label">사용 중인 프로젝트</div>
        <v-text-field variant="outlined" readonly class="sidebar-input" density="compact" hide-details >
          {{ templateInfo?.usingProjects }}
        </v-text-field>  
        <div class="section-label">참여 부서</div>
        <v-text-field variant="outlined" readonly class="sidebar-input" density="compact" hide-details >
          {{ templateInfo?.deptList.map(dept => dept.name).join(', ') }}
        </v-text-field>  
      </div>
     
    </template>
  </BasicLayout>
</template>

<script setup>
import BasicLayout from '@/components/layout/BasicLayout.vue';
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/util/api.js'
import { VueFlow } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import dagre from '@dagrejs/dagre'
import { Position } from '@vue-flow/core'
import TemplateViewNode from '@/components/template/TemplateViewNode.vue'

const nodeTypes = {
  custom: TemplateViewNode
}

const vueFlowRef = ref(null)

const route = useRoute()
const templateId = ref(route.params.id)

const templateInfo = ref(null)
const nodeList = ref([])
const edgeList = ref([])
const flowNodes = ref([])
const flowEdges = ref([])

const fetchTemplate = async () => {
  const res = await api.get(`/api/template/${templateId.value}`)
  const data = res.data.data

  templateInfo.value = data.templateInfo
  nodeList.value = data.templateData.nodeList
  edgeList.value = data.templateData.edgeList

  // 👉 데이터 로딩 후 변환 함수 호출
  convertToFlowData()
}

onMounted(fetchTemplate)

const fitToView = () => {
  if (vueFlowRef.value?.fitView) {
    vueFlowRef.value.fitView()
  }
}

const convertToFlowData = () => {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 })

  const NODE_WIDTH = 240
  const NODE_HEIGHT = 130

  nodeList.value.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edgeList.value.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  flowNodes.value = nodeList.value.map((node) => {
    const { x, y } = g.node(node.id)
    return {
      id: node.id,
      type: 'custom',
      position: { x, y },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      data: {
        label: node.data.label,
        description: node.data.description,
        durtaion: node.data.durtaion,
        slackTime: node.data.slackTime,
        dept: node.data.deptList.map(d => d.name).join(', '),
      }
    }
  })

  flowEdges.value = edgeList.value.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    // type: 'default',
    type: 'smoothstep',
    animated: true,
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  }))
}



watch(() => route.params.id, async (newId) => {
  templateId.value = newId
  await fetchTemplate()
})

</script>


<style scoped>
.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom : 20px;

}
.template-flow {
  height: 500px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  margin-top: 16px;
  border-radius: 10px;
}
.section-label {
  font-weight: 500;
  font-size: 15px;
  margin-bottom : 10px;
}

.button-section {
  width :100%;
  display:flex;
  flex-direction : row;
  gap: 10px;
  justify-content: flex-end;
}
.basic-button{
  color :#757575;
  border-radius: 5px;
  border : solid 1px #D9D9D9;
  font-weight: 300;
  height: 30px;
  /* text-transform: none; */
  /* padding : 10px 20px 10px 20px; */
}
.color-button{
  background-color: #25BEAD;
  color: white;
  font-weight: 300;
}
.sidebar-input .v-input__control {
  font-size: 13px !important; /* 원하는 크기로 */
  padding: 4px 8px !important;
  min-height: 32px !important;
}

.sidebar-section {
  display:flex;
  flex-direction : column;
  gap: 10px;
}

</style>

