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
              :error="isStartHoliday"
              :error-messages="isStartHoliday ? ['휴일은 선택할 수 없습니다.'] : []"
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
              :error="isEndHoliday"
              :error-messages="isEndHoliday ? ['휴일은 선택할 수 없습니다.'] : []"
            />

            </v-col>
        </v-row>
        </v-container>


        <!-- <div class="section-label">프로젝트 설명</div> -->
        <v-row v-if="baseLineDuration > 0" class="text-caption" align="center" no-gutters>
        <v-col class="d-flex align-center" style="color: #1976D2;">
          <v-icon start>mdi-calendar-clock</v-icon>
          워크 데이 기반 소요일:   <span><strong> {{ workingDuration }}일</strong></span>
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
        <!-- 템플릿 소요일 표시 -->
        <div style="display: flex; flex-direction: row; align-items: flex-start; gap: 8px;">
          <!-- 워크데이 / 템플릿 소요일 -->
           <div v-if="selectedTemplate" style="display: flex; gap: 8px; align-items: center;">
             <!-- 템플릿 소요일 항상 표시 -->
             <div class="text-caption d-flex align-center" style="color: #757575;">
               <v-icon start>mdi-calendar-range</v-icon>
               템플릿 소요일: <strong>{{ criticalDuration }}일</strong>
             </div>
             </div>

          <!-- 초과/부족 여부 메시지 -->
          <div v-if="selectedTemplate && workingDuration !== null">
            <div v-if="criticalDuration === workingDuration">
              <v-icon start>mdi-timer</v-icon>
              베이스라인과 딱 맞음
            </div>
            <div v-else-if="criticalDuration < workingDuration">
              <v-icon start color="green">mdi-check-circle</v-icon>
              여유시간 {{ workingDuration - criticalDuration }}일
            </div>
            <div v-else>
              <v-icon start color="red">mdi-alert</v-icon>
              워크데이가 {{ criticalDuration - workingDuration }}일 부족합니다
            </div>
          </div>

        </div>

      

          


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
    

        <!-- 부서별 담당자 초대 -->
        <div class="section-label" style="margin-top: 40px;">부서별 담당자 초대</div>
        <div style="justify-content: flex-start; width: 100%; display :flex; flex-direction: row; margin-bottom: 20px; align-items: center; gap: 15px;">
        <v-btn 
        @click="openLeaderModal('project')" 
        size="small" style="width:fit-content; " variant="tonal" color="#7578ee"
        >
          구성원 조회</v-btn>
        <span style="font-size: 13px; color: gray;">부서 담당자를 선택해주세요.</span>
        </div>
        
        <div v-for="(users, dept) in groupedLeaders" :key="dept" class="mb-3" style="padding: 10px 20px; border: 1px solid #D9D9D9; border-radius: 5px; width :100%; height: fit-content;">
          <div class="text-subtitle-2 font-weight-medium mb-1" style="text-align: left;">{{ dept }}</div>
          <v-chip-group>
            <v-chip
              v-for="user in users"
              :key="user.id"
              closable
              class="participant-chip"
              @click:close="removeLeader(user.id)"
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
              </div>

              <div class="mb-3">
                <div class="section-label">⏱️ 워크데이 기준 총 소요일 / 전체 태스크 수</div>
                <div style="display :flex; flex-direction: row; gap: 10px; width :100%;">
                  <div class="check-item" style="width: 50%;"> {{ workingDuration || '-' }}일 </div> 
                  <div class="check-item" style="width: 50%;">{{ selectedTemplate ? taskCount : '-' }}개</div>
                </div>
              </div>

              <div class="mb-3">
                <div class="section-label">🏢 참여 부서</div>
                <div class="d-flex flex-wrap dept-chip-wrap mt-1">
                  <v-chip-group  multiple column>
                    <v-chip
                      v-for="dept in usedDeptList"
                      :key="dept.id"
                      size="small"
                      color="primary"
                      variant="tonal"
                    >
                      {{ dept.name }}
                    </v-chip>
                  </v-chip-group>
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
          :mustSelectDept="usedDeptList.map(dept => dept.id)"  
          @close="showLeaderModal = false"
          @select="handleLeaderSelect"
        />
    
    </template>
    
    <!-- 우측 사이드바 -->
    <template #sidebar>
        <InfoField label="작성자" icon="mdi-account" :value="createdBy" />
        <InfoField label="생성일" icon="mdi-calendar" :value="createdAt" />
        <InfoField label="워크데이 기반 소요일" icon="mdi-timer-sand" :value="workingDuration + ' 일'" />
        <InfoField label="전체 태스크 수" icon="mdi-format-list-numbered" :value="taskCount + '개'" />
        <div>
              <div class="sidebar-section-label">
                <span class="icon-wrapper">
                  <v-icon size="18">mdi-domain</v-icon>
                </span>
                <span>참여 부서</span>
              </div>
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
import { computed, watch, ref , onMounted, markRaw, nextTick  } from 'vue'
import dagre from '@dagrejs/dagre'
import { Position } from '@vue-flow/core'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import TemplateViewNode from '@/components/template/TemplateViewNode.vue'
import SelectedTemplateModal from '@/components/project/SelectTemplateModal.vue'
import InfoField from '@/components/common/SideInfoField.vue'
import ParticipantSelectModal from '@/components/approval/ParticipantSelectModal.vue'
import PipePage from '@/views/test/PipePage.vue'

import api from '@/api.js'

import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import { mdiConsoleNetworkOutline } from '@mdi/js';

const nodeTypes = {
  custom: markRaw(TemplateViewNode)
}

const user = useUserStore();
const router = useRouter();

const criticalDuration = computed(() => calculateCriticalPathDuration(flowNodes.value, flowEdges.value));

// 소요일 계산
const calculateCriticalPathDuration = (nodes, edges) => {
  const taskMap = new Map()
  nodes.forEach(n => taskMap.set(n.id, n))

  const inDegree = new Map()
  const graph = new Map()
  nodes.forEach(n => {
    inDegree.set(n.id, 0)
    graph.set(n.id, [])
  })

  edges.forEach(e => {
    graph.get(e.source).push(e.target)
    inDegree.set(e.target, inDegree.get(e.target) + 1)
  })

  const queue = []
  const longestPath = new Map()

  inDegree.forEach((deg, id) => {
    if (deg === 0) {
      const n = taskMap.get(id)
      const d = (n.data?.duration || 0) + (n.data?.slackTime || 0)
      longestPath.set(id, d)
      queue.push(id)
    }
  })

  while (queue.length) {
    const curr = queue.shift()
    const currTime = longestPath.get(curr)

    for (const next of graph.get(curr)) {
      const n = taskMap.get(next)
      const d = (n.data?.duration || 0) + (n.data?.slackTime || 0)
      const prevTime = longestPath.get(next) || 0
      longestPath.set(next, Math.max(prevTime, currTime + d))
      inDegree.set(next, inDegree.get(next) - 1)
      if (inDegree.get(next) === 0) queue.push(next)
    }
  }

  return Math.max(...longestPath.values())
}


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
  const d1 = Number(selectedTemplate.value?.duration)
  const d2 = Number(workingDuration.value)
  if (isNaN(d1) || isNaN(d2)) return null
  return d2 - d1  // ✅ (+면 여유, 0이면 딱맞음, -면 부족)
})

const formatDate = (date) => {
  const pad = (n) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 베이스라인 휴일 여부
const holidaySet = ref(new Set());  // 전체 휴일 정보 
const isStartHoliday = ref(false)
const isEndHoliday = ref(false)
const isNotHoliday = (date) => {
  return !holidayList.value.has(date);
};

const holidayList = computed(() => Array.from(holidaySet.value)); // ["2025-06-25", "2025-07-01", ...]

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



// 참여 부서 (템플릿 + 팀장 초대) -> 중복 제거
 const usedDeptList = computed(() => {
   const deptMap = new Map();

  // ✅ 1. 템플릿 노드에 있는 부서 먼저 추가 (삭제)
  const templateDeptIds = new Set();

  const nodes = Array.isArray(flowNodes.value) ? flowNodes.value : [];
  nodes.flatMap(node => node.data?.deptList || []).forEach(d => {
    const id = d.id ?? d.deptId;
    const name = d.name ?? d.deptName;
    if (id && !deptMap.has(id)) {
      deptMap.set(id, { id, name });
      templateDeptIds.add(id);
    }
  });

   // ✅ 2. 팀장 초대(selectedLeaders) 에서만 추가
   selectedLeaders.value.forEach(user => {
     const id = user.deptId;
     const name = user.deptName;
     if (id && !deptMap.has(id)) {
       deptMap.set(id, { id, name });
     }
   });

   return Array.from(deptMap.values());
 });

console.log('참여 부서', usedDeptList)
// 참여 팀장 삭제
function removeLeader(id) {
  selectedLeaders.value = selectedLeaders.value.filter(user => user.id !== id)
}

//  초대 가능한 유저 목록 가져오기
const fetchUserList = async () => {
  const res = await api.get(`/api/users/find-all`);
  const allUsers = res.data.data;

  console.log('모든 유저 가져온 것', allUsers)
  // 'admin' 팀은 제외
  const filteredUsers = allUsers.filter(user => user.deptName?.toLowerCase() !== 'admin');
  console.log("초대 가능 유저 (admin 제외):", filteredUsers);
  return filteredUsers;
}

// 워크 데이 기반 -> 휴일 체크
// 전체 휴일 정보 가져오기 
const fetchAllHolidays = async () => {
  try {
    console.log("📡 공휴일 요청 시작");
    const res = await api.get('/api/holidays');

    const list = res.data?.data?.holidays || [];  // ✅ 핵심 수정
    holidaySet.value = new Set(list.map(h => h.date)); // ✅ date만 추출해서 Set으로

    console.log("✅ 공휴일 로딩 완료:", holidaySet.value);
  } catch (err) {
    console.error('❌ 공휴일 로딩 실패:', err);
  }
};

// 선택 날짜가 휴일인지 확인
const checkIfHoliday = async (dateStr) => {
  if (!dateStr) return false;
  try {
    const res = await api.get(`/api/holidays/check?date=${dateStr}`);
    return res.data?.data?.isHoliday || false;
  } catch (err) {
    console.error('🚫 휴일 확인 실패:', err);
    return false;
  }
};

// 워크데이 기반 소요일 계산
const workingDuration = computed(() => {
  if (!startDate.value || !endDate.value) return null;

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  let count = 0;
  const date = new Date(start);

  const holidays = holidaySet.value; // Set<string>

  while (date <= end) {
    const iso = date.toISOString().slice(0, 10);
    const day = date.getDay(); // 일(0), 토(6)
    const isWeekend = day === 0 || day === 6;
    
    const isHoliday = holidays.has(iso);

    if (!isWeekend && !isHoliday) {
      count++;
    }
    date.setDate(date.getDate() + 1);
  }

  return count;
});


// 시작-마감 베이스라인 정보 감지
watch(startDate, async (newVal) => {
  isStartHoliday.value = false;
  if (!newVal) return;

  const date = new Date(newVal);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isHoliday = await checkIfHoliday(newVal);

  isStartHoliday.value = isWeekend || isHoliday;
});


watch(endDate, async (newVal) => {
  isEndHoliday.value = false;
  if (!newVal) return;

  const date = new Date(newVal);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isHoliday = await checkIfHoliday(newVal);

  isEndHoliday.value = isWeekend || isHoliday;
});

// -----------------------------------------------------------------



// 템플릿 리스트 가져오기 
const fetchTemplates = async () => {
  console.log('✅템플릿 리스트 요청')
  const res = await api.get('/api/template/list');
  console.log("✅템플릿 리스트 확인", res.data.data);
  return res.data.data;
};

// 선택한 템플릿의 총 소요일 (duration + slackTime)
const templateDuration = computed(() => {
  return flowNodes.value.reduce((total, node) => {
    return total + (node.data?.duration || 0) + (node.data?.slackTime || 0);
  }, 0);
});


// 선택 가능한 유저 목록 필터링
const availableLeaderCandidates = computed(() => {
  if (!selectedTemplate.value) {
    // 템플릿이 없으면 전체 유저 목록에서 필터 없이 리턴
    return userList.value;
  }

  console.log('템플릿 선택 후 확인:', usedDeptList.value);

  // 이미 사용된 부서 이름을 Set으로 저장
  const usedDeptNames = new Set(
    usedDeptList.value.map(d => d.name)
  );

  // 사용된 부서에 속하지 않은 유저만 리턴
  return userList.value.filter(user => {
    return !usedDeptNames.has(user.deptName);
  });
});


// 팀장 초대 모달 열기
function openLeaderModal(type) {
  // const available = availableLeaderCandidates.value
  const available = userList.value
  console.log('모달에 전달할 리스트', userList.value)
  if (!available || available.length === 0) {
    alert('초대할 수 있는 팀장이 없습니다.');
    return;
  }
  modalType.value = type;
  showLeaderModal.value = true;
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


onMounted(async () => {
  try {
    await fetchAllHolidays();
  } catch (err) {
    console.error('❌ 공휴일 로딩 실패:', err);
  }

  try {
    templateList.value = await fetchTemplates();
  } catch (err) {
    console.error('❌ 템플릿 로딩 실패:', err);
  }

  try {
    userList.value = await fetchUserList();
  } catch (err) {
    console.error('❌ 유저 로딩 실패:', err);
  }
});


// 템플릿 선택 초기화
const resetSelection = async () => {
  selectedTemplate.value = null
  nodeList.value = []
  edgeList.value = []
  flowNodes.value = []
  flowEdges.value = []
  taskCount.value = 0
  duration.value = 0
  selectedLeaders.value = []

  // ❗️선택 초기화 후 초대 유저 목록을 갱신
  userList.value = await fetchUserList()

  await nextTick()
  console.log('💡 resetSelection 이후 usedDeptList:', usedDeptList.value)
  console.log('💡 초대 가능한 유저 목록:', availableLeaderCandidates.value)
}

watch(usedDeptList, (newVal) => {
  console.log('📌 usedDeptList 변경됨:', newVal)
  console.log('👉 초대 가능한 유저:', availableLeaderCandidates.value)
})




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
const checkSaveProject = async () => {
  // 1) 공통 필수 입력값 검사
  if (!projectName.value || !startDate.value || !endDate.value) {
    alert('프로젝트 이름과 시작/마감일을 입력해주세요.');
    return;
  }

  // 2) 템플릿을 사용하지 않는 경우 팀장은 필수
  if (!selectedTemplate.value && selectedLeaders.value.length === 0) {
    alert('템플릿을 사용하지 않는 경우, 팀장 초대는 필수입니다.');
    return;
  }

  // 4) 템플릿을 사용하는 경우, 부서별 팀장 최소 1명 검사
  if (selectedTemplate.value) {
    // -- 1) 템플릿에 포함된 부서 이름 집합
    const requiredDeptNames = new Set();
    flowNodes.value.forEach(node => {
      (node.data.deptList || []).forEach(d => {
        const name = d.name ?? d.deptName;
        if (name) requiredDeptNames.add(name);
      });
    });

    // -- 2) 선택된 팀장들의 부서 이름 집합
    const selectedDeptNames = new Set(
      selectedLeaders.value.map(u => u.deptName)
    );

    // -- 3) 빠진 부서가 있는지 확인
    const missing = Array.from(requiredDeptNames)
                        .filter(name => !selectedDeptNames.has(name));

    if (missing.length > 0) {
      alert(`다음 부서에 팀장을 선택해주세요: ${missing.join(', ')}`);
      return;
    }
  }

  // 모든 검증 통과 시 확인 모달 열기
  showSaveCheck.value = true;
};

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



// 선택한 템플릿 정보 가져와서 노드 리스트 가져오기 
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

    await convertToFlowData()
  } catch (err) {
    console.error(`템플릿 정보 가져오기 실패!`, err)
  }
}
    // autoSelectLeadersFromTemplate()


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

// 
// 날짜 유틸
// 날짜 더하는 유틸
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// 프로젝트 생성
const saveProject = async () => {
   
  const payload = {
    name: projectName.value,
    description: projectDescription.value,
    startBase: startDate.value,
    endBase: endDate.value,
    leaderIds: selectedLeaders.value.map(user => user.id),   
    directorId: user.id       // 현재 로그인 사용자
  };

  // 슬랙 타임 수정 
  // 날짜 → yyyy-mm-dd 포맷
  const formatDate = (date) => date.toISOString().slice(0, 10);

  // 태스크 ID → 태스크 맵
  const taskMap = new Map();
  flowNodes.value.forEach(node => taskMap.set(node.id, node));

  // 인접 리스트 구성
  const inDegree = new Map();
  const graph = new Map();
  flowNodes.value.forEach(n => {
    inDegree.set(n.id, 0);
    graph.set(n.id, []);
  });

  flowEdges.value.forEach(e => {
    graph.get(e.source).push(e.target);
    inDegree.set(e.target, inDegree.get(e.target) + 1);
  });

  // 시작일 기준
  const baseDate = new Date(startDate.value);
  const taskDates = new Map(); // { id -> {start, end} }

  // 위상 정렬 + 날짜 계산
  const queue = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) {
      const node = taskMap.get(id);
      const duration = node.data?.duration || 0;
      const start = new Date(baseDate);
      const end = addWorkingDays(start, duration);
      taskDates.set(id, { start, end });
      queue.push(id);
    }
  });

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentEnd = taskDates.get(currentId).end;
    const slack = taskMap.get(currentId).data?.slackTime + 1 || 0;
    const availableStart = addSlackWorkingDays(currentEnd, slack);

    for (const nextId of graph.get(currentId)) {
      const prev = taskDates.get(nextId)?.start;
      if (!prev || availableStart > prev) {
        // 최신 availableStart로 갱신
        const node = taskMap.get(nextId);
        const duration = node.data?.duration || 0;
        const end = addWorkingDays(availableStart, duration);
        taskDates.set(nextId, { start: availableStart, end });
      }

      inDegree.set(nextId, inDegree.get(nextId) - 1);
      if (inDegree.get(nextId) === 0) {
        queue.push(nextId);
      }
    }
  }

  // 최종 nodeList 생성
  const adjustedNodeList = flowNodes.value.map(n => {
    const dates = taskDates.get(n.id);
    return {
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        label: n.data.label,
        description: n.data.description,
        deptList: n.data.deptList,
        slackTime: n.data.slackTime,
        duration: n.data.duration,
        startBaseLine: formatDate(dates.start),
        endBaseLine: formatDate(dates.end)
      }
    };
  });
  // ✅ 템플릿 적용된 경우
  if (selectedTemplate.value) {
    payload.templateId = selectedTemplate.value.id;
    payload.endExpect = endDate.value;

    payload.templateData = {
      nodeList: adjustedNodeList,

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
    console.log('✅ 프로젝트 생성 요청', payload)
    console.log('✅ 프로젝트 생성 성공:', res.data);
    alert('프로젝트가 성공적으로 생성되었습니다!');
    router.push('/project/list'); // 또는 다른 이동 경로
  } catch (err) {
    console.error('🚫 프로젝트 생성 실패:', err);
    alert('프로젝트 생성에 실패했습니다. 관리자에게 문의하세요.');
  }
};

const addWorkingDays = (startDate, workDays) => {
  const start = new Date(startDate);
  let addedDays = 0;

  const date = new Date(start)
  const holidays = holidaySet.value;
  while (addedDays < workDays) {
    const iso = date.toISOString().slice(0, 10);
    const day = date.getDay(); // 일(0), 토(6)
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.has(iso);
    
    if (!isWeekend && !isHoliday) {
      addedDays++;
    }
    if (addedDays < workDays) {
      date.setDate(date.getDate() + 1);
    }
  }

  return date;
}

const addSlackWorkingDays = (endDate, slack) => {
  let addedDays = 0;

  const date = new Date(endDate)
  date.setDate(date.getDate() + 1)

  const holidays = holidaySet.value;
  while (addedDays < slack) {
    const iso = date.toISOString().slice(0, 10);
    const day = date.getDay(); // 일(0), 토(6)
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.has(iso);
    
    if (!isWeekend && !isHoliday) {
      addedDays++;
    }
    if (addedDays < slack) {
      date.setDate(date.getDate() + 1);
    }
  }

  return date;
}


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
.leftAndRight{
  display: flex;
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
</style>