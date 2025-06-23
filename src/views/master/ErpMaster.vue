<template>
    <div class="container">
        <div class="content">
            <table>
                    <thead>
                        <tr>
                            <th>회사 명</th>
                            <th>회사 코드</th>
                            <th>DB 명</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(tenant, index) in tenantList" :key="index">
                            <td>{{ tenant.companyName }}</td>
                            <td>{{ tenant.companyCode }}</td>
                            <td>{{ tenant.schemaName }}</td>
                        </tr>
                    </tbody>
                </table>
                <!-- <div>{{ tenantList }}</div> -->
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api';

const searchTenant = ref('')
const tenantList = ref([])

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

</script>

<style scoped>
    .container {
        border: 1px solid black;
        height: calc(100vh - 100px);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .content {
        border: 1px solid black;
        width: 80%;
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
</style>