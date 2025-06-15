<script setup>
import {computed} from 'vue'
// import {format} from 'date-fns'
import DonutChart from '@/components/common/DonutChart.vue'

const onEdit = () => {
    console.log('수정 클릭됨', project.id)
}

const onDelete = () => {
    console.log('삭제 클릭됨', project.id)
}

const onGenerateReport = () => {
    if (project.status === 'COMPLETED') {
        console.log('분석 리포트 생성', project.id)
    }
}


const props = defineProps({
    project:{
        type:Object,
        required: true
    }
})

const statusMeta = computed(() => {
    switch (props.project.status) {
        case 'PENDING':
            return { text: '시작전', color: 'grey', icon: 'mdi-play-circle-outline' }
        case 'PROGRESS':
            return { text: '진행중', color: 'blue', icon: 'mdi-progress-clock' }
        case 'COMPLETED':
            return { text: '완료', color: 'green', icon: 'mdi-check-circle-outline' }
        case 'DELETED':
            return { text: '삭제됨', color: 'red', icon: 'mdi-delete-outline' }
        case 'CANCELLED':
            return { text: '취소됨', color: 'orange', icon: 'mdi-cancel' }
        default:
            return { text: '기타', color: 'default', icon: 'mdi-alert-circle-outline' }
    }
})



const startLabel = computed(() => {
    switch (props.project.status) {
        case 'PENDING':
            return props.project.startDate
                ? `예상 시작일 · ${props.project.startDate}`
                : '예상 시작일 · -'
        case 'PROGRESS':
        case 'COMPLETED':
            return props.project.startDate
                ? `실제 시작일 · ${props.project.startDate}`
                : '실제 시작일 · -'
        default:
            return '시작일 · -'
    }
})

const endLabel = computed(() => {
    switch (props.project.status) {
        case 'PENDING':
        case 'PROGRESS':
            return props.project.endDate
                ? `예상 마감일 · ${props.project.endDate}`
                : '예상 마감일 · -'
        case 'COMPLETED':
            return props.project.endDate
                ? `실제 마감일 · ${props.project.endDate}`
                : '실제 마감일 · -'
        default:
            return '마감일 · -'
    }
})

const progressRate = computed(() => props.project.progressRate || 0)
const passedRate = computed(() => props.project.passedRate || 0)
const delayDays = computed(() => props.project.delayDays || 0)

</script>

<template>
    <v-card class="project-card" elevation="1">
        <!-- 좌측: 상태 아이콘 및 메타 정보 -->
        <div class="card-left">
            <v-avatar size="32" class="mr-2">
                <v-icon :color="statusMeta.color">{{ statusMeta.icon }}</v-icon>
            </v-avatar>
            <div class="project-meta">
                <v-chip :color="statusMeta.color" variant="outlined" size="small" class="status-chip">
                    {{ statusMeta.text }}
                </v-chip>
                <div class="project-name">{{ project.name }}</div>
                <div class="date-range">{{ startLabel }} - {{ endLabel }}</div>
            </div>
        </div>

        <!-- 중간: PM 정보 -->
        <div class="card-middle">
            <div class="pm-profile">
                <v-avatar size="40" class="pm-avatar">
                    <img :src="project.director.profileImage" alt="프로필 이미지">
                </v-avatar>
            </div>
            <div class="pm-info">
                <div class="upper-line">
                    <span class="pm-label">Director : </span>
                </div>
                <div class="downer-line">
                    <span class="pm-name">{{ project.director.name }}</span>
                    <span class="pm-title">{{ project.director.jobRoleName }}</span>
                </div>
            </div>
        </div>

        <!-- 우측: 진척률/경과율/지연일 + 메뉴 -->
        <div class="card-right">
            <div class="rate-box">
                <div class="rate-label">진척률</div>
                <DonutChart :value="progressRate"  color="#6750A4" /> <!-- @정민선 @이혜영 Help -->
            
                <!-- <div >{{ progressRate }}%</div> -->
            </div>
            <div class="rate-box">
                <div class="rate-label">경과율</div>
                <DonutChart :value="passedRate" label="경과율" color="#2196F3" /> <!-- @정민선 @이혜영 Help -->
                <!-- <div class="circle">{{ passedRate }}%</div> -->
            </div>
            <div class="rate-box">
                <div class="rate-label">지연일</div>
                <div class="circle" :class="{ 'delay-warning': delayDays > 0 }">
                    {{ delayDays }}일
                </div>
            </div>
            <v-menu>
                <template #activator="{props}">
                    <v-btn icon variant="plain" v-bind="props">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item title="프로젝트 수정" />
                    <v-list-item title="프로젝트 삭제" />
                    <v-list-item
                        title="분석 리포트 생성"
                        :disabled="project.status !== 'COMPLETED'"
                        @click="onGenerateReport"
                    />
                </v-list>
            </v-menu>
        </div>
    </v-card>
</template>

<style scoped>
.project-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 12px;
}

.card-left {
    display: flex;
    align-items: center;
    flex: 1.5;
}

.project-meta {
    display: flex;
    flex-direction: column;
}

.project-name {
    font-size: 18px;
    font-weight: bold;
}

.date-range {
    font-size: 13px;
    color: #666;
}

.card-middle {
    flex: 1;
    display: flex;
    flex-direction: row;
}

.pm-info {
    font-size: 14px;
    white-space: nowrap;
}

.pm-label {
    font-weight: bold;
    margin-right: 4px;
}

.pm-name {
    font-weight: bold;
    margin-right: 4px;
}

.pm-title {
    color: #666;
}

.card-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    justify-content: flex-end;
}

.rate-box {
    text-align: center;
}

.rate-label {
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
}

.circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.status-chip {
    display: inline-flex;
    align-self: flex-start;
    padding: 0 6px;
    height: auto;
    min-width: unset;
    line-height: 1.2;
    font-size: 12px;
}
.delay-warning {
    /* background-color: #ffcccc; */
    color: red;
    font-weight: bold;
}


</style>