<template>
    <div class="container">
        <div class="content">
            <div class="header">
                <div class="title">Core Flow Master</div>
                <input type="text" placeholder="검색 🔍" class="tenant-search" v-model="searchTenant"/>
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
                    <tr v-for="tenant in paginatedtenants" :key="tenant.id" @click.stop="selectTenant(tenant.id)">
                        <td>{{ tenant.companyName }}</td>
                        <td>{{ tenant.companyCode }}</td>
                        <td>{{ tenant.schemaName }}</td>
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/api';

const searchTenant = ref('')
const tenantList = ref([])

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
        border: 1px solid black;
        height: calc(100vh - 100px);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .content {
        border: 1px solid black;
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
</style>