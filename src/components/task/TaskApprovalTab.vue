<template>
    <div class="approval-box">
        <table class="approval-table">
        <thead>
            <tr>
            <th>보낸 사람</th>
            <th>제목</th>
            <th>상태</th>
            <th>승인 시간</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in approvalList" :key="item.id">
            <td>{{ item.requesterName }}</td>
            <td>{{ item.title }}</td>
            <td><span class="status">승인</span></td>
            <td>{{ item.approvedAt.replace('T', ' ') }}</td>
            </tr>
        </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore';
import api from '@/api';

const route = useRoute();
const userStore = useUserStore();


const approvalList = ref([]);
const taskId = ref(route.params.taskId);

// 승인된 결재 서류 조회
const fetchApproval = async() => {
    try {
        const res = await api.get(`/api/approval/task-approval/${taskId.value}`)
        approvalList.value = res.data.data;
        console.log(approvalList.value);
    } catch (error) {
        console.log(error);
    }
}

// 랜더링 될 때 fetch 받아오기
onMounted(() => fetchApproval());
</script>

<style scoped>
.approval-box {
position: relative;
border: 1px solid #818181;
border-radius: 6px;
padding: 24px 48px 24px 24px;
display: flex;
flex-direction: column;
gap: 24px;
margin-top: 32px;
background-color: white;
}

.title {
font-size: 18px;
font-weight: bold;
}

.approval-table {
width: 100%;
border-collapse: collapse;
}

.approval-table thead tr {
border-bottom: 1px solid #c5c5c5;
}

.approval-table th,
.approval-table td {
padding: 12px 8px;
text-align: left;
font-size: 15px;
}

.approval-table td .status {
font-weight: bold;
color: #2b74ff;
}
</style>