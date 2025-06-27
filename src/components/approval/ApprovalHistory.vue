<template>
    <v-container style="padding: 0;">
      <div style="display:flex; flex-direction: row; justify-content: space-between; align-items: center;">
        <v-tabs v-model="currentTab" background-color="transparent" class="approval-tab" style="width:fit-content;" >
          <v-tab value="received"  @click.stop="selectTab('received')">수신</v-tab>
          <v-tab value="sent"  @click.stop="selectTab('sent')">발신</v-tab>
        </v-tabs>
        <v-btn variant="flat" color="#7578ee" @click="goToCreateApproval" style="width: 150px;">
          <v-icon start size="small">mdi-send</v-icon>
          결재 요청
        </v-btn>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 20px; margin-bottom: 20px;">
        <!-- 필드 필터 버튼 -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="outlined" class="filter-btn">
              <v-icon size="16" class="mr-1">mdi-magnify</v-icon>
              {{ searchFieldLabel }}
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="option in searchFieldOptions" :key="option.value" @click="searchField = option.value">
              <v-list-item-title>{{ option.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- 검색창 -->
        <input
          class="search-new"
          type="text"
          v-model="searchApproval"
          :placeholder="`'${searchFieldLabel}'으로 검색`"
        />

        <!-- 상태 필터 버튼 -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="outlined" class="filter-btn">
              <v-icon size="16" class="mr-1">mdi-filter-variant</v-icon>
              {{ statusFilterLabel }}
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="option in statusFilterOptions" :key="option.value" @click="selectedStatus = option.value">
              <v-list-item-title>{{ option.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>


      <!-- <div style="width: 100%; margin-top: 20px;">
      <input
        class="search-new"
        type="text"
        v-model="searchApproval"
        placeholder="결재 내역 검색어를 입력해주세요." 
      />  

      </div> -->
      
        <!-- <input type="text" placeholder="결재 내역 검색어를 입력해주세요." 
        class="approval-search" 
        v-model="searchApproval"
         @click.stop.prevent="selectApproval(item.id)"  
        /> -->
        <v-table>
        <thead style="background-color: #F8F8F8; height: 20px;text-align:center; ">
          <tr style="padding-left: 20px;">
            <th class="text-left">결재 유형</th>
            <th class="text-left">{{ currentTab === 'received' ? '보낸 사람' : '받는 사람' }}</th>
            <th class="text-left">제목</th>
            <th class="text-left">기안일시</th>
            <th class="text-left">대상 프로젝트</th>
            <th class="text-left">상태</th>
            </tr>
        </thead>
        <tbody style="text-align: left;">
            <tr
            style="cursor:pointer;"
            v-for="item in paginatedApprovals"
            :key="item.id"
            @click.stop="selectApproval(item.id)"
            >
            <td>{{ convertedType(item.approvalType) }}</td>
            <td>{{ currentTab === 'received' ? item.requesterName : item.approverName }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.createdAt.split('T')[0] }}</td>  
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
        color="#7578ee"
        />
    </v-container>
  
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'

const emit = defineEmits(['select-approval', 'select-tab'])

const router = useRouter()

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

// 검색 기준 관련
const searchField = ref('title') // 기본값: 제목
const searchFieldOptions = [
  { value: 'title', label: '제목' },
  { value: 'name', label: '이름' }
]
const searchFieldLabel = computed(() => {
  return searchFieldOptions.find(opt => opt.value === searchField.value)?.label ?? ''
})


// 상태 필터
// 상태 필터
const selectedStatus = ref('ALL') // 기본값
const statusFilterOptions = [
  { value: 'ALL', label: '전체' },
  { value: 'APPROVED', label: '승인' },
  { value: 'PENDING', label: '대기' },
  { value: 'REJECTED', label: '반려' }
]
const statusFilterLabel = computed(() => {
  return statusFilterOptions.find(opt => opt.value === selectedStatus.value)?.label ?? ''
})

const convertedType = (type) => {
  if(type === 'GENERAL'){
    return '일반'
  }else if(type === 'DELAYED'){
    return '지연'
  }else{
    return '산출물'
  }
}

const searchApproval = ref('')
const currentTab = ref('received')

const approvalData = ref([])

// API 호출 함수
const fetchApprovalData = async () => {
    try {
        const response = await api.get('/api/approval/my-approval/all')
        approvalData.value = response.data.data
        console.log('결재 내역 조회', approvalData.value)
    } catch(error) {
        if (error.response) {
            console.error('에러 응답:', error.response.data);
            alert(error.response.data.message);
        }
    }
}

const goToCreateApproval = () => {
  router.push(`/approval/create`)
}

onMounted(() => {
    fetchApprovalData()
})

// 여러 필터 기준(상태 / 이름, 제목)으로 검색 결과 도출
const displayedList = computed(() => {
  const list = currentTab.value === 'received'
    ? approvalData.value.receivedApproval ?? []
    : approvalData.value.sentApproval ?? []

  const keyword = searchApproval.value.toLowerCase().trim()

  return list.filter(item => {
    // 상태 필터 적용
    const statusMatch = selectedStatus.value === 'ALL' || item.approvalStatus === selectedStatus.value

    // 검색어 필터 적용
    if (!keyword) return statusMatch

    if (searchField.value === 'title') {
      return statusMatch && item.title?.toLowerCase().includes(keyword)
    }
    if (searchField.value === 'name') {
      const name = currentTab.value === 'received' ? item.requesterName : item.approverName
      return statusMatch && name?.toLowerCase().includes(keyword)
    }

    return statusMatch
  })
})



// const displayedList = computed(() => {
//     const list = currentTab.value === 'received'
//     ? approvalData.value.receivedApproval ?? []
//     : approvalData.value.sentApproval ?? []

//     return list.filter(item =>
//         !searchApproval.value || item.title.toLowerCase().includes(searchApproval.value)
//     )
// })
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

/* 커스텀 검색창 */
.search-new {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #D9D9D9;
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 200px;
}
/* 검색 필터 */
.filter-btn,
.sort-btn {
  white-space: nowrap;
  height: 40px;
  font-size: 14px;
  border-radius: 8px;
  border: solid 1px #D9D9D9;
  color: #767676;
}


</style>