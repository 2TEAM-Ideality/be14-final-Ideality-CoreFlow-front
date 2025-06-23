<template>
    <v-container class="py-4" @click="clearSelection">
        <h3 class="mb-5">결재 내역</h3>
        <v-tabs v-model="currentTab" background-color="transparent" class="approval-tab">
            <v-tab value="received"  @click="selectTab('received')">수신</v-tab>
            <v-tab value="sent"  @click="selectTab('sent')">발신</v-tab>
            <v-tab value="sent"  @click="selectTab('sent')">승인 대기</v-tab>
            <v-tab value="sent"  @click="selectTab('sent')">승인 대기</v-tab>
        </v-tabs>
        <input type="text" placeholder="검색 🔍" class="approval-search" v-model="searchApproval"/>
        <v-table>
        <thead style="background-color: #F8F8F8; height: 20px; ">
            <tr>
            <th class="text-left">{{ currentTab === 'received' ? '보낸 사람' : '받는 사람' }}</th>
            <th class="text-left">제목</th>
            <th class="text-left">상태</th>
            </tr>
        </thead>
        <tbody>
            <tr
            style="cursor:pointer;"
            v-for="item in paginatedApprovals"
            :key="item.id"
            @click.stop="selectApproval(item.id)"
            >
            <td>{{ currentTab === 'received' ? item.requesterName : item.approverName }}</td>
            <td>{{ item.title }}</td>
            <td class="status-cell">
                <v-chip
                :color="chipColor(item.approvalStatus)"
                :text-color="chipTextColor(item.approvalStatus)"
                variant="elevated"
                size="small"
                style="text-align: center;"
                class="font-weight-medium approval-chip"
                >
                {{ koreanStatus(item.approvalStatus) }}
                </v-chip>
            </td>
            </tr>
        </tbody>
        </v-table>

        <!-- Vuetify Pagination 적용 -->
        <v-pagination
        v-model="currentPage"
        :length="totalPages"
        total-visible="7"
        class="mt-4"
        @update:modelValue="goToPage"
        />
    </v-container>
  
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/api'

const emit = defineEmits(['select-approval', 'select-tab'])

function selectApproval(id) {
    emit('select-approval', id)
    emit('select-tab', currentTab.value)
}
function clearSelection() {
    emit('select-approval', null)
    emit('select-tab', null)
}
function selectTab(type) {
    currentTab.value = type
}

const searchApproval = ref('')
const currentTab = ref('received')

const approvalData = ref([])

// API 호출 함수
const fetchApprovalData = async () => {
    try {
        const response = await api.get('/api/approval/my-approval/all')
        approvalData.value = response.data.data
    } catch(error) {
        if (error.response) {
            console.error('에러 응답:', error.response.data);
            alert(error.response.data.message);
        }
    }
}

onMounted(() => {
    fetchApprovalData()
})


const displayedList = computed(() => {
    const list = currentTab.value === 'received'
    ? approvalData.value.receivedApproval ?? []
    : approvalData.value.sentApproval ?? []

    return list.filter(item =>
        !searchApproval.value || item.title.includes(searchApproval.value)
    )
})
function chipColor(status) {
  switch (status) {
    case 'PENDING':
      return '#cecece'   // 연회색
    case 'APPROVED':
      return '#9090ff'   // 파랑
    case 'REJECTED':
      return '#ff9090'   // 빨강
    case 'CANCELLED':
      return '#bdbdbd'   // 진회색
    default:
      return 'grey'
  }
}

function chipTextColor(status) {
  switch (status) {
    case 'PENDING':
      return '#020725'
    case 'APPROVED':
      return '#0207cc'
    case 'REJECTED':
      return '#cc0702'
    case 'CANCELLED':
      return '#444444'
    default:
      return 'white'
  }
}

function koreanStatus(status) {
  switch (status) {
    case 'PENDING': return '대기'
    case 'APPROVED': return '승인'
    case 'REJECTED': return '반려'
    case 'CANCELLED': return '취소'
    default: return status
  }
}

const currentPage = ref(1)
const pageSize = 7
const targetPage=ref(1)

const paginatedApprovals = computed(() => {
    if (!displayedList.value || displayedList.value.length === 0) return []
    const start = (currentPage.value - 1) * pageSize
    return displayedList.value.slice(start, start + pageSize)
})

const totalPages = computed(() => {
    if (!displayedList.value || displayedList.value.length === 0) return 1
    return Math.ceil(paginatedApprovals.value.length / pageSize)
})

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    } else {
        alert('요청하신 페이지 값이 올바르지 않습니다.')
    }
}

watch(currentPage, (newVal) => {
    targetPage.value = newVal
    searchApproval.value = ''
})
</script>

<style scoped>
.container {
    height: calc(100vh - 180px);
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  margin-top: 12px;
  border-bottom: 1px solid #ccc;
  justify-content: space-between;
}

.tabs button {
  padding: 3px 12px;
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  font-weight: bold;
  border-bottom: 2px solid black;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}
::v-deep thead {
  height: 20px !important;
}

::v-deep thead th {
    height: 20px;
  font-size: 13px;
}
.th.text-left {
    height: 20px;
}
.history-table th {
    text-align: left;
    height: 20px;
    padding: 12px;
    border-bottom: 1px solid #ddd;
}
.history-table td {
    text-align: left;
    padding: 6px;
    border-bottom: 1px solid #ddd;
}
.status {
    font-weight: bold;
    text-align: center;
}
.status-pending {
    background-color: #cecece;
    color: #020725;
    border-radius: 12px;
    border: 1px solid #020725
}
.status-approved {
    background-color: #9090ff;
    color: #0207cc;
    border-radius: 12px;
    border: 1px solid #0207cc;
}
.status-rejected {
    background-color: #ff9090;
    color: #cc0702;
    border-radius: 12px;
    border: 1px solid #cc0702;
}
.status-cancelled {
    background-color: #888888;
    color: #cccccc;
    border-radius: 12px;
    border: 1px solid #020725;
}
    .pagination {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 12px;
    }
    .pagination-btn {
        border-radius: 6px;
        border: 1px solid black;
        padding: 0 6px;
    }
    .pagination-btn:hover {
        background-color: black;
        color: white
    }

    
    .approval-search {
        width: 200px;
        padding: 3px;
        padding-left: 12px;
        background-color: white;
        border-radius: 20px;
        border: 1px solid gray;
    }
.status-cell {
  vertical-align: middle;
}
    .approval-chip {
        text-align: center;
        min-width: 70px;
    }
</style>