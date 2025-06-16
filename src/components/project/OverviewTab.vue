<template>
    <div v-if="data" class="overview-container">
        <!-- 요약 카드 -->
        <div class="summary-cards">
            <SummaryCard 
                v-for="(item, i) in summaryItems"
                :key="i"
                :title="item.title"
                :icon="item.icon"
                :value="item.value"
                :warning="item.warning"
                :icon-color="item.iconColor"
            />
        </div>

        <!-- 프로젝트 정보 + 책임자 정보 -->
        <div class="info-row">
            <!-- 프로젝트 정보 -->
            <div class="info-card">
                <h3>프로젝트 정보</h3>
                <p><strong>생성일:</strong> {{ data.createdDate }}</p>
                <p><strong>시작일:</strong> {{ data.startBase }}</p>
                <p><strong>설명:</strong> {{ data.description }}</p>
            </div>

            <!-- 책임자 정보 -->
            <div class="info-card">
                <h3>부서별 책임자</h3>
                <p><strong>디렉터:</strong> {{ data.director.name }} / {{ data.director.deptName }} / {{ data.director.jobRoleName }}</p>
                <ul>
                    <li v-for="leader in data.leaders" :key="leader.userId">
                        {{ leader.name }} - {{ leader.deptName }} / {{ leader.jobRoleName }}
                    </li>
                </ul>
            </div>
        </div>

    </div>
</template>

<script setup>
import SummaryCard from './SummaryCard.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api.js'

const route = useRoute()
const projectId = route.params.id
const data = ref(null)

onMounted(async () => {
    const res = await api.get(`/api/projects/${projectId}`)
    data.value = res.data.data
})

const summaryItems = computed(() => [
    {
        title: '예상 마감일',
        icon: 'mdi-calendar-check-outline',
        iconColor: '#2196F3',
        value: data.value.endExpect,
        warning: false,
    },
    {
        title: '프로젝트 경과율',
        icon: 'mdi-progress-clock',
        value: `${data.value.passedRate}%`,
        iconColor: '#4CAF50',
        warning: false
    },
    {
        title: '진척률',
        icon: 'mdi-arrow-right',
        iconColor: '#FF9800',
        value: `${data.value.progressRate}%`,
        warning: false
    },
    {
        title: '지연일',
        icon: 'mdi-alert-circle-outline',
        iconColor: '#F44336',   
        value: data.value.delayDays > 0 ? `+${data.value.delayDays}일` : `${data.value.delayDays}일`,
        warning: data.value.delayDays > 0
    }
])

</script>

<style scoped>
.overview-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.summary-cards {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.info-row {
    display: flex;
    gap: 24px;
    justify-content: space-between;
}
.info-card{
    background: white;
    border: 2px solid rgb(213, 213, 213);
    flex: 1;
    padding: 20px;
    border-radius: 8px;
}
</style>