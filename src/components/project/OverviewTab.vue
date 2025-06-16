<template>
    <div v-if="data" class="overview-container">
        <!-- 요약 카드 -->
        <div class="summary-cards">
            <div class="card">프로젝트 경과율<br/><strong>{{ data.passedRate }}%</strong></div>
            <div class="card">예상 마감일<br/><strong>{{ data.endExpect }}</strong></div>
            <div class="card">진척률<br/><strong>{{ data.progressRate }}%</strong></div>
            <div
            class="card"
            :class="{ warning: data.delayDays > 0 }"
            >
            지연일<br/><strong>{{ data.delayDays > 0 ? '+' + data.delayDays : data.delayDays }}일</strong>
            </div>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api.js'

const route = useRoute()
const projectId = route.params.id
const data = ref(null)

onMounted(async () => {
    const res = await api.get(`/api/projects/${projectId}`)
    data.value = res.data.data
})
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

.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    flex: 1;
    text-align: center;
    font-size: 16px;

    border: 2px solid rgb(207, 207, 207);
}

.card strong {
    font-size: 24px;
    display: block;
    margin-top: 8px;
}
.card.warning {
    border: 2px solid red;
    color: red;
    font-weight: bold;
}

.info-row {
    display: flex;
    gap: 24px;
    justify-content: space-between;
}
.info-card{
    background: white;
    flex: 1;
    padding: 20px;
    border-radius: 8px;
}
</style>