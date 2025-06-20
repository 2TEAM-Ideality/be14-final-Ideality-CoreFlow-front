<template>
    <div class="container" @click="clearSelection">
        <h2>결재 내역</h2>
        <div class="tabs">
            <button :class="{active: currentTab === 'received' }" @click="selectTab('received')">수신</button>
            <button :class="{active: currentTab === 'sent' }" @click="selectTab('sent')">발신</button>
        </div>

        <table class="history-table">
            <thead>
                <tr>
                    <th style="width: 100px;">{{ currentTab === 'received' ? '보낸 사람' : '받는 사람' }}</th>
                    <th style="width: 300px;">제목</th>
                    <th style="width: 120px; text-align: center;">상태</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in displayedList" :key="item.id" @click.stop="selectApproval(item.id)">
                    <td style="width: 100px; padding-left:20px">{{ currentTab === 'received' ? item.requesterName : item.approverName }}</td>
                    <td style="width: 300px">{{ item.title }}</td>
                    <td>
                        <div 
                            :class="['status', statusClass(item.approvalStatus)]"
                            style="padding: 3px; width: 120px;"
                        >
                            {{ item.approvalStatus }}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="pagination">
        <button class="pagination-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">이전</button>
        <input type="number" v-model="targetPage" style="width: 40px; border: 1px solid black; border-radius: 6px; text-align: end;"/>
        <span>/ {{ totalPages }}</span>
        <button class="pagination-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">다음</button>
        <button class="pagination-btn" @click="goToPage(targetPage)">이동</button>
    </div>
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
    console.log('displayed', displayedList.value)
    return currentTab.value === 'received'
    ? approvalData.value.receivedApproval
    : approvalData.value.sentApproval
})

function statusClass(status) {
    switch (status) {
        case 'PENDING':
            return 'status-pending'
        case 'APPROVED':
            return 'status-approved'
        case 'REJECTED':
            return 'status-rejected'
        case 'CANCELLED':
            return 'status-cancelled'
        default:
            return '';
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

.history-table th {
    text-align: left;
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
</style>