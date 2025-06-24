<template>
  <BasicLayout>
    <template #main>
      <div class="page-title">프로젝트 생성</div>

      <!-- 프로젝트 이름 -->
      <div class="section-label">프로젝트 이름</div>
      <v-text-field
        v-model="projectName"
        placeholder="프로젝트 이름을 입력해주세요."
        variant="outlined"
        class="mb-4"
      />

      <!-- 프로젝트 설명 -->
      <div class="section-label">프로젝트 설명</div>
      <v-text-field
        v-model="projectDescription"
        placeholder="프로젝트 설명을 입력해주세요."
        variant="outlined"
        class="mb-4"
      />

      <!-- 시작/마감 베이스라인 -->
      <!-- 베이스라인 일정 -->
        <!-- <div class="section-label">베이스라인 일정</div> -->
        <v-container fluid class="pa-0">
        <v-row dense style="text-align: left;">
            <v-col cols="12" sm="6">
            <div class="baseline-label">시작 베이스라인</div>
            <div class="sub-label">목표로 하는 프로젝트 시작일</div>
            <v-text-field
                v-model="startDate"
                type="date"
                variant="outlined"
                density="compact"
                class="baseline-field"
            />
            </v-col>

            <v-col cols="12" sm="6">
            <div class="baseline-label">마감 베이스라인</div>
            <div class="sub-label">목표로 하는 프로젝트 마감일</div>
            <v-text-field
                v-model="endDate"
                type="date"
                variant="outlined"
                :min="startDate" 
                density="compact"
                class="baseline-field"
            />
            </v-col>
        </v-row>
        </v-container>


        <!-- <div class="section-label">프로젝트 설명</div> -->
        <v-row v-if="baseLineDuration > 0" class="text-caption" align="center" no-gutters>
        <v-col class="d-flex align-center" style="color: #1976D2;">
            <v-icon start>mdi-calendar-clock</v-icon>
            베이스라인 기준 소요일: {{ baseLineDuration }}일
        </v-col>
        </v-row>

        <!-- 템플릿 선택 목록 모달 -->
        <SelectedTemplateModal
            :show="showModal"
            :templates="templateList"
            @close="closeModal"
            @select="handleSelectTemplate"
         />

      <!-- 템플릿 적용 -->
        <div class="section-label" style="margin-top: 40px;">템플릿 적용</div>
        <div class="template-select-row">
            <!-- 템플릿 드롭다운 -->
            <v-text-field
                :model-value="selectedTemplate?.name || '선택 안 함'"
                readonly
                variant="outlined"
                density="comfortable"
                class="dropdown"
                style="cursor: pointer"
                append-inner-icon="mdi-menu-down"
                @click="openModal()"
                prepend-icon="mdi-folder-outline"
            />
            <!-- 선택 초기화 버튼 -->
            <v-btn
                variant="outlined"
                @click="resetSelection"
                class="basic-button"
            >
                선택 초기화
            </v-btn>

            <!-- 편집하기 버튼 -->
            <v-btn
                variant="outlined"
                prepend-icon="mdi-pencil-outline"
                @click="editTemplate"
                class="basic-button"
                :disabled="!selectedTemplate"
            >
                편집하기
            </v-btn>
        </div>

         <!-- 초과/부족 여부 메시지 -->
        <v-row v-if="durationDifference !== null" class="text-caption" align="center" no-gutters >
        <v-col v-if="durationDifference < 0" class="d-flex align-center" style="color: red;">
            <v-icon start>mdi-alert</v-icon>
            마감 베이스라인보다 {{ Math.abs(durationDifference) }}일 초과
        </v-col>

        <v-col v-else-if="durationDifference > 0" class="d-flex align-center" style="color: green;">
            <v-icon start>mdi-check-circle</v-icon>
            마감일 기준 여유 {{ durationDifference }}일
        </v-col>

        <v-col v-else class="d-flex align-center">
            <v-icon start>mdi-timer</v-icon>
            베이스라인과 딱 맞음
        </v-col>
        </v-row>


        <!-- 템플릿이 선택되었을 때만 보이게 -->
        <VueFlow
        v-if="selectedTemplate"
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
    

        <!-- 팀장 초대 -->
        <div class="section-label" style="margin-top: 40px;">프로젝트 팀장 초대</div>
        <div style="justify-content: flex-start; width: 100%; display :flex; flex-direction: row; margin-bottom: 20px; align-items: center; gap: 15px;">
        <v-btn @click="openLeaderModal('project')" size="small" style="width:fit-content; " variant="tonal" color="purple">구성원 조회</v-btn>
        <span style="font-size: 13px; color: gray;">프로젝트에 참여할 팀장을 선택해주세요.</span>
        </div>
        
        <div v-for="(users, dept) in groupedLeaders" :key="dept" class="mb-3" style="padding: 10px 20px; border: 1px solid #D9D9D9; border-radius: 5px; width :100%; height: fit-content;">
          <div class="text-subtitle-2 font-weight-medium mb-1" style="text-align: left;">{{ dept }}</div>
          <v-chip-group>
            <v-chip
              v-for="user in users"
              :key="user.id"
              closable
              class="participant-chip"
              @click:close="removeViewer(user.id)"
            >
              <v-icon size="20" class="mr-2">mdi-account-tie</v-icon>
              {{ user.name }} {{ user.jobRankName }}
            </v-chip>
          </v-chip-group>
        </div>
        
        <!-- 생성/취소 버튼 -->
        <div class="button-section">
            <!-- @click="cancelCreate" -->
          <v-btn variant="outlined" color="grey-darken-2" size="small" class="basic-button" @click="cancelCreate">
            <v-icon icon="mdi-delete-outline" class="mr-1" />
            생성 취소
          </v-btn>
          <v-btn size="small" class="color-button"  elevation="0" @click="checkSaveProject" :disabled="selectedTemplate && durationDifference < 0">
            <v-icon icon="mdi-pencil-outline" class="mr-1" />
            프로젝트 생성
          </v-btn>
        </div>
        <!-- 프로젝트 생성 확인 모달 -->
        <v-dialog v-model="showSaveCheck" max-width="600px" persistent>
          <v-card style="padding: 5%;">
            <v-card-title class="text-h6 font-weight-bold">프로젝트를 생성하시겠습니까?</v-card-title>
            <v-card-text style="display :flex; flex-direction: column; gap: 15px;">
              <div class="mb-3">
                <div class="section-label">📌 프로젝트명</div>
                <div class="check-item">{{ projectName }}</div>
              </div>

              <div class="mb-3">
                <div class="section-label" >👤 생성자 / 생성일</div>
                <div style="display :flex; flex-direction: row; gap: 10px; width :100%;">
                  <div class="check-item" style="width: 50%;">{{ createdBy }} </div> 
                  <div class="check-item" style="width: 50%;">{{ createdAt }}</div>
                </div>
              </div>

              <div class="mb-3">
                <div class="section-label">📅 시작 / 마감 베이스라인</div>
                <div style="display :flex; flex-direction: row; gap: 10px; width :100%;">
                  <div class="check-item" style="width: 50%;">{{ startDate }} </div> 
                  <div class="check-item" style="width: 50%;">{{ endDate }}</div>
                </div>
                <!-- <div>{{ startDate }} ~ {{ endDate }}</div> -->
              </div>

              <div class="mb-3">
                <div class="section-label">⏱️ 총 소요일 / 전체 태스크 수</div>
                <div style="display :flex; flex-direction: row; gap: 10px; width :100%;">
                  <div class="check-item" style="width: 50%;"> {{ duration || '-' }}일 </div> 
                  <div class="check-item" style="width: 50%;">{{ selectedTemplate ? taskCount : '-' }}개</div>
                </div>
              </div>

              <div class="mb-3">
                <div class="section-label">🏢 참여 부서</div>
                <div class="d-flex flex-wrap dept-chip-wrap mt-1">
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
            </v-card-text>

            <v-card-actions class="d-flex justify-end">
              <v-btn variant="text" @click="showSaveCheck = false">취소</v-btn>
              <v-btn class="color-button" @click="saveProject">확인</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


        <!-- 전체 보기 모달 -->
        <v-dialog v-model="showFullScreen" fullscreen persistent transition="dialog-bottom-transition">
            <v-card class="pa-4">
            <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h6">프로젝트 태스크 편집</h3>
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
                :templateName="projectName"
                :templateDescription="projectDescription"
                :nodes="flowNodes"
                :edges="flowEdges"
                :updatedBy="user?.id || user.id"
                @save="editProjectTask"
            />
            </v-card>
        </v-dialog>
        <!-- 팀장 초대 -->
        <ParticipantSelectModal
          v-if="showLeaderModal"
          :type="modalType"
          :userList="userList"
          :selectedLeaders="selectedLeaders"
          @close="showLeaderModal = false"
          @select="handleLeaderSelect"
        />
        
            
    
    
    </template>
    
    <!-- 우측 사이드바 -->
    <template #sidebar>
        <InfoField label="작성자" icon="mdi-account" :value="createdBy" />
        <InfoField label="생성일" icon="mdi-calendar" :value="createdAt" />
        <InfoField label="베이스라인 기준 소요일" icon="mdi-timer-sand" :value="baseLineDuration + ' 일'" />
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

    </template>
  </BasicLayout>
</template>

<script setup >
import BasicLayout from '@/components/layout/BasicLayout.vue';
import { computed } from 'vue'
import { ref , onMounted } from 'vue';
import dagre from '@dagrejs/dagre'
import api from '@/api.js'
import { Position } from '@vue-flow/core'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { markRaw } from 'vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import TemplateViewNode from '@/components/template/TemplateViewNode.vue'
import SelectedTemplateModal from '@/components/project/SelectTemplateModal.vue'
import InfoField from '@/components/common/SideInfoField.vue'
import ParticipantSelectModal from '@/components/approval/ParticipantSelectModal.vue'

import PipePage from '@/views/test/PipePage.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore';

const nodeTypes = {
  custom: markRaw(TemplateViewNode)
}

const user = useUserStore();
const router = useRouter();

// 프로젝트 작성 정보
const projectName = ref('');
const projectDescription = ref('');
const startDate = ref('');
const endDate = ref('');

// 베이스라인 소요일 계산
const baseLineDuration = computed(() => {
  if (!startDate.value || !endDate.value) return null;
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const diff = (end - start) / (1000 * 60 * 60 * 24);
  return diff + 1; // 시작일 포함
});

const durationDifference = computed(() => {
  if (!baseLineDuration.value || !duration.value) return null;
  return baseLineDuration.value - duration.value;
});

const formatDate = (date) => {
  const pad = (n) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}


// 자동 입력정보
const createdBy = ref(user?.deptName +" "+ user?.name +" "+ user?.jobRankName)
const createdAt = ref(formatDate(new Date()))
const duration = ref(0)
const taskCount = ref(0)


// 템플릿 선택 관련
const templateList = ref([])
const selectedTemplate = ref(null)
const nodeList = ref([])
const edgeList = ref([])

const vueFlowRef = ref(null)
const flowNodes = ref([])
const flowEdges = ref([])

const showModal = ref(false);
const showFullScreen = ref(false)   // 플로우 차트 전체 화면으로 보기 
const showSaveCheck = ref(false)    // 프로젝트 생성 확인 모달 


// 팀장 초대
const showLeaderModal = ref(false)
const modalType = ref('') // 'project'
const selectedLeaders = ref([])
const userList = ref([])    // 초대 가능 유저 



// 참여 부서 (템플릿 + 팀장 초대)
const usedDeptList = computed(() => {
  const deptSet = new Map()

  // 1. 템플릿 노드의 부서
  const nodes = Array.isArray(flowNodes.value) ? flowNodes.value : []
  nodes
    .flatMap(node => node.data?.deptList || [])
    .forEach(d => {
      const id = d.id ?? d.deptId ?? d
      const name = d.name ?? d.deptName ?? d
      if (id && !deptSet.has(id)) {
        deptSet.set(id, { id, name })
      }
    })

  // 2. 선택된 팀장의 부서
  selectedLeaders.value.forEach(user => {
    const dept = {
      id: user.deptId ?? user.deptName, // deptId가 없다면 name로 fallback
      name: user.deptName
    }
    if (dept.id && !deptSet.has(dept.id)) {
      deptSet.set(dept.id, dept)
    }
  })

  return Array.from(deptSet.values())
})

//  초대 가능한 유저 목록 가져오기
const fetchUserList = async () => {
  const res = await api.get(`/api/users/find-all`)
  console.log("초대 가능 유저 확인", res.data.data)
  return res.data.data;
}


// 템플릿 리스트 가져오기 
const fetchTemplates = async () => {
  const res = await api.get('/api/template/list');
  console.log("템플릿 리스트 확인", res.data.data);
  return res.data.data;
};

// 팀장 초대 모달 열기
function openLeaderModal(type) {
    modalType.value = type
    showLeaderModal.value = type
}

// 팀장 선택 관리
function handleLeaderSelect(selectedUsers) {
  selectedLeaders.value = selectedUsers || []
  showLeaderModal.value = false
}

// 선택한 팀장 그룹핑해서 보여주기 
const groupedLeaders = computed(() => {
  const groups = {}
  selectedLeaders.value.forEach(user => {
    const dept = user.deptName || '기타'
    if (!groups[dept]) groups[dept] = []
    groups[dept].push(user)
  })
  return groups
})

// 
onMounted(async () => {
  try {
    templateList.value  = await fetchTemplates();   
    userList.value = await fetchUserList();

  } catch (err) {
    console.error("템플릿 목록 불러오기 실패", err);
  }
});

// 초기화
const resetSelection = () => {
  selectedTemplate.value = null
}

// 편집 버튼 클릭
const editTemplate = () => {
//   if (!selectedTemplate.value) {
//     alert('편집할 프로젝트을 먼저 선택해주세요.')
//     return
//   }
  // 편집 로직 연결
  console.log('편집:', selectedTemplate.value)
  showFullScreen.value = true
}

// 템플릿 선택 모달
const openModal = () => {
  if (!startDate.value || !endDate.value) {
    alert("시작일과 마감일을 먼저 입력해주세요.");
    return;
  }
  showModal.value = true;
};

// 프로젝트 생성 확인 모달
const checkSaveProject = () => {
   // 🔸 공통 필수 입력값 검사
    if (!projectName.value || !startDate.value || !endDate.value) {
      alert('프로젝트 이름과 시작/마감일을 입력해주세요.');
      return;
    }

    // 🔸 템플릿을 사용하지 않는 경우, 팀장은 필수
    if (!selectedTemplate.value && selectedLeaders.value.length === 0) {
      alert('템플릿을 사용하지 않는 경우, 팀장 초대는 필수입니다.');
      return;
    }
    showSaveCheck.value = true;
}

const closeModal = () => {
  showModal.value = false
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



// 선택한 프로젝트 정보 가져와서 노드 리스트 가져오기 
const handleSelectTemplate = async (template) => {
  console.log("선택한 템플릿은", template.id)

  try {
    showModal.value = false;
    const res = await api.get(`/api/template/${template.id}`)
    const data = res.data.data

    // selectedTemplate.value = templateList.value.find(t => t.id === template.id)
    selectedTemplate.value = template 

    nodeList.value = data.templateData.nodeList
    edgeList.value = data.templateData.edgeList

    taskCount.value = nodeList.value.length;
    duration.value = nodeList.value.reduce((total, node) => {
      return total + (node.data?.duration || 0) + (node.data?.slackTime || 0);
    }, 0);

    console.log('템플릿 상세 정보 가져옴', data)

    convertToFlowData()
  } catch (err) {
    console.error(`템플릿 정보 가져오기 실패!`, err)
  }
}


// 템플릿 데이터 파싱
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
        // ✅ deptList 정규화 추가
        deptList: (node.data.deptList || []).map(d =>
          typeof d === 'string' ? { name: d } : d
        ),
        highlight: false,
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

// 프로젝트 생성
const saveProject = async () => {
   

  const payload = {
    name: projectName.value,
    description: projectDescription.value,
    startBase: startDate.value,
    endBase: endDate.value,
    leaderIds: [1, 3],        // 임시값 (미구현)
    directorId: user.id       // 현재 로그인 사용자
  };

  // ✅ 템플릿 적용된 경우
  if (selectedTemplate.value) {
    payload.templateId = selectedTemplate.value.id;
    payload.endExpect = endDate.value;

    payload.templateData = {
      nodeList: flowNodes.value.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
        label: n.data.label,
        description: n.data.description,
        slackTime: n.data.slackTime,
        deptList: n.data.deptList,
        startBaseLine: n.data.startBaseLine || startDate.value, // ✅ 추가
        endBaseLine: n.data.endBaseLine || endDate.value        // ✅ 추가
        }
    })),
      edgeList: flowEdges.value.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type
      }))
    };
  }

  try {
    const res = await api.post('/api/projects', payload);
    console.log('✅ 프로젝트 생성 성공:', res.data);
    alert('프로젝트가 성공적으로 생성되었습니다!');
    router.push('/project/list'); // 또는 다른 이동 경로
  } catch (err) {
    console.error('🚫 프로젝트 생성 실패:', err);
    alert('프로젝트 생성에 실패했습니다. 관리자에게 문의하세요.');
  }
};



// 프로젝트 태스크 편집 완료 후 반영
const editProjectTask = (payload) => {
  console.log("편집된 노드", payload)

  flowNodes.value = Array.isArray(payload.nodeList) ? [...payload.nodeList] : []
  flowEdges.value = Array.isArray(payload.edgeList) ? [...payload.edgeList] : []

  nodeList.value = flowNodes.value
  edgeList.value = flowEdges.value

  // ✅ 총 소요일 및 태스크 수 갱신
  taskCount.value = flowNodes.value.length;
  duration.value = flowNodes.value.reduce((total, node) => {
    return total + (node.data?.duration || 0) + (node.data?.slackTime || 0);
  }, 0);

  showFullScreen.value = false;
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: left;
}

.section-label {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 10px;
  text-align: left;
}

.baseline-label {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 4px;
}

.sub-label {
  font-size: 12px;
  color: gray;
  margin-bottom: 6px;
}

.baseline-field {
  width: 100%;
}

.baseline-row {
  gap: 16px;
  display: flex; flex-direction: row;
}

.template-select-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-select {
  width: 360px;
}

/* 파이프라인 뷰 */
.template-flow {
  height: 300px;
  background-color: #ffffff;
  border: 1px solid #ddd;
  margin-top: 16px;
  border-radius: 10px;
}

/* 하단 생성 버튼 영역 */
.button-section {
  width: 100%;
  margin-top: 50px;
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
  background-color: #7578ee;
  color: white;
  font-weight: 600;
  font-size: 12px;
  height: 36px;
  padding: 0 14px;
  line-height: 1.6;
}
/* 전체 보기 모달 */
.fullscreen-flow {
  height: calc(100vh - 80px);
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
}
/* 부서 칩 */
.dept-chip-wrap {
  gap: 8px; 
}
.check-item {
  padding: 10px 20px;
  background-color: #EEEFFA;
  border-radius: 5px;
}

</style>
