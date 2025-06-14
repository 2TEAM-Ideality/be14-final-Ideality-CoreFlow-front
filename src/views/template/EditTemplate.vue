<script setup lang="ts">
import BasicLayout from '@/components/layout/BasicLayout.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import InfoField from '@/components/common/SideInfoField.vue'
import PipePage from '@/views/test/PipePage.vue'
import { markRaw } from 'vue'
import { useUserStore } from '@/stores/userStore' 

const nodeTypes = {
  custom: markRaw(TemplateViewNode)
}

// const nodeTypes = {
//   custom: TemplateViewNode
// }
const user = useUserStore() 
const route = useRoute()
const router = useRouter()
const templateId = ref(route.params.id)


const templateInfo = ref(null)
const nodeList = ref([])
const edgeList = ref([])
const flowNodes = ref([])
const flowEdges = ref([])
const vueFlowRef = ref(null)
const loading = ref(true)
const showFullScreen = ref(false)


const fetchTemplate = async () => {
  try {
    const res = await api.get(`/api/template/${templateId.value}`)
    const data = res.data.data
    templateInfo.value = data.templateInfo
    nodeList.value = data.templateData.nodeList
    edgeList.value = data.templateData.edgeList
    
    console.log('[nodeList]', JSON.stringify(nodeList.value, null, 2))

    convertToFlowData()
  } catch (e) {
    console.error('템플릿 로딩 실패:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTemplate)



function openEditModal() {
  showFullScreen.value = true
}

function onEditTemplateTaskSave(payload) {
  flowNodes.value = payload.nodeList
  flowEdges.value = payload.edgeList
  templateInfo.value.duration = payload.duration
  templateInfo.value.taskCount = payload.taskCount
  showFullScreen.value = false
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
    type: 'smoothstep',
    animated: true,
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  }))
}


// 수정 완료
async function saveEditedTemplate() {
  const payload = {
    name: templateInfo.value.name,
    description: templateInfo.value.description,
    updatedBy: user?.id,
    duration: templateInfo.value.duration,
    taskCount: templateInfo.value.taskCount,
    nodeList: flowNodes.value,
    edgeList: flowEdges.value
  }

  try {
    await api.put(`/api/template/${templateId.value}`, payload)
    alert('템플릿 수정이 완료되었습니다 ✅')
    router.push('/template') // 목록 등으로 이동
  } catch (err) {
    console.error('템플릿 수정 실패 ❌', err)
    alert('템플릿 수정에 실패했습니다 ❌')
  }
}


// 수정 취소 뒤로 가기
const cancelEdit = () => {
  router.back()
}

</script>

<template>
  <BasicLayout>
    <template #main>
      <v-progress-circular v-if="loading" indeterminate color="primary" class="my-8" />

      <div v-else>
        <div class="page-title">템플릿 수정</div>

        <div class="section-label">템플릿명</div>
        <v-text-field
          variant="outlined"
          v-model="templateInfo.name"
          class="mb-2"
        />

        <div class="section-label">템플릿 설명</div>
        <v-text-field
          variant="outlined"
          v-model="templateInfo.description"
        />

        <div class="d-flex align-center justify-space-between mb-2" style="flex-wrap: nowrap;">
          <span class="section-label" style="white-space: nowrap;">프로세스 구조도</span>
          <div class="button-section d-flex align-center" style="gap: 8px; flex-wrap: nowrap;">
            <v-btn
              variant="outlined"
              color="grey-darken-2"
              size="small"
              class="basic-button"
              @click="openEditModal"
            >
              <v-icon icon="mdi-pencil-outline" class="mr-1" />
              편집하기
            </v-btn>
          </div>
        </div>

        <div class="flow">
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
          <v-btn variant="outlined" color="grey-darken-2" size="small" class="basic-button" @click="cancelEdit">
            <v-icon icon="mdi-delete-outline" class="mr-1" />
            수정 취소
          </v-btn>
          <v-btn size="small" class="color-button" @click="saveEditedTemplate" elevation="0">
            <v-icon icon="mdi-pencil-outline" class="mr-1" />
            수정 완료
          </v-btn>
        </div>
      </div>
      <v-dialog v-model="showFullScreen" fullscreen persistent transition="dialog-bottom-transition">
        <v-card class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6">프로세스 편집</h3>
            <div class="d-flex align-center gap-2">
              <!-- <v-btn icon @click="fitToView">
                <v-icon>mdi-sort</v-icon>
              </v-btn> -->
              <v-btn icon @click="showFullScreen = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <PipePage
            :templateName="templateInfo.name"
            :templateDescription="templateInfo.description"
            :nodes="flowNodes"
            :edges="flowEdges"
            :updatedBy="templateInfo.updatedBy"
            @save="onEditTemplateTaskSave"
          />
        </v-card>
      </v-dialog>

    </template>

    <template #sidebar>
      <div class="sidebar-section" v-if="!loading && templateInfo">
        <InfoField label="작성자" icon="mdi-account" :value="templateInfo?.createdBy" />
        <InfoField label="생성일" icon="mdi-calendar" :value="templateInfo?.createdAt?.split('T')[0]" />
        <InfoField label="최종 수정일" icon="mdi-update" :value="templateInfo?.updatedAt?.split('T')[0]" />
        <InfoField label="총 소요 기간" icon="mdi-timer-sand" :value="templateInfo?.duration + ' 일'" />
        <InfoField label="전체 태스크 수" icon="mdi-format-list-numbered" :value="templateInfo?.taskCount + '개'" />
        <InfoField label="사용 중인 프로젝트" icon="mdi-folder-multiple" :value="templateInfo?.usingProjects + '개'" />
        <InfoField label="참여 부서" icon="mdi-office-building" :value="templateInfo?.deptList?.map(dept => dept.name).join(', ')" />
      </div>
    </template>
  </BasicLayout>
</template>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 50px;
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
  margin-bottom: 10px;
  width: 100%;
  text-align: left;
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
.flow {
  margin-bottom: 10px;
}
.sidebar-section {
  display: flex;
  flex-direction: column;
  /* gap: 10px; */
  border-radius: 20px;
  text-align: left;
  padding-top: 50px;
}
</style>
