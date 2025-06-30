// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
    const id = ref(null)
    const accessToken = ref(null)
    const employeeNum = ref(null)
    const name = ref('')
    const email = ref('')
    const birth = ref(null)
    const hireDate = ref(null)
    const isResign = ref(false)
    const resignDate = ref(null)
    const profileImage = ref(null)
    const deptName = ref('')
    const jobRankName = ref('')
    const jobRoleName = ref('')
    const roles = ref([])
    const temp = ref(false)

    const forcedLogout = ref(false)
    const schemaName = ref(null)
    // 로그인 상태 판단
    const isLoggedIn = computed(() =>
        !!id.value && !forcedLogout.value
    )

    function setUserData(data) {
        id.value = data.id
        employeeNum.value = data.employeeNum
        name.value = data.name
        email.value = data.email
        birth.value = data.birth
        hireDate.value = data.hireDate
        isResign.value = data.isResign
        resignDate.value = data.resignDate
        profileImage.value = data.profileImage || '/images/profile/defaultProfile.png',
            deptName.value = data.deptName
        jobRankName.value = data.jobRankName
        jobRoleName.value = data.jobRoleName
        roles.value = data.roles
        temp.value = data.temp
    }

    async function login(responseLogin) {
        accessToken.value = responseLogin.accessToken

        setUserData(responseLogin)

        schemaName.value = responseLogin.schemaName

        localStorage.setItem('user', JSON.stringify({
            id: id.value,
            employeeNum: employeeNum.value,
            name: name.value,
            email: email.value,
            birth: birth.value,
            hireDate: hireDate.value,
            isResign: isResign.value,
            resignDate: resignDate.value,
            profileImage: profileImage.value,
            deptName: deptName.value,
            jobRankName: jobRankName.value,
            jobRoleName: jobRoleName.value,
            roles: roles.value
        }))
        localStorage.setItem('userId', id.value)
        localStorage.setItem('schemaName', schemaName.value)
        sessionStorage.setItem('accessToken', accessToken.value)
    }

    async function logout() {
        try {
            console.log('로그아웃 요청')
            const response = await api.post('/api/auth/logout')
            console.log('로그아웃 요청 완료')
            console.log(response.data.data)
            alert(response.data.message);
        } catch (e) {
            forceLogout()
            console.warn("로그아웃 실패 무시")
        }
        clearState()
    }

    function forceLogout() {
        forcedLogout.value = true
        clearState()
    }

    function clearState() {
        id.value = null
        accessToken.value = null
        employeeNum.value = null
        name.value = ''
        email.value = ''
        birth.value = null
        hireDate.value = null
        isResign.value = false
        resignDate.value = null
        profileImage.value = '/images/profile/defaultProfile.png'
        deptName.value = ''
        jobRankName.value = ''
        jobRoleName.value = ''
        roles.value = []

        schemaName.value = null

        localStorage.removeItem('userId')
        localStorage.removeItem('user')
        sessionStorage.removeItem('accessToken')
        localStorage.removeItem('schemaName')
        forcedLogout.value = false
    }

    async function tryReissueToken() {
        const savedUserId = localStorage.getItem('userId')
        const schemaName = localStorage.getItem('schemaName')
        
        if (!savedUserId) return

        try {
            const response = await api.post('/api/auth/reissue', {
                userId: savedUserId,
                companySchema: schemaName
            })

            const reissueResponse = response.data.data
            accessToken.value = reissueResponse.accessToken
            schemaName.value = reissueResponse.schemaName

            // 최신 정보로 업데이트
            setUserData(reissueResponse)

            sessionStorage.setItem('accessToken', accessToken.value)

            localStorage.setItem('schemaName', schemaName.value)
            localStorage.setItem('user', JSON.stringify({
                id: id.value,
                employeeNum: employeeNum.value,
                name: name.value,
                email: email.value,
                birth: birth.value,
                hireDate: hireDate.value,
                isResign: isResign.value,
                resignDate: resignDate.value,
                profileImage: profileImage.value,
                deptName: deptName.value,
                jobRankName: jobRankName.value,
                jobRoleName: jobRoleName.value,
                roles: roles.value
            }))
            return true
        } catch (e) {
            forceLogout()

            return false
        }
    }

    function setAccessToken(token) {
        accessToken.value = token;
        sessionStorage.setItem('accessToken', token)
    }

    async function updateUserInfo(userId) {
        console.log('savedUser', userId)
        try {
            const response = await api.get(`/api/user/info/${userId}`)

            const newUserInfo = response.data.data
            setUserData(newUserInfo)
            localStorage.setItem('user', JSON.stringify({
                id: id.value,
                employeeNum: employeeNum.value,
                name: name.value,
                email: email.value,
                birth: birth.value,
                hireDate: hireDate.value,
                isResign: isResign.value,
                resignDate: resignDate.value,
                profileImage: profileImage.value,
                deptName: deptName.value,
                jobRankName: jobRankName.value,
                jobRoleName: jobRoleName.value,
                roles: roles.value
            }))
            localStorage.setItem('userId', id.value)
            return true
        } catch (e) {
            console.log(e)
            forcedLogout.value = true
            logout()
            return false
        }
    }

    async function restoreFromStorage() {
        const savedUserId = localStorage.getItem('userId')
        if (savedUserId) {
            id.value = savedUserId
        }
        const savedUser = localStorage.getItem('user')
        const savedSchemaName = localStorage.getItem('schemaName')
        const savedAccessToken = sessionStorage.getItem('accessToken') // 저장되어 있다면 복원

        if (savedUser) {
            const parsedUser = JSON.parse(savedUser)

            setUserData(parsedUser)

            schemaName.value = savedSchemaName
            accessToken.value = savedAccessToken
        }
    }


    return {
        id,
        accessToken,
        employeeNum,
        name,
        email,
        birth,
        hireDate,
        isResign,
        resignDate,
        profileImage,
        deptName,
        jobRankName,
        jobRoleName,
        roles,
        temp,

        forcedLogout,
        restoreFromStorage,
        isLoggedIn,

        setAccessToken,
        schemaName,
        login,
        logout,
        forceLogout,
        clearState,
        tryReissueToken,
        updateUserInfo
    }
})
