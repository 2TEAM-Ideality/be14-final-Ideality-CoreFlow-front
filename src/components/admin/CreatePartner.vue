<template>
    <div class="modal-overlay">
        <div class="modal">
            <h2 class="text-xl font-semibold mb-4 mt-4">협력 업체 계정 생성</h2>
            <button @click="$emit('close')" class="close-btn">X</button>
            <div class="mb-2 input-box">
                <label class="block mb-1" style="font-weight: bold;">이름</label>
                <input
                    ref="nameInput"
                    v-model="name"
                    placeholder="이름을 입력해주세요"
                    class="px-2 py-2 border box"
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
                    class="px-2 py-2 border box"
                />
                <small v-if="!email" class="error">이메일을 입력해주세요.</small>
                <small v-if="email && !isEmailValid" class="error">
                    이메일 형식이 올바르지 않습니다.
                </small>
            </div>
            <div class="btn-wrapper">
                <button
                    @click="createPartner"
                    class="create-btn"
                    :disabled="!canSubmit"
                >
                    계정 생성하기
                </button>
            </div>
            <LoadingModal v-if="isLoading" :today="new Date()" message="협력업체 등록 중..." />
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, nextTick, computed } from 'vue'
    import api from '@/api'
    import LoadingModal from '@/components/common/LoadingModal.vue';

    const nameInput = ref('')

    onMounted(async () => {
        await nextTick()
        nameInput.value?.focus()
    })

    const isLoading = ref(false)

    const name = ref('')
    const email = ref('')

    const emit = defineEmits(['user-created', 'close'])

    const canSubmit = computed(() => name.value && email.value && isEmailValid.value)

    const isEmailValid = computed(() =>
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email.value)
    )

    async function createPartner() {
        isLoading.value = true
        try {
            const response = await api.post('/api/auth/signup-partner', {
                name: name.value,
                email: email.value
            })
            const partData = response.data.data
            alert(response.message)
            const payload = {
                id: partData.id,
                name: partData.name,
                deptName: partData.deptName,
                jobRankName: partData.jobRankName,
                jobRoleName: partData.jobRoleName,
                isCreation: partData.isCreation,
                isResign: partData.isResign
            }
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
    .error {
        color: red;
        font-size: 0.8rem;
    }
</style>