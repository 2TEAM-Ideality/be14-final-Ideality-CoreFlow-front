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
      <v-text-field variant="outlined" readonly style="font-size: 12px;">{{ templateInfo?.description }}</v-text-field>  
      
      <div class="d-flex align-center justify-space-between mb-2" >
        <span class="section-label">프로세스 구조도</span>
        <v-btn
          variant="outlined"
          color="grey-darken-2"
          size="small"
          class="basic-button"
          @click="showFullscreenView = true"
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

      <v-dialog v-model="showFullscreenView" fullscreen transition="dialog-bottom-transition" persistent>
        <v-card class="pa-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-h6">📌 전체 프로세스 보기</h3>
            <v-btn icon @click="showFullscreenView = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <VueFlow
            :nodes="flowNodes"
            :edges="flowEdges"
            :node-types="nodeTypes"
            fit-view
            style="height: calc(100vh - 100px)"
          >
            <Background />
            <Controls />
          </VueFlow>
        </v-card>
      </v-dialog>

    </template>

    <template #sidebar>
        <div class="sidebar-section">
          <div>
            <InfoField label="작성자" icon="mdi-account" :value="templateInfo?.createdBy" />
            <InfoField label="생성일" icon="mdi-calendar" :value="templateInfo?.createdAt?.split('T')[0]" />
            <!-- <InfoField label="최종 수정일" icon="mdi-update" :value="templateInfo?.updatedAt?.split('T')[0]" /> -->
            <InfoField label="총 소요 기간" icon="mdi-timer-sand" :value="templateInfo?.duration + ' 일'" />
            <InfoField label="전체 태스크 수" icon="mdi-format-list-numbered" :value="templateInfo?.taskCount + '개'" />
            <!-- <InfoField label="사용 중인 프로젝트" icon="mdi-folder-multiple" :value="templateInfo?.usingProjects + '개'" /> -->
            <div>
              <div class="sidebar-section-label">
                <span class="icon-wrapper">
                  <v-icon size="18">mdi-domain</v-icon>
                </span>
                <span>참여 부서</span>
              </div>
              <div class="d-flex flex-wrap dept-chip-wrap">
                <v-chip
                  v-for="dept in templateInfo?.deptList || []"
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
        </div>
    </template>
  </BasicLayout>
</template>

<script setup>
import BasicLayout from '@/components/layout/BasicLayout.vue';
import TemplateViewNode from '@/components/template/TemplateViewNode.vue'
import InfoField from '@/components/common/SideInfoField.vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api.js'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import dagre from '@dagrejs/dagre'
import { Position } from '@vue-flow/core'
import { markRaw } from 'vue'


const nodeTypes = {
  custom: markRaw(TemplateViewNode)
}

const route = useRoute()
const router = useRouter()
const templateId = ref(route.params.id)

const showFullscreenView = ref(false)   // 플로우 차트 전체 보기
const isLoading = ref(true)     // 데이터 로딩

const templateInfo = ref(null)
const nodeList = ref([])
const edgeList = ref([])
const flowNodes = ref([])
const flowEdges = ref([])

// 템플릿 정보 가져오기 
const fetchTemplate = async () => {
  try {
    const res = await api.get(`/api/template/${templateId.value}`)
    const data = res.data.data

    isLoading.value = false
    templateInfo.value = data.templateInfo
    nodeList.value = data.templateData.nodeList
    edgeList.value = data.templateData.edgeList

    console.log(data)

    // 데이터 로딩 후 변환 함수 호출
    convertToFlowData()
  }catch (e){
    console.error(`${templateId.value} 템플릿 정보 가져오기 실패!`, e) 
    isLoading.value = true
  } 
}


onMounted(() => {
  fetchTemplate()
})


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
        duration: node.data.duration,
        slackTime: node.data.slackTime,
        deptList: node.data.deptList
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
// 수정 페이지로 이동 
const editTemplate = () => {
  router.push(`/template/edit/${templateId.value}`)
}

// 템플릿 삭제
const deleteTemplate = async () => {
  try {
    await api.delete(`/api/template/${templateId.value}`)
    router.push('/template') // 목록 페이지로 이동 등
  } catch (e) {
    console.error('삭제 실패', e)
  }
}

watch(() => route.params.id, async (newId) => {
  templateId.value = newId
  await fetchTemplate()
})

</script>


<style scoped>
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom : 20px;
  text-align: left;
}
.template-flow {
  height: 400px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  margin-top: 16px;
  border-radius: 10px;
}
.section-label {
  font-weight: 500;
  font-size: 15px;
  margin-bottom : 10px;
  text-align: left;
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
  font-weight: 500;
  height: 30px;
}
.color-button{
  background-color: #25BEAD;
  color: white;
  font-weight: 500;
}

.sidebar-section {
  display:flex;
  flex-direction : column;
  gap: 40px;
  border-radius: 20px;
}

.v-input.readonly .v-field__input {
  font-size: 12px;
}
/* 부서 칩 라벨 영역 */
.sidebar-section-label {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: gray;
}

.dept-chip-wrap {
  gap: 8px;
  margin-bottom: 20px;
}

.dept-chip-wrap {
  gap: 8px;
}

</style>

