<template>
    <div class="content-box">
        <div class="left-area">
            <div>
                <div class="content-title">결재 제목</div>
                <input 
                class="input-box"
                v-model="title"
                style="width: 500px"
                />
            </div>
            <div class="two-space">
                <!-- 프로젝트 드롭다운 -->
                <div class="box">
                    <div class="content-title">해당 프로젝트</div>
                    <select v-model="selectedProjectId" id="project" class="input-box">
                        <option 
                            v-for="project in projectList" 
                            :key="project.id" 
                            :value="project.id"
                        >
                            {{ project.name }}
                        </option>
                    </select>
                </div>
                <!-- 태스크 드롭다운 -->
                <div class="box">
                    <div class="content-title">해당 태스크</div>
                    <select v-model="selectedTaskId" id="task" class=input-box :disabled="!selectedProjectId">
                        <option
                        v-for="task in filteredTaskList"
                        :key="task.id"
                        :value="task.id"
                        >
                        {{ task.name }}
                        </option>
                    </select>
                </div>
            </div>
            <div>
                <!-- 구분 드롭다운 -->
                <div class="content-title">구분</div>
                <select v-model="approvalType" id="type" class="input-box">
                    <option
                        v-for="type in approvalTypeList"
                        :key="type"
                        :value="type"
                    >
                        {{ type }}
                    </option>
                </select>
            </div>
            <!-- 지연시 추가 입력 -->
            <div v-if="isDelay" class="two-space">
                <div>
                    <!-- 지연 사유 리스트 -->
                    <div class="content-title">지연 사유</div>
                    <select v-model="selectedDelayReasonId" id="delayReason" class="input-box">
                        <option
                            v-for="delayReason in delayResons"
                            :key="delayReason.id"
                            :value="delayReason.id"
                        >
                            {{ delayReason.reason }}
                        </option>
                    </select>
                </div>
                <div>
                    <div class="content-title">태스크 지연일</div>
                    <input class="input-box" v-model="delayDays" type="number"/>
                </div>
            </div>
            <div>
                <div class="content-title">상세 내용</div>
                <textarea  
                class="input-box" 
                v-model="content" 
                style="width: 500px; overflow-y: auto; height: 50px;"
                ></textarea>
            </div>
            <div v-if="isDelay">
                <div class="content-title">조치 내용</div>
                <textarea  
                class="input-box" 
                v-model="actionDetail" 
                style="width: 500px; overflow-y: auto; height: 50px;"
                ></textarea>
            </div>
            <div>
                <div class="content-title">첨부 파일</div>
                <input
                    type="file"
                    id="fileInput"
                    class="input-box"
                    multiple
                    @change="handleFileChange"
                    style="width: 500px;"
                />
            </div>
        </div>
        <div class="right-area">
            <div class="participant-box">
                <div class="sub-area">
                    <div class="participant-title">결재자</div>
                    <button @click="openModal('approver')">조회</button>
                </div>
                <div class="approval-participant">
                    {{ selectedApprover?.name || '선택 안됨' }}
                </div>
            </div>
            <br>
            <div class="participant-box">
                <div class="sub-area">
                    <div class="participant-title">참조자</div>
                    <button @click="openModal('viewer')">조회</button>
                </div>
                <div class="approval-participant" @click.stop="toggleViewerList">
                    {{ 
                        selectedViewers.length === 0 
                        ? '선택 안됨' 
                        : selectedViewers.length === 1
                            ? selectedViewers[0].name
                            : `${selectedViewers[0].name} 외 ${selectedViewers.length - 1}명` }}
                </div>
                <!-- 전체 리스트 드롭다운 -->
                <div
                    v-if="showViewerList"
                    class="viewer-list-dropdown"
                >  
                    <div>전체 참조자 목록</div>
                    <ul>
                        <li v-for="viewer in selectedViewers" :key="viewer.id">
                            {{ viewer.name }}
                        </li>
                    </ul>
                </div>
                <div>{{ selectedApprover }}</div>
                <div>{{ selectedViewers }}</div>
            </div>
        </div>
    </div>
    <div style="display:flex; justify-content: end;">
        <button class="create-btn">보내기</button>
    </div>
    <ParticipantSelectModal
        v-if="showModal"
        :type="modalType"
        :user-list="filteredUserListForModal"
        :selected-approver="selectedApprover"
        :selected-viewers="selectedViewers"
        @close="showModal = false"
        @select="handleUserSelect"
    />
</template>

<script setup>
import api from '@/api';
import { ref, onMounted, computed, watch } from 'vue'
import ParticipantSelectModal from './ParticipantSelectModal.vue';

const delayResons = ref([])
const projectList = ref([])
const taskList = ref([])
const filteredTaskList = computed(() => {
    return taskList.value[selectedProjectId.value]
})
const approvalTypeList = [ '일반', '산출물', '지연' ]
const projectIds = ref([])
// 참여자 리스트
const participantList = ref([])
const filteredUserListForModal = computed(() => {
    if (modalType.value === 'viewer' && selectedApprover.value) {
        return userList.value.filter(user => user.id !== selectedApprover.value.id) 
    }
    return userList.value
})
// 테스트용
const showModal = ref(false)
const modalType = ref('') // 'approver','viewer'
const userList = ref([
    {id: 1, name:'test1'},
    {id: 2, name: 'test2'},
    {id: 3, name: 'test3'},
    {id: 4, name: 'test4'},
    {id: 5, name: 'test5'},
    {id: 6, name: 'test6'},
    {id: 7, name: 'test7'},
    {id: 8, name: 'test8'},
    {id: 9, name: 'test9'},
    {id: 10, name: 'test10'},
    {id: 11, name: 'test11'},
    {id: 12, name: 'test12'},
    {id: 13, name: 'test13'},
    {id: 14, name: 'test14'},
    {id: 15, name: 'test15'},
    {id: 16, name: 'test16'},
    {id: 17, name: 'test17'},
    {id: 18, name: 'test18'},
    {id: 19, name: 'test19'},
    {id: 20, name: 'test20'},
    {id: 21, name: 'test21'},
    {id: 22, name: 'test22'},
    {id: 23, name: 'test23'},
    {id: 24, name: 'test24'},
    {id: 25, name: 'test25'},
    {id: 26, name: 'test26'}
])

// 결재자, 참조자
const selectedApprover = ref(null)
const selectedViewers = ref([])


watch(selectedApprover, (newApprover) => {
    if (!newApprover) return
    selectedViewers.value = selectedViewers.value.filter(v => v.id !== newApprover.id)
})

function openModal(type) {
    modalType.value = type
    showModal.value = type
}

function handleUserSelect(selectedUsers) {
    if (modalType.value === 'approver') {
        selectedApprover.value = selectedUsers || null
    } else {
        selectedViewers.value = selectedUsers
    }
    showModal.value = false
}

const showViewerList = ref(false)
function toggleViewerList() {
    showViewerList.value = !showViewerList.value
}

const title = ref('')
const selectedProjectId = ref(null)
const selectedTaskId = ref(null)
const approvalType = ref('')
const selectedDelayReasonId = ref(null)
const delayDays = ref(null)
const content = ref('')
const actionDetail = ref('')
const selectedFiles = ref([])

const isDelay = computed(() => approvalType.value === '지연')

function handleFileChange(event) {
    const files = Array.from(event.target.files)
    selectedFiles.value = files
}

onMounted(async() => {
    const projectResponse = await api.get('/api/projects/list')
    projectList.value = projectResponse.data.data
    projectIds.value = projectList.value.map(p => p.id)
    const delayResponse = await api.get('/api/approval/delay-reason')
    delayResons.value = delayResponse.data.data
    const taskResponse = await api.post('/api/projects/tasks/list', {
        projectIds: projectIds.value
    })
    taskList.value = taskResponse.data.data

    // 참여자에서 결재자, 참조자 설정
    // Map<Long, User> 형태로 받을 것 프로젝트 ids로 참여자 조회해오기
})
</script>

<style scoped>
    .content-box {
        padding-left: 18px;
        border: 1px solid black;
        height: 90%;
        display: flex;
    }
    .content-title {
        font-weight: bold;
        font-size: 14px;
    }
    .input-box {
        border-radius: 6px;
        border: 1px solid black;
        padding: 0 6px;
        font-size: 14px;
        width: 240px;
    }
    .create-btn {
        margin-top: 6px;
        padding: 3px;
        background-color: #9090ff;
        color: white;
        border-radius: 6px;
    }
    .create-btn:hover {
        background-color: black;
    }
    .two-space {
        display: flex;
        gap: 20px;
    }
    .left-area {
        flex: 2;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .right-area {
        flex: 1;
        border: 1px solid black;
        display: flex;
        flex-direction: column;
        align-items: end;
    }
    .participant-box {
        width: 80%;
        padding-right: 20px;
        padding-top: 10px;
    }
    .participant-title {
        font-weight: bold;
    }
    .sub-area {
        display: flex;
        justify-content: space-between;
    }
    .approval-participant {
        border: 1px solid black;
        border-radius: 6px;
        padding-left: 6px
    }
    
    .viewer-list-dropdown {
        z-index: 1000;
        padding: 6px;
    }
    .viewer-list-dropdown ul {
        list-style: none;
    }
</style>