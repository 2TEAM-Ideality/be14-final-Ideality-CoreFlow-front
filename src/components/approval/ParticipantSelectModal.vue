<template>
    <div class="modal-overlay">
        <div class="modal">
            <div class="modal-content">
                <input v-model="search" placeholder="이름 검색" class="input-box" />


                <div v-for="user in paginatedUsers" :key="user.id">
                    <label>
                        <input
                            v-if="props.type === 'viewer'"
                            type="checkbox"
                            v-model="selectedUsers"
                            :value="user"
                        />
                        <input
                            v-else
                            type="radio"
                            name="approver"
                            v-model="selectedUser"
                            :value="user"
                        />
                        {{ user.name }}
                    </label>
                </div>

                <!-- 페이지네이션 UI -->
                <div class="pagination">
                    <button class="pagination-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">이전</button>
                    <input type="number" v-model="targetPage" style="width: 40px; border: 1px solid black; border-radius: 6px; text-align: end;"/>
                    <span>/ {{ totalPages }}</span>
                    <button class="pagination-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">다음</button>
                    <button class="pagination-btn" @click="goToPage(targetPage)">이동</button>
                </div>

                <div class="btn-group">
                    <button class="btn close-btn" @click="$emit('close')">취소</button>
                    <button class="btn confirm-btn" @click="confirmSelection">확인</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
    type: String,
    userList: Array,
    selectedApprover: Object,
    selectedViewers: Array
})
const emit = defineEmits(['close', 'select'])

const search = ref('')
const selectedUser = ref(null)
const selectedUsers = ref([])

onMounted(() => {
    if (props.type === 'approver') {
        selectedUser.value = props.selectedApprover || null
    } else {
        selectedUsers.value = [...props.selectedViewers]
    }
})

const filteredUsers = computed(() => {
    if (!search.value) return props.userList
    return props.userList.filter(user => user.name.toLowerCase().includes(search.value.toLocaleLowerCase()))
})

function confirmSelection() {
    if (props.type === 'approver') {
        console.log('자식 approver선택', selectedUser.value)
        emit('select', selectedUser.value)
    } else {
        console.log('자식 viewer 선택', selectedUsers.value)
        emit('select', selectedUsers.value)
    }
    emit('close')
}

const currentPage = ref(1)
const pageSize = 8
const targetPage=ref(1)

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredUsers.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize))

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    } else {
        alert('요청하신 페이지 값이 올바르지 않습니다.')
    }
}

watch(currentPage, (newVal) => {
    targetPage.value = newVal
})
</script>

<style scoped>
    .input-box {
        border: 1px solid black;
        border-radius: 6px;
        padding-left: 6px;
        margin-bottom: 12px;
        width: 100%;
    }
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal {
        position: relative;
        width: 300px;
        border-radius: 20px;
        background-color: white;
        display: flex;
        padding: 20px;
    }
    .modal-content {
        width: 100%;
    }
    .btn-group {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        gap: 20px;
    }
    .btn {
        border-radius: 6px;
        width: 100%;
        color: white
    }
    .btn:hover {
        background-color: black;
    }
    .close-btn {
        background-color: #ff9090;
        border: 1px solid #720000;
    }
    .confirm-btn {
        background-color: #9090ff;
        border: 1px solid #000072;
    }
    .pagination {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 12px;
    }
    .pagination-btn {
        border-radius: 6px;
        border: 1px solid black;
        padding: 0 6px;
    }
    .pagination-btn:hover {
        background-color: black;
        color: white
    }
</style>