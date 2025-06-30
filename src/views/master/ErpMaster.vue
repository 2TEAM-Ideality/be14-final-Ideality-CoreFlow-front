<template>
    <div class="container">
        <div class="content">
            <div class="header">
                <div class="title">Core Flow Master</div>
                <input type="text" placeholder="검색 🔍" class="tenant-search" v-model="searchTenant"/>
            </div>
            <div style="display: flex; justify-content: end;">
                <button class="btn modal-btn" @click="showCreateModal = true">테넌트 생성</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>회사 명</th>
                        <th>회사 코드</th>
                        <th>DB 명</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tenant in paginatedtenants" :key="tenant.id">
                        <td>{{ tenant.companyName }}</td>
                        <td>{{ tenant.companyCode }}</td>
                        <td>{{ tenant.schemaName }}</td>
                        <button style="padding-top: 10px;">
                            <v-icon class="delete-btn" @click="deleteTenant(tenant.id)">mdi-close</v-icon>
                        </button>
                    </tr>
                </tbody>
            </table>
        </div>
        <v-pagination
            v-model="currentPage"
            :length="totalPages"
            total-visible="7"
            class="mt-4"
            @update:modelValue="goToPage"
        
        />
    </div>
    <div class="create-modal" v-if="showCreateModal">
        <div class="modal-wrapper">
            <v-icon class="close-btn" @click="showCreateModal = false">mdi-close</v-icon>
            <div class="modal-title">테넌트 생성</div>
            <div class="input-area">
                <div class="input-title">회사 코드</div>
                <input class="input-box" v-model="companyCodeInput">
            </div>
            <div class="input-area">
                <div class="input-title">회사 명</div>
                <input class="input-box" v-model="companyNameInput">
            </div>
            <div class="input-area">
                <div class="input-title">DB 명</div>
                <input class="input-box" v-model="schemaNameInput">
            </div>
            <div style="display: flex; justify-content: center;">
                <button class="btn create-btn" @click="createTenant">생성하기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/api';

const searchTenant = ref('')
const tenantList = ref([])
const showCreateModal = ref(false)

const companyCodeInput = ref('')
const companyNameInput = ref('')
const schemaNameInput = ref('')

const displayedList = computed(() => {
    const list = tenantList.value

    return list.filter(item =>
        !searchTenant.value ||
        item.companyCode?.toLowerCase().includes(searchTenant.value) ||
        item.companyName?.toLowerCase().includes(searchTenant.value) ||
        item.schemaName?.toLowerCase().includes(searchTenant.value) 
    )
})

async function fetchTenant() {
    try {
        const response = await api.get('/api/tenant/find-all')
        tenantList.value = response.data.data
        console.log('tenentList', tenantList.value)
    } catch (error) {
        if(error.response) {
            alert(error.response.data.message)
        }
    }
}
async function createTenant() {
    showCreateModal.value = false
    const confiremd = confirm("생성하시겠습니까?")
    if (!confiremd) return

    try {
        const newTenant = {
            companyCode: companyCodeInput.value,
            companyName: companyNameInput.value,
            schemaName: schemaNameInput.value
        }

        const response = await api.post('/api/tenant/create', newTenant)

        alert(response.data.message) 

        tenantList.value.unshift(newTenant)
    } catch(error) {
        if(error.response) {
            alert(error.response.data.message)
        }
    }
}

async function deleteTenant(id) {
    const confiremd = confirm("삭제하시겠습니까?")
    if (!confiremd) return

    try {
        const response = await api.post(`/api/tenant/delete/${id}`)
        alert(response.data.message)
        tenantList.value = tenantList.value.filter(tenant => tenant.id !== id)
    } catch(error) {
        if(error.response) {
            alert(error.response.data.message)
        }
    }
}

onMounted(() => {
    fetchTenant()
})

const currentPage = ref(1)
const pageSize = 7
const targetPage=ref(1)

const paginatedtenants = computed(() => {
    if (!displayedList.value || displayedList.value.length === 0) return []
    const start = (currentPage.value - 1) * pageSize
    return displayedList.value.slice(start, start + pageSize)
})

const totalPages = computed(() => {
    if (!displayedList.value || displayedList.value.length === 0) return 1
    return Math.ceil(paginatedtenants.value.length / pageSize)
})

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    } else {
        alert('요청하신 페이지 값이 올바르지 않습니다.')
    }
}

function selectTenant(tenantId) {
    console.log('tenantId:', tenantId)
}

watch(currentPage, (newVal) => {
    targetPage.value = newVal
    searchTenant.value = ''
})
</script>

<style scoped>
    .container {
        height: calc(100vh - 100px);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .content {
        width: 80%;
        height: 70%;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

    th, td {
        padding: 10px;
        text-align: center;
        border-bottom: 1px solid #ddd;
    }
    .title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 10px;
    }
    .tenant-search {
        height: 30px;
        width: 300px;
        padding: 3px;
        padding-left: 12px;
        background-color: white;
        border-radius: 20px;
        border: 1px solid gray;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: end;
    }
    .close-btn {
        position: absolute;
        top: 5%;
        left: 83%;
        font-size: 20px;
        color: gray;
        background: none;
        border: none;
        cursor: pointer;
    }
    .close-btn:hover {
        color: black;
    }
    .create-modal {
        background-color: white;
        position: fixed;
        top: 10%;
        left: 80%;
        width: 200px;
        height: 270px;
        border: 1px gray solid;
        border-radius: 24px;
    }
    .modal-wrapper {
        padding: 20px;
        position: absolute;
        top: 0%;
        left: 0%;
    }
    .modal-title {
        text-align: center;
        font-weight: bold;
        font-size: 20px;
        margin-bottom: 6px;
    }
    .input-area {
        margin-bottom: 6px;
    }
    .input-title {
        font-weight: bold;
    }
    .input-box {
        border: 1px solid gray;
        width: 100%;
        border-radius: 6px;
    }
    .btn {
        border: 1px solid gray;
        padding: 0 6px;
        border-radius: 6px;
        color: white;
    }
    .btn:hover {
        background-color: black;
    }
    .create-btn {
        background-color: #9090ff;
        margin-top: 6px;
        width: 100%;
    }
    .modal-btn {
        background-color: #9090ff;
        margin: 12px 0;
        width: 100px;
    }
</style>