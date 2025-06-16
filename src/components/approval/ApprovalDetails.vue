<template>
    <div>
        <div class="main-content" v-if="approvalData">
            <div class="approval-info">
                <div class="details">
                    <div class="info-box">
                        <div class="info-title">결재 요청 제목:</div>
                        <div>{{ approvalData.title }}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-title">해당 프로젝트:</div>
                        <div>{{ approvalData.projectName }}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-title">해당 태스크:</div>
                        <div>{{ approvalData.taskName }}</div>
                    </div>
                    <br/>
                    <div class="info-box">
                        <div class="info-title">구분:</div>
                        <div>{{ approvalData.type }}</div>
                    </div>
                    <div class="info-box" v-if="approvalData.type === 'DELAY'">
                        <div class=info-title>지연 사유:</div>
                        <div>{{ approvalData.delayReason }}</div>
                    </div>
                    <br/>
                    <div class="info-box" v-if="approvalData.type === 'DELAY'">
                        <div class="info-title">[지연 영향]</div>
                    </div>
                </div>

                <div class="participant">
                    <div style="font-size: 14px; font-weight: bold;">기안자: {{ approvers.join(', ')  }}</div>
                    <div style="font-size: 12px">참조자: {{ viewers.join(', ') }}</div>
                </div>
            </div>

            <div class="content">
                <div class="content-title">결재 요청 내용</div>
                <div class="content-scroll">
                    {{ approvalData.content }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue'
    import api from '@/api'

    const emit = defineEmits(['close'])
    
    const props = defineProps ({
        approvalId: Number
    })

    const approvalData = ref(null)

    // 승인자 열람자 계산
    const approvers = computed(() => {
        return approvalData.value?.approvalParticipants?.filter(p => p.participantRole === 'APPROVER')
        .map(p => p.participantName) || null
    })
    const viewers = computed(() => {
        return approvalData.value?.approvalParticipants?.filter(p => p.participantRole === 'VIEWER')
        .map(p => p.participantName) || null
    })

    // API 호출 함수
    const fetchApprovalData = async (id) => {
        if(!id) return
        try {
            const response = await api.get(`/api/approval/details/${id}`)
            approvalData.value = response.data.data
        } catch(error) {
            error(error.message)
        }
    }

    onMounted(() => {
        fetchApprovalData(props.approvalId)
    })

    watch(() => props.approvalId, (newId, oldId) => {
        if (newId && newId !== oldId) {
            fetchApprovalData(newId)
        }
    })
</script>

<style scoped>
    .main-content {
        padding: 12px;
        height: 70vh;
        border: 1px solid black;
    }
    .approval-info {
        display: flex;
        justify-content: space-between;
        height: 60%
    }
    .participant {
        flex: 1;
        border: 1px solid black;
        text-align: right;
        padding-right: 6px;
    }
    .details {
        flex: 2;
        border: 1px solid black;
        padding-left: 6px
    }
    .content-scroll {
        border: 1px solid black;
        overflow-y: auto;
        padding-left: 6px;
        height: 160px;
    }
    .content-title {
        font-weight: bold;
        font-size: 14px;
        padding-left: 6px;
    }
    .info-box {
        display: flex;
        gap: 6px;
    }
    .info-title {
        font-weight: bold;
    }
</style>