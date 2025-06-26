<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  type: String, // 'approver' | 'viewer | project | leader | member '
  userList: {
    type: Array,
    default: () => []
  },
  selectedApprover: {
    type: Array,
    default: () => []
  },
  selectedViewers:{
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
  }
})

const emit = defineEmits(['close', 'select'])

const dialog = ref(true)
const search = ref('')
const selectedUserId = ref(null)
const selectedUserIds = ref([])
const openedPanels = ref([])

const isApprover = computed(() => props.type === 'approver')
const isMultiSelect = computed(() => props.type === 'viewer' || props.type === 'project' || props.type === 'leader' || props.type === 'member')

onMounted(() => {
  console.log('선택 대상들', props.userList)
  console.log('선택 리더들', props.selectedLeaders)
  if (isApprover.value) {
    selectedUserId.value = (props.selectedApprover?.[0]?.id) ?? null
  } else {
    selectedUserIds.value = (props.selectedViewers || props.selectedLeaders || []).map(v => v.id)
  }
})

const groupedUsers = computed(() => {
  const groups = {}
  if (!props.userList || !Array.isArray(props.userList)) return groups
  props.userList.forEach(user => {
    const dept = user.deptName || '기타'
    if (!groups[dept]) groups[dept] = []
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

// const selectedUsers = computed(() => {
//   return isApprover.value
//     ? props.userList.filter(user => user.id === selectedUserId.value)
//     : props.userList.filter(user => selectedUserIds.value.includes(user.id))
// })

const selectedUsers = computed(() => {
  return isApprover.value
    ? props.userList.filter(user => (user.id ?? user.userId) === selectedUserId.value)
    : props.userList.filter(user =>
        selectedUserIds.value.includes(user.userId ?? user.id)
      )
})

function removeUser(id) {
  if (isApprover.value) {
    selectedUserId.value = null
  } else {
    selectedUserIds.value = selectedUserIds.value.filter(uid => uid !== id)
  }
}

function isAllSelected(dept) {
  const users = groupedUsers.value[dept]
  return users.length > 0 && users.every(user =>
    selectedUserIds.value.includes(user.id)
  )
}

function isIndeterminate(dept) {
  const users = groupedUsers.value[dept]
  const selected = users.filter(user =>
    selectedUserIds.value.includes(user.id)
  )
  return selected.length > 0 && selected.length < users.length
}

// function toggleGroup(dept) {
//   const users = groupedUsers.value[dept]
//   const userIds = users.map(u => u.id)
//   if (isAllSelected(dept)) {
//     selectedUserIds.value = selectedUserIds.value.filter(id => !userIds.includes(id))
//   } else {
//     const toAdd = userIds.filter(id => !selectedUserIds.value.includes(id))
//     selectedUserIds.value.push(...toAdd)
//   }
// }


function toggleGroup(dept) {
  const users = groupedUsers.value[dept]
  const userIds = users.map(u => u.userId ?? u.id)

  if (isAllSelected(dept)) {
    selectedUserIds.value = selectedUserIds.value.filter(id => !userIds.includes(id))
  } else {
    const toAdd = userIds.filter(id => !selectedUserIds.value.includes(id))
    selectedUserIds.value.push(...toAdd)
  }
}


function confirmSelection() {
  const selected = isApprover.value
    ? props.userList.filter(u => u.id === selectedUserId.value)
    : props.userList.filter(u => selectedUserIds.value.includes(u.id))

  emit('select', selected)
  dialog.value = false
  emit('close')
}
// 결재자 토글
function toggleRadio(userId) {
  selectedUserId.value = selectedUserId.value === userId ? null : userId
}

watch(groupedUsers, (val) => {
  const panelList = Object.entries(val)
    .map(([dept, users], index) => (users.length > 0 ? index : null))
    .filter(index => index !== null)
  openedPanels.value = panelList
})

console.log('그룹!!!!!!!!!!!!!', groupedUsers)
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

          <div class="group-scroll">
            <v-expansion-panels multiple v-model="openedPanels">
              <v-expansion-panel
                v-for="(users, dept, index) in groupedUsers"
                :key="dept"
                :value="index"
              >
                <v-expansion-panel-title class="expansion-title">
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
        <v-btn color="gray" variant="tonal" @click="$emit('close')">취소</v-btn>
        <v-btn color="purple" @click="confirmSelection">확인</v-btn>
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

.participant-card {
  padding: 20px;
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
</style>