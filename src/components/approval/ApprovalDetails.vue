<template>
    <div>
        <div class="main-content" v-if="approvalData">
            <div class="content-wrapper">
                <div style="display: flex; flex-direction: column; width: 100%;">
                    <div class="title">{{ typeLabel }}</div>
                    <div style="display: flex;">
                        <div style="border-right: 1px solid black" class="header-area">
                            <div class="header-box">
                                <div class="header-title">제목</div>
                                <div class="header-content">{{ approvalData.title }}</div>
                            </div>
                            <div class="header-box">
                                <div class="header-title">프로젝트</div>
                                <div class="header-content">{{ approvalData.projectName }}</div>
                            </div>
                            <div class="header-box">
                                <div class="header-title">태스크</div>
                                <div class="header-content">{{ approvalData.taskName }}</div>
                            </div>
                        </div>
                        <div class="participant-area">
                            <div class="participant-box">
                                <div class="participant-title">기안자</div>
                                <div class="participant-content">
                                    <div>{{ approvalData.requesterDeptName}}_{{ approvalData.requesterName  }}</div>
                                </div>
                            </div>
                            <div class="participant-box">
                                <div class="participant-title">결재자</div>
                                <div class="participant-content"> {{ approvers.join(',') }}</div>
                            </div>
                            <div class="participant-box">
                                <div class="participant-title">{{ approvalData.status === 'PENDING'? '기안 일시' : '처리 일시' }}</div>
                                <div class="participant-content">{{ formatted }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="content-area area">
                        <div class="content-title">
                            <div>상세 내용</div>
                        </div>
                        <div class="content-scroll">{{ approvalData.content }}</div>
                    </div>
                    <div class="attachment-area area">
                        <div class="content-title">
                            <div>첨부 파일</div>
                        </div>
                        <div class="content-scroll" v-if="approvalData?.attachmentPreviewInfo?.length">
                            <div 
                                v-for="(file, index) in approvalData.attachmentPreviewInfo"
                                :key="index"
                                class="file-link"
                                @click="openInNewTab(file.url)"
                            >
                            📎{{ file.originName }}
                            </div>
                        </div>
                    </div>
                    <div class="area" v-if="approvalData.type === 'DELAY'">
                        <div class="content-title">지연 사유</div>
                        <div class="content">{{ approvalData.delayReason }}</div>
                    </div>
                    <div class="delay-info-area" v-if="approvalData.type === 'DELAY' && approvalData.status === 'PENDING'">
                        <div class="delay-info-title content-title">
                            <div>지연 예상 영향</div>
                        </div>
                        <div class="delay-info-box">
                            <div class="delay-info">
                                <div class="delay-title">
                                    태스크 지연일
                                </div>
                                <div>{{ approvalData.delayDaysByTaskName[approvalData.taskId]?.delayDays }} 일</div>
                            </div>
                            <div class="delay-info">
                                <div class="delay-title">
                                    프로젝트 지연일
                                </div>
                                <div>{{ approvalData.delayDaysByTask }} 일</div>
                            </div>
                            <div class="delay-info">
                                <div class="delay-title">기존 예상 마감일</div>
                                <div>{{ approvalData.originProjectEndExpect }}</div>
                            </div>
                            <div class="delay-info">
                                <div class="delay-title">변경 예상 마감일</div>
                                <div>{{ approvalData.newProjectEndExpect }}</div>
                            </div>
                            <div class="delay-info">
                                <div class="delay-title">영향 받는 태스크 목록</div>
                                <div>총 {{ approvalData.taskCountByDelay }}개 지연</div>
                                <button style="color: gray; font-size: 12px; align-items: center;" @click="showDelayExpect = !showDelayExpect">자세히</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="btn-area">
        <div v-if="approver && approvalData.status === 'PENDING'" class="approved-area">
            <button class="btn approve" @click="handleApprove">승인하기</button>
            <button class="btn reject" @click="showRejectModal = true; showApproveModal = false; showAddViewer = false">반려하기</button>
        </div>
        <div v-if="requester && approvalData.status === 'PENDING'">
            <button class="btn cancelled" @click="cancelledApproval">취소하기</button>    
        </div>
        <div v-if="approvalData?.status !== 'PENDING'">
            <div class="completed" disabled>결재 완료</div>
        </div>
    </div>

    <!-- 자세히 버튼 -->
    <div class="delayExpectModal" v-if="showDelayExpect">
        <div style="display: flex; justify-content: end; margin: 6px 0;">
            <button @click="showDelayExpect = false">
                <v-icon style="font-size: 18px;">mdi-close</v-icon>
            </button>
        </div>
        <div v-for="(value, key) in approvalData.delayDaysByTaskName" :key="key" style="display: flex; gap: 6px; font-size: 14px;">
            <div style="font-weight: bold;">{{ value.name }}:</div>
            <div>{{ value.delayDays }}일</div>
        </div>
    </div>

    <!-- 승인 모달 -->
    <div class="approve-modal modal" v-if="showApproveModal">
        <div class="title-area">
            <div class="modal-title">승인</div>
            <button @click="showApproveModal = false">
                <v-icon style="font-size: 18px;">mdi-close</v-icon>
            </button>
        </div>
        <button @click="showAddViewer = true" class="submit add-viewer">참조자 추가하기</button>
        <button class="approve-submit submit" @click="approveApproval">승인하기</button>
    </div>

    <!-- 참조자 추가 모달 -->
    <ParticipantSelectModal
        v-if="showAddViewer"
        :type="'viewer'"
        :user-list="filteredUserList"
        :selected-approver=null
        :selected-viewers="selectedViewers"
        @close="showAddViewer = false"
        @select="handleUserSelect"
    />

    <!-- 반려 모달 -->
    <div class="reject-modal modal" v-if="showRejectModal">
        <div class="title-area">
            <div class="modal-title">반려 사유</div>
            <button @click="showRejectModal = false">
                <v-icon style="font-size: 18px;">mdi-close</v-icon>
            </button>
        </div>
        <textarea v-model="rejectReason" class="input-area"></textarea>
        <button class="reject-submit submit" @click="rejectApproval">반려하기</button>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue'
    import api from '@/api'
    import { useUserStore } from '@/stores/userStore'
    import ParticipantSelectModal from './ParticipantSelectModal.vue'
    
    const showDelayExpect = ref(false)
    const showApproveModal = ref(false)
    const showRejectModal = ref(false)
    const showAddViewer = ref(false)

    const rejectReason = ref('')

    function closeModal() {
        showDelayExpect.value = false
        showApproveModal.value = false
        showRejectModal.value = false
        showAddViewer.value = false
    }

    const userStore = useUserStore();

    const emit = defineEmits(['close', 'remount'])
    
    const props = defineProps ({
        approvalId: Number
    })

    const approvalData = ref(null)
    const approver = ref(false)
    const requester = ref(false)

    const userList = ref([])

    const filteredUserList = computed(() => {
        if (userList.value === null || userList.value.length === 0 ) return
        const excludedIds = new Set([
            approvalData.value.requesterId,
            ...approvalData.value.approvalParticipants.map(p => p.participantId)
        ])
        console.log('excludedIds', excludedIds)
        return userList.value.filter(user => !excludedIds.has(user.id) && user.isInner === true)
    })

    const selectedViewers = ref([])

    const selectedViewerIds = computed(() => {
        return selectedViewers.value.map(user => user.id)
    })

    const approvalTypeMap = {
        'GENERAL': '일반',
        'DELIVERABLE': '산출물',
        'DELAY': '지연'
    }

    // 승인자 열람자 계산
    const approvers = computed(() => {
        return approvalData.value?.approvalParticipants?.filter(p => p.participantRole === 'APPROVER')
        .map(p => p.participantDeptName + "_" + p.participantName) || null
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
            isApprover();
            isRequester();
            closeModal();
        } catch(error) {
            alert(error.response.data.message);
        }
    }

    onMounted(() => {
        fetchApprovalData(props.approvalId)
        console.log('taskCountByDelay', approvalData.taskCountByDelay)
    })

    watch(() => props.approvalId, (newId, oldId) => {
        if (newId && newId !== oldId) {
            fetchApprovalData(newId)
        }
    })

    function isApprover() {
        const participants = approvalData.value?.approvalParticipants
        const userId = userStore.id

        approver.value = participants.some(participant =>
            participant.participantId === userId && participant.participantRole === 'APPROVER')
    }

    function isRequester() {
        requester.value = approvalData.value.requesterId === userStore.id
    }

    async function cancelledApproval() {
        const confirmed = confirm('취소하시겠습니까')
        if (!confirmed) return;

        try {
            const response = await api.patch(`/api/approval/cancelled/${props.approvalId}`)
            approvalData.type = 'CANCELLED'
            emit('remount')
            showDelayExpect.value = false
            alert(response.data.message)
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message);
            }
        }
    }

    async function approveApproval() {
        const confirmed = confirm('승인하시겠습니까')
        if (!confirmed) return

        try {
            const response = await api.patch('/api/approval/approve', {
                approvalId: props.approvalId,
                viewerIds: selectedViewerIds.value,
                delayDays: approvalData.value.delayDays
            })
            alert(response.data.message)
            approvalData.status = 'APPROVED'
            emit('remount')
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message)
            }
        }
    }

    async function rejectApproval() {
        const confirmed = confirm('반려하시겠습니까')
        if (!confirmed) return

        try {
            const response = await api.patch('/api/approval/reject', {
                approvalId: props.approvalId,
                reason: rejectReason.value
            })
            alert(response.data.message)
            approvalData.status = 'REJECT'
            emit('remount')
        } catch (error) {
            if (error.response) {
            alert(error.response.data.message);
        }
        }
    }
    async function handleApprove() {
        const response = await api.get('/api/users/find-all')
        
        userList.value = response.data.data
        console.log('userList', userList)

        showApproveModal.value = true
        showRejectModal.value = false
    }
    function handleUserSelect(selectedUsers) {
        selectedViewers.value = selectedUsers
        showAddViewer.value = false
    }

    function openInNewTab(url) {
        window.open(url, '_blank');
    }

    const date = computed(() => {
        if (approvalData.value.status === 'PENDING') {
            return approvalData.value.createdAt
        } else {
            return approvalData.value.approvedAt
        }
    })

    const formatted = computed(() => {
        const parsedDate = new Date(date.value)
        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(parsedDate);
    })

    const typeLabel = computed(() => {
    switch (approvalData.value.type) {
        case 'GENERAL':
            return '일반 결재'
        case 'DERIVERABLE':
            return '산출물 보고서'
        case 'DELAY':
            return '지연 사유서'
        default:
            return '알 수 없음'
    }
})
</script>

<style scoped>
    .main-content {
        height: 70vh;
        width: 100%;
    }
    .content-wrapper {
        border-top: 1px solid black;
        border-left: 1px solid black;
        border-right: 1px solid black;
    }
    .title {
        font-weight: bold;
        font-size: 24px;
        text-align: center;
        padding: 6px 0;
        background-color: #ccc;
        border-bottom: 1px solid black;
    }
    .participant-area {
        flex: 1;
        text-align: left;
    }
    .participant-box {
        display: flex;
        border-bottom: 1px solid black;
    }
    .participant-title {
        font-weight: bold;
        flex: 1;
        text-align: left;
        padding-left: 6px;
        background-color: #ccc;
        border-right: 1px solid black;
    }
    .participant-content {
        flex: 3;
        text-align: left;
        padding-left: 6px;
    }
    .header-area {
        flex: 1.7;
        width: 100%;
    }
    .header-box {
        display: flex;
        width: 100%;
        border-bottom: 1px solid black;
    }
    .header-title {
        background-color: #cccccc;
        font-weight: bold;
        width: 130px;
        text-align: left;
        padding-left: 6px;
        border-right: 1px solid black;
    }
    .header-content {
        text-align: left;
        padding-left: 6px;
    }
    .attachment-area {
        height: 100px;
    }
    .content-area {
        height: 120px;
    }
    .delay-info-area {
        display: flex;
    }
    .delay-info-box {
        flex: 1;
    }
    .delay-info-title{
        border-bottom: 1px solid black;
    }
    .delay-info {
        display: flex;
        gap: 12px;
        border-bottom: 1px solid black;
    }
    .delay-title {
        background-color: #ccc;
        width: 160px;
        padding-left: 6px;
        border-right: 1px solid black;
    }
    .area {
        border-bottom: 1px solid black;
        display: flex;
    }
    .content-scroll {
        overflow-y: auto;
        padding-left: 6px;
        text-align: left;
        flex: 1;
    }
    .content-title {
        font-weight: bold;
        width: 130px;
        padding-left: 6px;
        display: flex;
        align-items: center;
        border-right: 1px solid black;
        background-color: #cccccc;
    }
    .content {
        flex: 1;
        padding-left: 6px;
    }
    .info-box {
        display: flex;
        gap: 6px;
    }
    .info-title {
        font-weight: bold;
        text-align: left;
    }
    .btn-area {
        margin-top: 12px;
        display: flex;
        gap: 12px;
        justify-content: end;
        margin-right: 12px;
    }
    .approved-area {
        display: flex;
        gap: 12px;
    }
    .btn {
        display: flex;
        justify-content: center;
        border-radius: 6px;
        border: 1px solid gray;
        padding: 3px;
        width: 100px;
        color: white;
    }
    .btn:hover {
        background-color: black;
    }
    .completed {
        display: flex;
        justify-content: center;
        border-radius: 6px;
        border: 1px solid gray;
        padding: 3px;
        width: 100px;
        color: white;
        background-color: #909090;
    }
    .approve {
        background-color: #9090ff;
    }
    .reject {
        background-color: #ff9090;
    }
    .cancelled {
        background-color: #909090;
    }
    .delay {
        font-size: 14px;
    }
    .delayExpectModal {
        position: absolute;
        background-color: white;
        border-radius: 14px;
        padding: 0 20px;
        padding-bottom: 20px;
        z-index: 10;
        top: 56%;
        left: 74%;
        border: 1px solid gray;
        height: 240px;
        overflow-y: auto;
    }
    .modal {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: white;
        box-shadow: 0px 3px 9px rgba(0,0,0,.5);
        border-radius: 12px;
    }
    .modal-title {
        font-weight: bold;
    }
    .input-area {
        border-radius: 6px;
        border: 1px solid black;
        width: 200px;
        overflow-y: auto;
        margin: 0 12px;
        padding: 0 6px;
        height: 100px;
    }
    .title-area {
        width: 200px;
        overflow-y: auto;
        margin: 0 12px;
        padding-top: 6px;
        display: flex; 
        justify-content: space-between; 
    }
    .reject-modal {
        position: absolute;
        top: 67%;
        left: 83%;
        z-index: 1000;
    }
    .approve-modal {
        position: absolute;
        top: 76%;
        left: 78.5%;
        z-index: 1000;
    }
    .submit {
        border: 1px black solid;
        width: 200px;
        border-radius: 6px;
        margin: 6px 0;
        color: white;
    }
    .submit:hover {
        background-color: black;
    }
    .approve-submit {
        background-color: #9090ff;
    }
    .reject-submit {
        background-color: #ff9090;
    }
    .addViewer-modal {
        position: absolute;
        top: 50%;
    }
    .add-viewer {
        background-color: gray;
    }
    .file-link {
        cursor: pointer;
        color: black;
        font-size: 14px;
    }
    .file-link:hover {
        color: #0b59d8;
    }
</style>