<template>
    <form class="login-modal" @submit.prevent="login">
        <!-- 로고 -->
        <div class="logo" style="width: 100%; height: 100%; display: flex; flex-direction:column; align-items: center; margin-bottom: 50px; gap: 15px;">
            <img src="@/assets/square-logo.png" style="width: 50px; height: 50px;" />
            <span class="logo-text">Core Flow</span>
        </div>

        <div class="mb-2 input-box">
            <!-- <label class="block text-sm mb-1 input-label">회사 코드</label> -->
            <input ref="companyCodeInput" v-model="companyCode" placeholder="회사 코드를 입력해주세요."
                class="px-2 py-2 border border-gray-300 box" />
        </div>

        <!-- 사번 (이메일) -->
        <div class="mb-2 input-box">
            <!-- <label class="block text-gray-700 text-sm mb-1 input-label">아이디</label> -->
            <input ref="identifierInput" v-model="identifier" placeholder="사번 또는 이메일을 입력해주세요."
                class="px-2 py-2 border border-gray-300 box" />
        </div>

        <div class="mb-2 input-box">
            <!-- <label class="block text-gray-700 text-sm mb-1 input-label">비밀번호</label> -->
            <input ref="passwordInput" v-model="password" type="password" placeholder="비밀번호를 입력해주세요."
                class="px-2 py-2 border border-gray-300 box" />
        </div>

        <div class="checkbox-group pb-2">
            <label class="px-3">
                <input type="checkbox" v-model="rememberCompCode" />
                회사 코드 저장
            </label>
            <label class="px-3">
                <input type="checkbox" v-model="rememberId" />
                아이디 저장
            </label>
        </div>

        <!-- 로그인 버튼 -->
        <button type="submit" class="text-white py-2 box login-btn mt-5">
            로그인
        </button>

        <!-- 비밀번호 찾기 -->
        <div class="text mt-3 mb-10">
            <span class="reissue-password" @click="showModal = true">
                비밀번호 재발급
            </span>
        </div>

        <!-- 모달창 -->
        <FindPwdModal v-if="showModal" @close="showModal = false" />
        <LoadingModal v-if="isLoading" :today="new Date()" message="로그인 중..." />
    </form>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios';
import { useRouter } from 'vue-router'
import FindPwdModal from '@/components/user/FindPwdModal.vue'
import { useUserStore } from '@/stores/userStore'
import LoadingModal from '@/components/common/LoadingModal.vue'
import api from '@/api';

const router = useRouter();

const showModal = ref(false)
const isLoading = ref(false)

const rememberId = ref(false)
const rememberCompCode = ref(false)

const identifier = ref("")
const password = ref("")
const companyCode = ref("")
const companyCodeInput = ref(null)
const identifierInput = ref(null)
const passwordInput = ref(null)

const userStore = useUserStore();

onMounted(async () => {
    const savedId = localStorage.getItem('savedId')
    if (savedId) {
        identifier.value = savedId
        rememberId.value = true
    }
    const saveCompCode = localStorage.getItem('saveCompCode')
    if (saveCompCode) {
        companyCode.value = saveCompCode
        rememberCompCode.value = true
    }

    await nextTick()

    if (!companyCode.value) {
        companyCodeInput.value?.focus()
    } else if (!identifier.value) {
        identifierInput.value?.focus()
    } else {
        passwordInput.value?.focus()
    }
})

async function login() {
    isLoading.value = true;
    try {
        if (rememberId.value) {
            localStorage.setItem('savedId', identifier.value)
        } else {
            localStorage.removeItem('savedId')
        }
        if (rememberCompCode.value) {
            localStorage.setItem('saveCompCode', companyCode.value)
        } else {
            localStorage.removeItem('saveCompCode')
        }
    } catch (error) {
        console.error('로컬 스토리지 저장 실패');
    }

    // 로그인 요청
    try {
        const response = await axios.post('/api/auth/login', {
            companyCode: companyCode.value,
            identifier: identifier.value,
            password: password.value
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const responseLogin = response.data.data;

        console.log('응답 전체:', response.data)
        console.log('responseLogin: ', responseLogin)
        console.log('accessToken:', responseLogin.accessToken)
        console.log('refreshToken:', responseLogin.refreshToken)

        await userStore.login(responseLogin);

        await nextTick();
        if (localStorage.getItem("schemaName") !== 'master') {
            router.push('/');
        } else {
            router.push('/master')
        }
    } catch (error) {
        if (error.response) {
            console.error('에러 응답:', error.response.data);
            alert(error.response.data.message);
        } else {
            console.error('요청 실패:', error.message);
        }
    } finally {
        isLoading.value = false;
    }
}
</script>

<style scoped>
.login-modal {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 10px;
}

.logo {
    display: flex;
    justify-content: center;
    transform: scale(1.2);
    margin: 20px;
}
.logo-text {
    /* font-family: 'Poppins', sans-serif;  */
    font-family: 'Audiowide', cursive;
    font-size: 25px;
    font-weight: bold;
}

input[type="checkbox"] {
  accent-color: #7578ee; /* 체크 표시 및 테두리 색상 */
}

.input-box {
    display: flex;
    flex-direction: column;
    width: 400px;
}

.box {
    width: 400px;
    background-color: #F4F7FF;
    border-radius: 8px;
    border: solid 1px #E8EAEE;
}

.login-btn {
  background: linear-gradient(to right, #7578ee, #9c70f9);
  border: none;
  border-radius: 8px;
  transition: background 0.3s ease;
}
.login-btn:hover {
  background: linear-gradient(to right, #6b6ee9, #a57aff);
}
.input-label {
    color: gray;
}

.reissue-password {
    color: #7578ee;
    cursor: pointer;
    transition: color 0.3s;
}

.reissue-password:hover {
    color: black;
}
</style>