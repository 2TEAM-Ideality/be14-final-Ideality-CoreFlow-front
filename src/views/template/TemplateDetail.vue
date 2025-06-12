<template>
  <BasicLayout>
    <template #main>
      <h2 class="page-title">📁 {{ templateInfo?.name }}</h2>

      
      <span>템플릿 설명</span>
      <v-text-field variant="outlined" readonly>{{ templateInfo?.description }}</v-text-field>  
      
      <span>프로세스 구조도</span>
      <VueFlow
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
      <p><strong>작성자:</strong> {{ templateInfo?.createdBy }}</p>
      <p><strong>소요 기간:</strong> {{ templateInfo?.duration }}일</p>
      <p><strong>사용 중인 프로젝트:</strong> {{ templateInfo?.usingProjects }}</p>
      <p><strong>참여 부서:</strong> 
        {{ templateInfo?.deptList.map(dept => dept.name).join(', ') }}
      </p>
    </template>
  </BasicLayout>
</template>

<script setup>
import BasicLayout from '@/components/layout/BasicLayout.vue';
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/util/api.js'
import { VueFlow } from '@vue-flow/core'
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
  font-size: 18px;
  font-weight: bold;

}
.template-flow {
  height: 500px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  margin-top: 16px;
  border-radius: 10px;
}
</style>

