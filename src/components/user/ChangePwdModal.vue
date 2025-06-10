<template>
    <div class="modal-overlay">
        <div class="modal">
            <h2 class="text-xl font-semibold mb-4 mt-4">비밀번호 변경</h2>

            <div class="mb-2 input-box">
                <label class="block text-gray-700 text-sm mb-1">현재 비밀번호</label>
                <input
                    type="password"
                    ref="currentPasswordInput"
                    v-model="currentPassword"
                    placeholder="현재 비밀번호를 입력해주세요"
                    class="px-2 py-2 border border-gray-300 box"
                />
            </div>

            <div class="mb-2 input-box">
                <label class="block text-gray-700 text-sm mb-1">새 비밀번호</label>
                <input
                    type="password"
                    v-model="newPassword"
                    placeholder="새 비밀번호를 입력해주세요"
                    class="px-2 py-2 border border-gray-300 box"
                />
                <small v-if="newPassword && !isPasswordValid" class="error">
                    영문 + 숫자 + 특수문자를 포함하여 8자 이상이어야 합니다.
                </small>
                <small v-if="newPassword && newPassword === currentPassword" class="error">
                    현재 비밀번호와 동일합니다.
                </small>
            </div>

            <div class="mb-2 input-box">
                <label class="block text-gray-700 text-sm mb-1">비밀번호 확인</label>
                <input
                    type="password"
                    v-model="confirmPassword"
                    placeholder="비밀번호를 다시 한 번 입력해주세요"
                    class="px-2 py-2 border border-gray-300 box"
                />
                <small v-if="confirmPassword && newPassword !== confirmPassword" class="error">
                    비밀번호가 일치하지 않습니다.
                </small>

                <div class="modal-actions">
                    <button class="option-btn change-btn" @click="changePassword" :disabled="!canSubmit">변경</button>
                    <button class="option-btn cancel-btn" @click="close">취소</button>
                </div>
            </div>
            <LoadingModal v-if="isLoading" :today="new Date()" message="요청 중..." />
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, nextTick, onMounted } from 'vue'
    import api from '@/api'
    import LoadingModal from '@/components/common/LoadingModal.vue'

    const emit = defineEmits(['close'])

    const isLoading = ref(false)

    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')

    const currentPasswordInput = ref(null)

    // 비밀번호 유효성 검사: 영문 + 숫자, 최소 8자
    const isPasswordValid = computed(() =>
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]).{8,}$/.test(newPassword.value)
    )

    onMounted(async () => {
        await nextTick()
        currentPasswordInput.value?.focus()
    })

    const canSubmit = computed(() =>
        currentPassword.value &&
        newPassword.value &&
        confirmPassword.value &&
        isPasswordValid.value &&
        newPassword.value === confirmPassword.value &&
        newPassword.value !== currentPassword.value
    )

    function close() {
        emit('close')
    }

    async function changePassword() {
        if (!canSubmit.value) {
            return
        }
        // 요청 전송
        try {
            await api.patch('/api/auth/update-pwd', {
                prevPassword: currentPassword.value,
                newPassword: newPassword.value
            })
            console.alert('비밀번호가 변경되었습니다.')
        } catch (e) {
            if (e.response) {
                console.error('에러 응답:', e.response.data);
                alert(e.response.data.message);
            } else {
                console.error('요청 실패:', e.message);
            }
        }
        emit('close')
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

    .error {
        color: red;
        font-size: 0.8rem;
    }

    .modal-actions {
        display: flex;
        justify-content: space-between;
    }

    .option-btn {
        transition: background-color 0.3s;
        color: white;
        border-radius: 6px;
        width: 180px;
        height: 30px;
        margin: 10px 0 10px 0;
    }

    .option-btn:hover {
        background-color: #9090ff;
    }

    .change-btn {
        background-color: black;
    }

    .cancel-btn {
        background-color: red;
    }

</style>