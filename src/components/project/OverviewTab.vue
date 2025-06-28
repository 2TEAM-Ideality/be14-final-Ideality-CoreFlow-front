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
        <div class="info-section">
            <!-- 프로젝트 정보 -->
            <div class="info-card">
                <h3 class="section-title">프로젝트 정보</h3>
                <div class="info-table">
                    <div class="info-row" v-for="(item, i) in projectInfo" :key="i">
                        <div class="info-label">{{ item.label }}</div>
                        <div class="info-separator">-</div>
                        <div class="info-value">{{ item.value }}</div>
                    </div>
                </div>
            </div>

            <!-- 책임자 정보 -->
            <div class="info-card">
                <h3 class="section-title">부서별 책임자</h3>
                <div class="info-table">
                    <div class="info-row leader-list" v-for="(leader, i) in data.leaders" :key="i">
                        <div class="info-label">{{ leader.deptName }}</div>
                        <div class="info-separator">-</div>
                        <div class="info-value">
                            <UserInfoCard 
                            :name="leader.name"
                            :dept="leader.deptName"
                            :role="leader.jobRoleName"
                            :profileImage="leader.profileImage"
                            />
                        </div>
                    </div>
                </div>
                
            </div>
        </div>

    </div>
</template>

<script setup>
import SummaryCard from './SummaryCard.vue'
import UserInfoCard from '../common/UserInfoCard.vue'

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

const projectInfo = computed(() => [
    { label: '설명', value: data.value.description },
    { label: '디렉터', value: `${data.value.director.name} / ${data.value.director.deptName} / ${data.value.director.jobRoleName}` },
    { label: '프로젝트 생성일', value: data.value.createdDate },
    { label: '시작 베이스라인', value: data.value.startBase },
    { label: '마감 베이스라인', value: data.value.endBase },
    {
        label: data.value.status === 'PENDING' ? '예상 시작일' : '실제 시작일',
        value: data.value.status === 'PENDING' ? data.value.startExpect : (data.value.startReal || '-')
    },
    {
        label: '실제 마감일',
        value: data.value.endReal || '-'
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
    /* display: flex; */
    display: table-row;
    gap: 22px;
    justify-content: space-between;
    margin-bottom: 0px;
}

.info-section {
    display: flex;
    gap: 22px;
    justify-content: space-between;
    margin-bottom: 7px;
    text-align: left;
}

.info-card{
    background: #F8F8F8;
    /* border: 1px solid #DEDEDE; */
    flex: 1;
    padding: 3%;
    border-radius: 8px;
    
}

.info-label {
    font-size: 14px;
    font-weight: 600;
    color: #757575;
    /* min-width: 120px; 고정 너비 또는 flex-basis */
    white-space: nowrap;
    max-height: 300px;
}

.info-value {
    color: #666;
    font-size: 13px;
    flex: 1;
    text-align: left;
    word-break: break-word;
}
.user-info{
    margin-bottom: 7px;
}
.section-title{
    margin-bottom: 10px;
}

.info-table {
    display: table;
    width: 100%;
}

.info-label,
.info-separator,
.info-value {
    display: table-cell;
    padding: 4px 8px;
    vertical-align: top;
}
.leader-list {
    height: 100%; 
    
}
</style>