<template>
    <div class="modal-overlay">
        <div class="modal">
            <h2 class="text-xl font-semibold mb-4 mt-4">구성원 계정 생성</h2>
            <button @click="$emit('close')" class="close-btn">X</button>

            <div class="mb-2 input-box">
                <label class="block mb-1" style="font-weight: bold;">이름</label>
                <input
                    ref="nameInput"
                    v-model="name"
                    placeholder="이름을 입력해주세요"
                    class="px-2 py-2 border"
                    style="border-radius: 8px;"
                />
                <small v-if="!name" class="error">
                    이름을 입력해주세요.
                </small>
            </div>
            <div class="mb-2 input-box">
                <label class="block mb-1" style="font-weight: bold;">이메일</label>
                <input
                    v-model="email"
                    placeholder="이메일을 입력해주세요."
                    class="px-2 py-2 border"
                    style="border-radius: 8px;"
                />
                <small v-if="!email" class="error">이메일을 입력해주세요.</small>
                <small v-if="email && !isEmailValid" class="error">
                    이메일 형식이 올바르지 않습니다.
                </small>
            </div>
            <div class="space-wrapper">
                <div class="mb-2 input-box" style="width: 180px">
                    <label class="block mb-1" style="font-weight: bold;">생일</label>
                    <input
                        type="date"
                        v-model="birth"
                        style="border-radius: 8px;"
                        class="px-2 py-2 border two-box"
                    />
                    <small v-if="!birth" class="error">생일을 입력해주세요.</small>
                </div>
                <div class="mb-2 input-box" style="width: 180px">
                    <label class="block mb-1" style="font-weight: bold;">입사일</label>
                    <input
                        type="date"
                        v-model="hireDate"
                        style="border-radius: 8px;"
                        class="px-2 py-2 border two-box drop-down"
                    />
                    <small v-if="!hireDate" class="error">입사일을 입력해주세요.</small>
                </div>
            </div>
            <div class="space-wrapper">
                <div class="mb-2 input-box" style="width: 180px">
                    <label class="block mb-1" style="font-weight: bold;">부서</label>
                    <select 
                        v-model="deptId" 
                        class="py-1 border radius-box two-box drop-down text-black"
                        style="border-radius: 8px; padding-left: 8px;"
                    >
                        <option v-for="dept in props.deptList" :key="dept.id" :value="dept.id">
                            {{ dept.name }}
                        </option>
                    </select>
                    <small v-if="!deptId" class="error">부서를 선택해주세요.</small>
                </div>
                <div class="mb-2 input-box" style="width: 180px">
                    <label class="block mb-1 " style="font-weight: bold;">직위</label>
                    <select 
                        v-model="jobRankName" 
                        class="py-1 border radius-box two-box drop-down text-black"
                        style="border-radius: 8px; padding-left: 8px"
                    >
                        <option v-for="jobRank in props.jobRankList" :key="jobRank.id" :value="jobRank.name">
                            {{ jobRank.name }}
                        </option>
                    </select>
                    <small v-if="!jobRankName" class="error">직위를 선택해주세요.</small>
                </div>
            </div>
            <div class="space-wrapper">
                <div class="mb-2 input-box" style="width: 180px">
                    <label class="block mb-1 " style="font-weight: bold;">직책</label>
                    <select 
                        v-model="jobRoleName" 
                        class="py-1 border radius-box two-box drop-down text-black"
                        style="border-radius: 8px; padding-left: 8px;"
                    >
                        <option v-for="jobRole in props.jobRoleList" :key="jobRole.id" :value="jobRole.name">
                            {{ jobRole.name }}
                        </option>
                    </select>
                    <small v-if="!jobRoleName" class="error">직책을 선택해주세요.</small>
                </div>
                <div class="mb-2 input-box" style="width: 180px">
                    <label class="block mb-1 " style="font-weight: bold;">프로젝트 생성 권한</label>
                    <select 
                        v-model="isCreation" 
                        class="py-1 border radius-box two-box drop-down text-black"
                        style="border-radius: 8px; padding-left: 8px;"
                    >
                        <option :value="true">생성 가능</option>
                        <option :value="false">생성 불가</option>
                    </select>
                </div>
            </div>
            <div class="btn-wrapper">
                <button
                    @click="createUser"
                    class="create-btn"
                    :disabled="!canSubmit"
                >
                    계정 생성하기
                </button>
            </div>
            <LoadingModal v-if="isLoading" :today="new Date()" message="구성원 등록 중..." />
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, nextTick, computed } from 'vue'
    import api from '@/api'
    import LoadingModal from '../common/LoadingModal.vue'
    
    const props = defineProps({
        deptList: Array,
        jobRankList: Array,
        jobRoleList: Array,
    })
    const nameInput = ref('')

    onMounted(async () => {
        await nextTick()
        nameInput.value?.focus()
    })

    const isLoading = ref(false)

    const name = ref('')
    const email = ref('')
    const birth = ref(null)
    const hireDate = ref(null)
    const deptId = ref(null)
    const deptName = computed(() => {
        const selectedDept = props.deptList.find(dept => dept.id === deptId.value)
        return selectedDept ? selectedDept.name : ''
    })
    const jobRankName = ref('')
    const jobRoleName = ref('')
    const isCreation = ref(false)
    const emit = defineEmits(['user-created', 'close'])

    const canSubmit = computed(() =>
        name.value &&
        email.value &&
        birth.value &&
        hireDate.value &&
        deptId.value &&
        jobRankName.value &&
        jobRoleName.value &&
        isEmailValid.value
    )
    const isEmailValid = computed(() =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email.value)
    )
    async function createUser() {
        isLoading.value = true
        try {
            const response = await api.post('/api/auth/signup', {
                name: name.value,
                email: email.value,
                birth: birth.value,
                hireDate: hireDate.value,
                deptId: deptId.value,
                deptName: deptName.value,
                jobRankName: jobRankName.value,
                jobRoleName: jobRoleName.value,
                isCreation: isCreation.value
            })
            const userData = response.data.data
            alert(response.message)
            const payload = {
                id: userData.id,
                name: userData.name,
                deptName: userData.deptName,
                jobRankName: userData.jobRankName,
                jobRoleName: userData.jobRoleName,
                isCreation: userData.isCreation,
                isResign: userData.isResign
            }
            console.log('submit', payload)
            emit('user-created', payload)
            emit('close')
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message)
            } else {
                alert('알 수 없는 오류가 발생했습니다.')
                console.error(error)
            }
        } finally {
            isLoading.value = false
        }
    }
</script>

<style scoped>
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
        width: 500px;
        display: flex;
        align-items: center;
        flex-direction: column;
        border-radius: 20px;
        background-color: white;
    }
    .input-box {
        display: flex;
        flex-direction: column;
        width: 400px;
    }
    .close-btn {
        position: absolute;
        top: 12px;
        right: 16px;
        font-size: 20px;
        color: gray;
        background: none;
        border: none;
        cursor: pointer;
    }
    .create-btn {
        background-color: #9090ff;
        border-radius: 8px;
        width: 150px;
        height: 32px;
        color: white;
        margin-bottom: 24px;
    }
    .two-box {
        width: 180px;
    }
    .space-wrapper {
        display: flex;
        justify-content: space-between;
        width: 400px;
    }
    .error {
        color: red;
        font-size: 0.8rem;
    }
</style>