<template>
    <div>
        <div class="modal-overlay">
            <div class="modal">
                <button @click="$emit('close')" class="close-btn">X</button>
                <div class="user-header">
                    <div class="profile-area">
                        <img

                        :src="formData.profileImage ? formData.profileImage : '/images/profile/defaultProfile.png'"
                        class="profile-img"
                        @click="toggleProfile"
                        />
                        <div v-if="showProfileOption" class="dropdown-menu" ref="profileRef" @click.stop>
                            <div class="dropdown-item" @click="triggerFileInput">프로필 변경</div>
                            <input type="file" accept="image/*" @change="handleFileChange" ref="fileInput" style="display:none"/>
                            <div class="dropdown-item deleted" @click="deleteProfile">프로필 삭제</div>
                        </div>
                    </div>
                    <div class="profile">
                        <div style="font-size: 24px; font-weight: bold">{{ formData.name }}</div>
                        <div class="role-info">
                            <div class="d-flex role">
                                <div style="font-weight: bold;">{{ formData.deptName }}</div>
                                <div style="font-weight: bold;">{{ formData.jobRankName }}</div>
                            </div>
                            <div  
                                class="isActive"                                   
                                :style="{ 
                                    color: formData.isResign ? 'red' : 'blue',
                                    backgroundColor: formData.isResign ? '#ffdddd' : '#ddddff',
                                }"
                            >
                                {{ formData.isResign ? '비활성' : '활성화' }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="user-info">
                    <div class="mb-2 input-box">
                        <label class="mb-1 category">이메일</label>
                        <div class="py-2 border radius-box pl-2">
                            {{ formData.email }}
                        </div>
                    </div>

                    <div class="mb-2 input-box">
                        <label class="mb-1 category">사번</label>
                        <div class="py-1 border radius-box pl-2">
                            {{ formData.employeeNum }}
                        </div>
                    </div>

                    <div class="mb-2 two-divide">
                        <div class="two-space">
                            <label class="mb-1 category">부서</label>
                            <select 
                                v-model="formData.deptName" 
                                class="py-1 border radius-box two-box drop-down text-black"
                                :disabled="!isModify"
                            >
                                <option v-for="dept in props.deptList" :key="dept.id" :value="dept.name">
                                    {{ dept.name }}
                                </option>
                            </select>
                        </div>
                        <div class="two-space">
                            <label class="mb-1 category">프로젝트 생성 권한</label>
                            <select 
                                v-model="formData.isCreation" 
                                class="py-1 border radius-box two-box drop-down text-black"
                                :disabled="!isModify"
                            >
                                <option :value="true">O</option>
                                <option :value="false">X</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-2 two-divide">
                        <div class="two-space">
                            <label class="mb-1 category">직위</label>
                            <select 
                                v-model="formData.jobRankName" 
                                class="py-1 border radius-box two-box drop-down text-black"
                                :disabled="!isModify"
                            >
                                <option v-for="jobRank in props.jobRankList" :key="jobRank.id" :value="jobRank.name">
                                    {{ jobRank.name }}
                                </option>
                            </select>
                        </div>
                        <div class="two-space">
                            <label class="mb-1 category">직책</label>
                            <select
                                v-model="formData.jobRoleName"
                                class="py-1 border radius-box two-box drop-down text-black"
                                :disabled="!isModify"
                            >
                                <option v-for="jobRole in props.jobRoleList" :key="jobRole.id" :value="jobRole.name">
                                    {{ jobRole.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-2 two-divide">
                        <div class="two-space">
                            <label class="mb-1 category">입사일</label>
                            <input 
                                type="date"
                                v-model="formData.hireDate" 
                                class="py-1 border radius-box two-box drop-down text-black"
                                :disabled="!isModify"
                            />
                        </div>
                        <div class="two-space">
                            <label class="mb-1 category">퇴사일</label>
                            <input 
                                type="date"
                                v-model="formData.resignDate"
                                class="py-1 border radius-box two-box drop-down text-black"
                                :disabled="!isModify"
                            />
                        </div>
                    </div>

                    <!-- 수정하기 버튼 -->
                    <div class="btn-wrapper">
                        <button
                            @click="isModifyMod"
                            :class="['text-white modify-btn', isModify ? 'complete' : 'editing']"
                        >
                        {{ isModify ? '수정 완료' : '수정하기' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import api from '@/api';
    import isEqual from 'lodash/isEqual'

    const isModify = ref(false)
    const emit = defineEmits(['user-updated'])

    const userData = ref([])

    const showProfileOption = ref(false)
    const profileRef = ref(null)
    const fileInput = ref(null)
    const formData = ref([])

    onMounted(async () => {
        const res = await api.get(`/api/user/info/${props.userId}`)
        // 원본
        userData.value = res.data.data
        // 깊은 복사
        formData.value = structuredClone(res.data.data)

        window.addEventListener('click', handleClickProfileOptionOutside, true)
    })

    const toggleProfile = (event) => {
        event.stopPropagation() // 클릭 이벤트 전파 막기
        showProfileOption.value = !showProfileOption.value
    }

    function handleClickProfileOptionOutside(event) {
        if (profileRef.value && !profileRef.value.contains(event.target)) {
            showProfileOption.value = false
        }
    }

    onBeforeUnmount(() => {
        window.removeEventListener('click', handleClickProfileOptionOutside, true)
    })


    const props = defineProps({
        userId: Number,
        deptList: Array,
        jobRankList: Array,
        jobRoleList: Array,
    })

    async function isModifyMod() {
        isModify.value = !isModify.value
        console.log(isModify.value)
        if (!isModify.value) {
            // 수정 완료 누를 때 API 요청
            const changedFields = {};

            for (const key in formData.value) {
                console.log(key)
                console.log("formData", formData.value[key])
                console.log("userData", userData.value[key])
                const newVal = formData.value[key]
                const oldVal = userData.value[key]

                if (!isEqual(newVal, oldVal)) {
                    changedFields[key] = newVal
                }
            }
            console.log(changedFields)

            if (Object.keys(changedFields).length === 0) {
                alert("변경된 값이 없습니다.")
                return;
            }
            
            try {
                const response = await api.patch(`/api/admin/user/${props.userId}`, changedFields)
                alert('수정 완료')
                console.log('수정 완료', response)
                userData.value = formData.value
                submit()
            } catch (error) {
                console.error('수정 실패: ', error)
            }
        }
    }

    function submit() {
        const payload = {
            id: formData.value.id,
            name: formData.value.name,
            deptName: formData.value.deptName,
            jobRankName: formData.value.jobRankName,
            jobRoleName: formData.value.jobRoleName,
            isCreation: formData.value.isCreation,
            isResign: formData.value.isResign
        }
        console.log('submit', payload)
        emit('user-updated', payload)
    }

    const imageUrl = ref(null)
    function triggerFileInput() {
        fileInput.value?.click()
    }

    async function handleFileChange(event) {
        const file = event.target.files[0]
        if (!file && file.type.statsWith('image/')) {
            alert('이미지 파일만 선택해주세요.')
            return
        }
    const reader = new FileReader()
    reader.onload = async () => {
    imageUrl.value = reader.result // base64 문자열
    const isConfirmed = confirm('프로필 사진을 등록하시겠습니까')
    if(!isConfirmed) return

    try {
        const response = await api.patch('/api/user/update-profile',{
            id: formData.value.id,
            profileImage: imageUrl.value
        })
        alert(response.data.message)
        formData.value.profileImage.value = imageUrl.value
        } catch(error) {
        if (error.message) {
            error(error.message)
        } else {
            error('알 수 없는 에러가 발생했습니다.')
        }
        }
    }
    reader.readAsDataURL(file)
    }
    async function deleteProfile() {
    const isConfirmed = confirm('프로필 사진을 삭제하시겠습니까?')
    if (!isConfirmed) return
    try{
        const response = await api.delete(`/api/user/delete-profile/${formData.value.id}`)
        alert(response.data.message)
        formData.value.profileImage = null
    } catch (error) {
        if (error.message) {
        error(error.message)
        } else {
        error('알 수 없는 에러가 발생했습니다.')
        }
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
        z-index: 1200;
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
    .user-header {
        margin: 16px;
        display: flex;
        align-items: center;
        gap: 30px;
        padding-top: 20px;
    }
    .user-name {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
    .profile-img {
        height: 64px;
        width: 64px;
        border-radius: 50%;
        border: 1px solid black
    }
    .profile {
        width: 300px;
        height: 64px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .role-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .role {
        gap: 8px;
    }
    .divider {
        height: 1px;
        background-color: gray;
        margin: 6px;
        width: 80%;
    }
    .user-info {
        width: 80%;
        padding-top: 12px;
        padding-bottom: 24px;
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
    .input-box {
        display: flex;
        flex-direction: column;
        width: 400px;
    }
    .two-divide {
        display: flex;
        justify-content: space-between;
        width: 400px;
    }
    .two-space {
        display: flex;
        flex-direction: column;
    }
    .radius-box {
        border-radius: 8px;
    }
    .drop-down {
        padding-left: 12px;
    }
    .modify-btn {
        border-radius: 8px;
        width: 120px;
        height: 32px;
    }
    .editing {
        background-color: #9090ff;
    }
    .complete {
        background-color: #ff9090;
    }
    .modify-btn:hover {
        background-color: black;
    }
    .btn-wrapper {
        margin-top: 12px;
        display: flex;
        justify-content: end;
    }
    .dropdown-menu {
        position: absolute;
        top: 55px;
        background: white;
        border: 1px solid black;
        border-radius: 6px;
        padding: 6px 0;
        width: 120px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 100;
        display: flex;
        flex-direction: column;
    }
    .profile-area {
        position: relative;
    }
    .dropdown-item {
        padding: 8px 16px;
        font-size: 14px;
        color: black;
        text-decoration: none;
    }
    .dropdown-item:hover {
        background-color: #9090ff;
        color: white;
    }
    .dropdown-item.deleted {
        color: red;
    }

    .dropdown-item.deleted:hover {
        color: white;
    }
    .isActive {
        padding: 4px;
        border-radius: 6px;
    }
    .category {
        font-weight: bold;
    }
</style>