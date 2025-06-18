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
                        <div>{{ approvalTypeMap[approvalData.type] }}</div>
                    </div>
                    <div class="info-box" v-if="approvalData.type === 'DELAY'">
                        <div class=info-title>지연 사유:</div>
                        <div>{{ approvalData.delayReason }}</div>
                    </div>
                    <br/>
                    <div v-if="approvalData.type === 'DELAY' && approvalData.status === 'PENDING'" class="delay">
                        <div class="info-title">[지연 예상 영향]</div>
                        <div class="info-box">
                            <div class="info-title">태스크 지연일:</div>
                            <div>{{ approvalData.delayDaysByTaskName[approvalData.taskId]?.delayDays }}일</div>
                        </div>
                        <div class="info-box">
                            <div class=info-title>프로젝트 지연일:</div>
                            <div>{{ approvalData.delayDaysByTask }}일</div>
                        </div>

                        <div class="info-box">
                            <div class="info-title">기존 프로젝트 예상 마감일:</div>
                            <div>{{ approvalData.originProjectEndExpect }}</div>
                        </div>
                        <div class="info-box">
                            <div class="info-title">지연 반영 후 프로젝트 예상 마감일:</div>
                            <div>{{ approvalData.newProjectEndExpect }}</div>
                        </div>
                        <div class="info-box">
                            <div class="info-title">영향 받을 태스크 목록:</div>
                            <div>총 {{ approvalData.taskCountByDelay }}개 지연</div>
                            <button style="color: gray; font-size: 12px; align-items: center;" @click="showDelayExpect = !showDelayExpect">자세히</button>
                        </div>
                    </div>
                </div>

                <div class="participant">
                    <div style="font-size: 14px; font-weight: bold;">기안자: {{ approvers.join(', ')  }}</div>
                    <div style="font-size: 12px">참조자: {{ viewers.join(', ') }}</div>
                </div>
            </div>

            <div class="content">
                <div class="content-title">상세 내용</div>
                <div class="content-scroll">
                    {{ approvalData.content }}
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
        <div class="delayExpectModal" v-if="showDelayExpect" v-for="(value, key) in approvalData.delayDaysByTaskName" :key="key">
            <div style="display: flex; justify-content: end; margin: 6px 0;">
                <button @click="showDelayExpect = false">x</button>
            </div>
            <div style="display: flex; justify-content: center; gap: 6px; font-size: 14px;">
                <div style="font-weight: bold;">{{ value.name }}:</div>
                <div>{{ value.delayDays }}일</div>
            </div>
        </div>

        <!-- 승인 모달 -->
        <div class="approve-modal modal" v-if="showApproveModal">
            <div class="title-area">
                <div class="modal-title">승인</div>
                <button @click="showApproveModal = false">x</button>
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
                <button @click="showRejectModal = false">x</button>
            </div>
            <textarea v-model="rejectReason" class="input-area"></textarea>
            <button class="reject-submit submit" @click="rejectApproval">반려하기</button>
        </div>
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
            isApprover();
            isRequester();
            closeModal();
        } catch(error) {
            alert(error.response.data.message);
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
</script>

<style scoped>
    .main-content {
        padding: 12px;
        height: 70vh;
    }
    .approval-info {
        display: flex;
        justify-content: space-between;
        height: 70%
    }
    .participant {
        flex: 1;
        text-align: right;
        padding-right: 6px;
    }
    .details {
        flex: 2;
        padding-left: 6px
    }
    .content-scroll {
        border: 1px solid black;
        overflow-y: auto;
        padding-left: 6px;
        height: 130px;
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
        z-index: 1000;
        top: 35%;
        left: 66%;
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
    }
    .approve-modal {
        position: absolute;
        top: 76%;
        left: 78.5%;
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
</style>