<template>
    <div class="modal-overlay">
        <div class="find-pwd-modal">
            <h2 class="text-xl font-semibold mb-4 mt-4">비밀번호 재발급</h2>
            <button @click="$emit('close')" class="close-btn">X</button>


            <!-- 회사 코드 -->
            <div class="mb-2 input-box">
                <label class="block text-gray-700 text-sm mb-1">회사 코드</label>
                <input
                    ref="companyCodeInput"
                    v-model="companyCode"
                    placeholder="회사 코드를 입력해주세요"
                    class="px-2 py-2 border border-gray-300 box"
                />
            </div>

            <!-- 사번 -->
            <div class="mb-2 input-box">
                <label class="block text-gray-700 text-sm mb-1">사번</label>
                <input
                    v-model="employeeNum"
                    placeholder="사번을 입력해주세요"
                    class="px-2 py-2 border border-gray-300 box"
                />
            </div>

            <!-- 이름 -->
            <div class="mb-2 input-box">
                <label class="block text-gray-700 text-sm mb-1">이름</label>
                <input
                    v-model="name"
                    placeholder="이름을 입력해주세요"
                    class="px-2 py-2 border border-gray-300 box"
                />
            </div>

            <!-- 이메일 -->
            <div class="mb-2 input-box">
                <label class="block text-gray-700 text-sm mb-1">이메일</label>
                <input
                    v-model="email"
                    placeholder="이메일을 입력해주세요"
                    class="px-2 py-2 border border-gray-300 box"
                />
            </div>

            <div class="mb-6">
                <!-- 인증 요청 버튼 -->
                <button
                    @click="requestVerificationCode"
                    class="text-white py-2 box btn mb-2"
                >
                    {{ codeRequested ? '재요청' : '인증 요청' }}
                </button>

                <!-- 인증 코드 입력 -->
                <div v-if="codeRequested" class="mb-2 input-box">
                    <label class="block text-gray-700 text-sm mb-1">인증번호</label>
                    <input
                        v-model="verificationCode" 
                        placeholder="인증번호를 입력해주세요."
                        class="px-2 py-2 border border-gray-300 box"
                    />
                </div>

                <!-- 인증 버튼 -->
                <button v-if="codeRequested"
                    @click="submitVerificationCode"
                    class="text-white py-2 box btn"
                >
                    인증
                </button>
            </div>
            
            <!-- 로딩 모달 -->
            <LoadingModal v-if="isLoading" :today="new Date()" message="로딩 중..." />
        </div>
    </div>
</template>

<script setup>
    import { ref, nextTick, onMounted } from 'vue'
    import axios from 'axios'
    import LoadingModal from '@/components/common/LoadingModal.vue'

    const emit = defineEmits(['close'])
    const companyCodeInput = ref(null)

    const companyCode = ref('')
    const employeeNum = ref('')
    const name = ref('')
    const email = ref('')
    const verificationCode = ref('')
    const codeRequested = ref(false)

    const isLoading = ref(false)

    onMounted(() => {
        nextTick(() => {
            companyCodeInput.value?.focus()
        })
    })

    async function requestVerificationCode() {
        if (!companyCode.value || !employeeNum.value || !name.value || !email.value) {
            alert('모든 필드를 입력해주세요.')
            return
        }

        isLoading.value = true
        try {
            await axios.post('/api/auth/reset-password/request', {
                companyCode: companyCode.value,
                employeeNum: employeeNum.value,
                name: name.value,
                email: email.value
            })
            alert('인증번호가 이메일로 전송되었습니다.')
            codeRequested.value = true
        } catch (e) {
            console.error(e)
            alert('인증번호 요청에 실패했습니다.')
        } finally {
            isLoading.value = false
        }
    }

    async function submitVerificationCode() {
        if (!verificationCode.value) {
            alert('인증번호를 입력해주세요.')
            return
        }

        isLoading.value = true
        try {
            await axios.post('/api/auth/reset-password/verify', {
                companyCode: companyCode.value,
                email: email.value,
                verificationCode: verificationCode.value
            })

            alert('임시 비밀번호가 이메일로 전송되었습니다.')
            emit('close')
        } catch (e) {
            console.error(e)
            alert('비밀번호 재발급에 실패했습니다.')
        } finally {
            isLoading.value = false
        }
    }

</script>

<style>
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

    .find-pwd-modal {
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

    .box {
        width: 400px;
        border-radius: 8px;
    }

    .btn {
        background-color: black;
        transition: background-color 0.3s;
    }

    .btn:hover {
        background-color: #9090ff;
    }
</style>