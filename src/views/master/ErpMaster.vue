<template>
    <div class="container">
        <div class="content">
            {{ tenantList }}
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
</style>