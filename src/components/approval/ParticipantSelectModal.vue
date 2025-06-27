<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  type: String, // 'approver' | 'viewer' | 'project' | 'leader' | 'member'
  userList: {
    type: Array,
    default: () => []
  },
  selectedApprover: {
    type: Array,
    default: () => []
  },
  selectedViewers: {
    type: Array,
    default: () => []
  },
  selectedLeaders: {
    type: Array,
    default: () => []
  },
  selectedMembers: {
    type: Array,
    default: () => []
  },
  mustSelectDept: {
    type: Array,
    default: () => []
  }
})

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['close', 'select'])

const projectId = route.params.id

const dialog = ref(true)
const search = ref('')
const selectedUserId = ref(null)
const selectedUserIds = ref([])
const openedPanels = ref([])

const isApprover = computed(() => props.type === 'approver')
const isMultiSelect = computed(() =>
  ['viewer', 'project', 'leader', 'member'].includes(props.type)
)

// 1) 초기 선택 세팅 함수
function initSelection() {
  if (isApprover.value) {
    // 결재자 모드
    selectedUserId.value = props.selectedApprover?.[0]?.id ?? null;
  } else {
    // 다중 선택 모드: viewers, leaders, members 중 하나만 쓰이도록
    const list =
      (props.selectedViewers?.length && props.selectedViewers) ||
      (props.selectedLeaders?.length && props.selectedLeaders) ||
      (props.selectedMembers?.length && props.selectedMembers) ||
      [];    // 모두 없으면 빈 배열

    selectedUserIds.value = list.map(u => u.id ?? u.userId);
  }
}

// 2) 사용자 그룹핑 & 검색
const groupedUsers = computed(() => {
  const groups = {}
  props.userList.forEach(user => {
    const dept = user.deptName || '기타'
    groups[dept] = groups[dept] || []
    groups[dept].push(user)
  })
  const filtered = {}
  for (const dept in groups) {
    filtered[dept] = groups[dept].filter(user =>
      user.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }
  return filtered
})

// 3) 우측에 표시할 선택된 유저 목록
const selectedUsers = computed(() => {
  if (isApprover.value) {
    return props.userList.filter(
      u => (u.id ?? u.userId) === selectedUserId.value
    )
  }
  return props.userList.filter(u =>
    selectedUserIds.value.includes(u.userId ?? u.id)
  )
})

function removeUser(id) {
  if (isApprover.value) {
    selectedUserId.value = null
  } else {
    selectedUserIds.value = selectedUserIds.value.filter(uid => uid !== id)
  }
}

// 체크박스 전체/부분선택 상태
function isAllSelected(dept) {
  const users = groupedUsers.value[dept]
  return users.length > 0 && users.every(u =>
    selectedUserIds.value.includes(u.id)
  )
}
function isIndeterminate(dept) {
  const users = groupedUsers.value[dept]
  const sel = users.filter(u => selectedUserIds.value.includes(u.id))
  return sel.length > 0 && sel.length < users.length
}

// 필수 부서 강조
function isDeptRequired(users) {
  const deptId = users[0]?.deptId
  return props.mustSelectDept.includes(deptId)
}

// 그룹 토글
function toggleGroup(dept) {
  const ids = groupedUsers.value[dept].map(u => u.id ?? u.userId)
  if (isAllSelected(dept)) {
    selectedUserIds.value = selectedUserIds.value.filter(id => !ids.includes(id))
  } else {
    ids.forEach(id => {
      if (!selectedUserIds.value.includes(id)) selectedUserIds.value.push(id)
    })
  }
}

// 결재자 라디오 토글
function toggleRadio(userId) {
  selectedUserId.value = selectedUserId.value === userId ? null : userId
}

// 선택 확인
function confirmSelection() {
  const selected = selectedUsers.value;

  if (props.type === 'leader' && props.mustSelectDept.length) {
    console.log(props.mustSelectDept)
    // deptName 으로 비교
    const selectedDeptNames = new Set(selected.map(u => u.deptName));
    const missing = props.mustSelectDept.filter(
      deptName => !selectedDeptNames.has(deptName)
    );
    if (missing.length) {
      alert('템플릿에 사용된 모든 부서에 대해 최소 한 명의 팀장을 선택하세요.');
      return;
    }
  }

  emit('select', selected);
  dialog.value = false;
  emit('close');
}


// 탭 이동
function goToCreateTask() {
  dialog.value = false
  router.push(`/project/${projectId}/pipeline`)
}

function handleCancel() {
  dialog.value = false    // 내부 다이얼로그 상태를 닫고
  emit('close')           // 부모에게도 닫힘을 알려줍니다
}


// expansion panels 자동 열기
watch(groupedUsers, groups => {
  openedPanels.value = Object.keys(groups)
    .map((_, i) => i)
    .filter(i => groups[Object.keys(groups)[i]].length)
})

// 다이얼로그 열고 닫힐 때, 그리고 prop 변경될 때만 초기화
onMounted(initSelection)
watch(() => props.selectedLeaders, initSelection)
watch(() => props.selectedViewers, initSelection)

</script>


<template>
  <v-dialog v-model="dialog" persistent width="900px" height="750px">
    <v-card class="participant-card">
      <v-card-title class="text-h6 header-title">
        <div v-if="props.type === 'approver'">결재자 선택</div>
        <div v-if="props.type === 'viewers'">참조자 선택</div>
        <div v-if="props.type === 'project'">팀장 초대</div>
        <div v-if="props.type === 'leader'">팀장 초대</div>
        <div v-if="props.type === 'member'">팀원 초대</div>
    </v-card-title>

      <v-card-text class="main-area">
        <!-- 왼쪽 영역 -->
        <div style="width: 450px;">
          <v-text-field
            v-model="search"
            label="이름 검색"
            variant="outlined"
            density="compact"
            append-inner-icon="mdi-magnify"
            class="mb-4"
          />
          <div v-if="(props.type === 'leader' || props.type==='member') &&  props.userList.length === 0" class="empty-msg">
            프로젝트에 참여 중인 부서가 모두 초대되어 있습니다. <br/>
            새로운 팀장 / 팀원을 초대하시려면 태스크를 먼저 생성해주세요.<br/>
            <br>
            <v-btn @click="goToCreateTask" variant="tonal" color="#7578ee" append-icon="mdi-arrow-right">
              태스크 생성하러 가기</v-btn>
          </div>

          <div class="group-scroll">
            <v-expansion-panels multiple v-model="openedPanels">
              <v-expansion-panel
                v-for="(users, dept, index) in groupedUsers"
                :key="dept"
                :value="index"
                :class="{ 'required-dept-panel': isDeptRequired(users) }"
              >
                <v-expansion-panel-title 
                  class="expansion-title"
                  :class="{ 'required-dept-title': isDeptRequired(users) }"
                   >
                  <v-checkbox
                  class="panel-checkbox"
                    v-if="isMultiSelect"
                    :indeterminate="isIndeterminate(dept)"
                    :model-value="isAllSelected(dept)"
                    @update:modelValue="toggleGroup(dept)"
                    density="compact"
                    hide-details
                  />
                  <span>{{ dept }}</span>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" v-for="user in users" :key="user.id">
                      <v-radio
                        v-if="isApprover"
                        :model-value="selectedUserId"
                        :value="user.id"
                        density="compact"
                        hide-details
                        @click="toggleRadio(user.id)"
                        >
                        <template #label>
                            <div style="margin-left: 8px;">{{ user.name }} {{ user.jobRoleName }}</div>
                        </template>
                        </v-radio>

                      <v-checkbox
                        v-else
                        v-model="selectedUserIds"
                        :value="user.userId ?? user.id"
                        density="compact"
                        hide-details
                        @update:modelValue="() => {
                          console.log('📌 현재 선택된 ID:', [...selectedUserIds])
                          
                        }"
                      >
                        <template #label>
                          <div style="margin-left: 8px;">{{ user.name }} {{ user.jobRoleName || user.jobRank}} </div>
                        </template>
                      </v-checkbox>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>

        <!-- 오른쪽 영역 -->
        <div class="right-area">
          <div v-if="selectedUsers.length === 0" class="empty-msg">
            선택된 사용자가 없습니다.
          </div>
          <div v-else class="chip-container">
            <v-chip
              v-for="user in selectedUsers"
              :key="user.id"
              closable
              variant="flat"
              class="selected-chip"
              @click:close="removeUser(user.id)"
            >
              <span style="margin-right: 10px;"><strong>{{ user.deptName }}</strong></span>
              {{ user.name }} {{ user.jobRoleName }}
            </v-chip>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="gray" variant="tonal" @click="handleCancel">취소</v-btn>
        <v-btn color="#7578ee" variant="flat" @click="confirmSelection" :disabled="userList.length === 0">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.main-area {
  display: flex;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

.right-area {
  background-color: rgb(241, 241, 241);
  flex: 1;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  overflow-y: auto;
  padding: 2% 5%;
}

.empty-msg {
  color: gray;
  font-size: 12px;
  text-align: left;
  width: 100%;
  padding-top: 5%;
}

.chip-container {
  width: 100%;
}

.selected-chip {
  width: 100%;
  height: 35px;
  border-radius: 5px;
  padding: 5% 10%;
  background-color: rgba(255, 255, 255, 0.6);
  color: black;
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

/* 1) 카드 전체를 flex column 구조로 잡아서 */
.participant-card {
  display: flex; 
  flex-direction: column;
  height: 100%;
  padding: 0;        /* 필요에 따라 조정 */
  box-sizing: border-box;
}

/* 2) 제목(bar) 고정, actions(버튼) 고정 */
.participant-card .v-card-title,
.participant-card .v-card-actions {
  flex: 0 0 auto;
}

/* 3) 본문 영역을 flex-grow 시켜서 남은 공간을 차지하게 */
.participant-card .v-card-text.main-area {
  flex: 1 1 auto;
  display: flex;
  overflow: hidden;  /* 자식만 스크롤 처리 */
  padding: 20px;     /* 기존 padding 유지 */
}

/* 4) 왼쪽 패널 전체: flex column, 검색창 + 그룹 영역 */
.participant-card .main-area > div:first-child {
  display: flex;
  flex-direction: column;
  flex: 0 0 450px;   /* 너비 고정 */
  margin-right: 20px;
}

/* 5) 검색창 아래 그룹 스크롤 영역이 flex-grow 하도록 */
.participant-card .group-scroll {
  flex: 1 1 auto;
  overflow-y: auto;
}

/* (오른쪽 영역은 기존대로) */
.participant-card .right-area {
  flex: 1 1 auto;
  /* ... */
}
.header-title {
  height: 56px;
  display: flex;
  align-items: center;
}

.expansion-title {
  background-color: #EEEFFA;
  min-height: 35px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.group-scroll {
  flex: 1;
  height :100%;
  /* max-height: 400px; */
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 24px;
}

.expansion-title {
  background-color: #EEEFFA;
  min-height: 35px; /* ← 여기 */
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}
.panel-checkbox {
  margin: 0;
  padding: 0;
  align-items: center;
  height: 20px !important;
  --v-input-control-height: 20px; /* Vuetify 3 커스텀 높이 */
}

/* 필수 선택 강조 */
.required-dept-panel {
  border: 2px solid #f44336;      /* 빨간 테두리 예시 */
  border-radius: 4px;
}

/* 타이틀만 강조하고 싶다면 */
.required-dept-title {
  background-color: rgba(244, 67, 54, 0.1);  /* 연한 빨강 배경 */
}
</style>