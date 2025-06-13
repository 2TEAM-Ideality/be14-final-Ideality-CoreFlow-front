<script setup lang="ts">
import BasicLayout from '@/components/layout/BasicLayout.vue';
import { ref, onMounted, watch } from 'vue'
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

const nodeTypes = {
    custom: TemplateViewNode
}

const route = useRoute()
const router = useRouter()
const templateId = ref(route.params.id)

const templateInfo = ref(null)
const nodeList = ref([])
const edgeList = ref([])
const flowNodes = ref([])
const flowEdges = ref([])
const vueFlowRef = ref(null)

const fetchTemplate = async () => {
    const res = await api.get(`/api/template/${templateId.value}`)
    const data = res.data.data
    console.log(data);

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

function goToEditTask() {
    // 태스크 수정 페이지로 이동 
    router.push(`/template/edit/task/${templateId.value}`)
}
// 수정 완료
function saveEditedTemplate () {
    
}

// 수정 취소
const cancelEdit = () => {
    router.back()  
}



</script>

<template>
    <BasicLayout>
        <template #main >
            <div class="page-title">
            템플릿 수정
            </div>

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
                @click="cancelEdit"
                >
                <v-icon icon="mdi-delete-outline" class="mr-1" />
                초기화
                </v-btn>

                <v-btn
                variant="outlined"
                color="grey-darken-2"
                size="small"
                class="basic-button"
                @click="goToEditTask"
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
                <v-btn
                variant="outlined"
                color="grey-darken-2"
                size="small"
                class="basic-button"
                @click="cancelEdit"
                >
                <v-icon icon="mdi-delete-outline" class="mr-1" />
                수정 취소
                </v-btn>

                <v-btn
                size="small"
                class="color-button"
                @click="saveEditedTemplate"
                elevation = '0'
                >
                <v-icon icon="mdi-pencil-outline" class="mr-1" />
                수정 완료
                </v-btn>
            </div>
        </template>

        <!-- 오른쪽 영역 -->
        <template #sidebar>
            <div class="sidebar-section">
                <div>
                    <InfoField label="작성자" icon="mdi-account" :value="templateInfo?.createdBy" />
                    <InfoField label="생성일" icon="mdi-calendar" :value="templateInfo?.createdAt?.split('T')[0]" />
                    <InfoField label="최종 수정일" icon="mdi-update" :value="templateInfo?.updatedAt?.split('T')[0]" />
                    <InfoField label="총 소요 기간" icon="mdi-timer-sand" :value="templateInfo?.duration + ' 일'" />
                    <InfoField label="전체 태스크 수" icon="mdi-format-list-numbered" :value="templateInfo?.taskCount + '개'" />
                    <InfoField label="사용 중인 프로젝트" icon="mdi-folder-multiple" :value="templateInfo?.usingProjects + '개'" />
                    <InfoField
                    label="참여 부서"
                    icon="mdi-office-building"
                    :value="templateInfo?.deptList?.map(dept => dept.name).join(', ')"
                    />
                </div>
            </div>
        </template> 
    </BasicLayout>
</template>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom : 50px;
  text-align: left;
}

/* flow */
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
    width: fit-content;
    text-align: left;
}

/* 버튼  */
.button-section {
  width :100%;
  display:flex;
  flex-direction : row;
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
  display:flex;
  flex-direction : column;
  gap: 30px;
  border-radius: 20px;
  text-align: left;
  padding-top: 50px;
}

.sidebar-section-label {
  font-weight: 500;
  font-size: 15px;
  margin-bottom : 10px;
  text-align: left;
}

.sidebar-input {
  width: 100%;
  padding: 12px 16px;
  height : 40px;
  font-size: 14px;
  font-family: 'Inter';
  border: 1px solid #D9D9D9;
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #1E1E1E;
  text-align: left;
}


</style>