<template>
    <div class="container">
        <div class="content">
            <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>부서</th>
                            <th>직위</th>
                            <th>직책</th>
                            <th>프로젝트 생성 권한</th>
                            <th>계정 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- <tr v-for="(user, index) in paginatedUsers" :key="index" @click="handelUserClick(user.id)">
                            <td>{{ user.name }}</td>
                            <td>{{ user.deptName }}</td>
                            <td>{{ user.jobRankName }}</td>
                            <td>{{ user.jobRoleName }}</td>
                            <td>{{ user.isCreation ? 'O' : 'X' }}</td>
                            <td>
                                <div
                                    :style="{ 
                                        color: user.isResign ? 'red' : 'blue',
                                        backgroundColor: user.isResign ? '#ffdddd' : '#ddddff'
                                    }"
                                    class = "active-card"
                                >
                                    {{ user.isResign ? '비활성' : '활성' }}
                                </div>
                            </td>
                        </tr> -->
                    </tbody>
                </table>
                <div>{{ tenantList }}</div>
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