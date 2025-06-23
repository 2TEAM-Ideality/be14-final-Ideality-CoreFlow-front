<template>
  <v-dialog v-model="dialog" persistent max-width="700px" height="750px">
    <v-card class="participant-card">
      <v-card-title class="text-h6 header-title">결재자 선택</v-card-title>

      <v-card-text class="main-area" style="display: flex; flex-direction: row; gap: 20px; justify-content: space-between;">
        <!-- 왼쪽 영역: 사용자 목록 -->
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
                <v-expansion-panel-title
                style="
                    background-color: #EEEFFA;
                    min-height: 35px;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                "
                >
                <v-checkbox
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
                            <v-checkbox
                                v-model="selectedUserIds"
                                :value="user.id"
                                density="compact"
                                hide-details
                                >
                                <template #label>
                                    <div style="margin-left: 8px;">{{ user.name }} {{ user.jobRoleName }}</div>
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
        <div style="height: 100%;" class="right-area">
            <div v-if="selectedUsers.length === 0" style="color: gray; font-size: 12px;">선택된 사용자가 없습니다.</div>
            <v-chip
                v-for="user in selectedUsers"
                :key="user.id"
                closable
                class="ma-1 "
                @click:close="removeUser(user.id)"
            >
                {{ user.name }} {{ user.jobRoleName }}
            </v-chip>
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn color="gray" variant="tonal" @click="$emit('close')">취소</v-btn>
        <v-btn color="blue" @click="confirmSelection">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  type: String, // 'approver' | 'viewer'
  userList: Array,
  selectedApprover: Array,
  selectedViewers: Array
})

const emit = defineEmits(['close', 'select'])

const dialog = ref(true)
const search = ref('')
const selectedUserIds = ref([])
const openedPanels = ref([])

const selectedUsers = computed(() =>
  props.userList.filter(user => selectedUserIds.value.includes(user.id))
)

function removeUser(id) {
  selectedUserIds.value = selectedUserIds.value.filter(uid => uid !== id)
}


onMounted(() => {
  selectedUserIds.value = props.type === 'approver'
    ? (props.selectedApprover || []).map(v => v.id)
    : (props.selectedViewers || []).map(v => v.id)
})

const groupedUsers = computed(() => {
  const groups = {}
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

function toggleGroup(dept) {
  const users = groupedUsers.value[dept]
  const userIds = users.map(u => u.id)
  if (isAllSelected(dept)) {
    selectedUserIds.value = selectedUserIds.value.filter(
      id => !userIds.includes(id)
    )
  } else {
    const toAdd = userIds.filter(id => !selectedUserIds.value.includes(id))
    selectedUserIds.value.push(...toAdd)
  }
}

function confirmSelection() {
  const selectedUsers = props.userList.filter(u => selectedUserIds.value.includes(u.id))
  emit('select', selectedUsers)
  dialog.value = false
  emit('close')
}

watch(groupedUsers, (val) => {
  const panelList = Object.entries(val)
    .map(([dept, users], index) => (users.length > 0 ? index : null))
    .filter(index => index !== null)
  openedPanels.value = panelList
})
</script>

<style scoped>
.main-area {
  display: flex;
  gap: 20px;
  height: 100%; /* dialog 내부 높이 꽉 채우기 */
  overflow: hidden; /* 전체 스크롤 방지 */
}

.left-area {
  width: 450px;
  display: flex;
  flex-direction: column;
}

.group-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 100%;
  padding-right: 4px;
}

.right-area {
  flex: 1;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-content: flex-start;
  overflow-y: auto;
}
.participant-card {
  /* padding:2%; */
  padding: 20px;
}

.header-title {
  height: 56px;
  display: flex;
  align-items: center;
}

.v-expansion-panel-title {
  font-weight: bold;
}

.group-scroll {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}
</style>
