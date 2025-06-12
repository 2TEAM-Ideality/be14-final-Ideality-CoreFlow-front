// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

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
    const profileImage = ref('/images/profile/defaultProfile.png')
    const deptName = ref('')
    const jobRankName = ref('')
    const jobRoleName = ref('')
    const roles = ref([])

    const forcedLogout = ref(false)
    const isLoggedIn = computed(() => !!id.value)
    const refreshToken = ref(null)
    const schemaName = ref(null)

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
    }

    async function login(responseLogin) {
        accessToken.value = responseLogin.accessToken
        refreshToken.value = responseLogin.refreshToken

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
        localStorage.setItem('refreshToken', refreshToken.value)
        localStorage.setItem('schemaName', schemaName.value)
        sessionStorage.setItem('accessToken', accessToken.value)
    }

    async function logout() {
        try {
            if (accessToken.value) {
                await axios.post('/api/auth/logout', null, {
                    headers: {Authorization: `Bearer ${accessToken.value}` }
                })
            }
        } catch (e) {
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

        isLoggedIn.value = false

        refreshToken.value = null
        schemaName.value = null

        localStorage.removeItem('user')
        localStorage.removeItem('refreshToken')
        sessionStorage.removeItem('accessToken')
        localStorage.removeItem('schemaName')
    }

    async function tryReissueToken() {
        const savedUser = localStorage.getItem('user')
        const parsedUser = JSON.parse(savedUser);
        const refreshToken = localStorage.getItem('refreshToken')
        const schemaName = localStorage.getItem('schemaName')
        
        if (!savedUser || !refreshToken) return

        try {
            const response = await axios.post('/api/auth/reissue', {
                'refreshToken': refreshToken,
                'userId': parsedUser.id,
                'companySchema': schemaName
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
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
            forcedLogout.value = true
            logout()
            return false
        }
    }

    async function restoreFromStorage() {
        const savedUser = localStorage.getItem('user')
        const savedRefreshToken = localStorage.getItem('refreshToken')
        const savedSchemaName = localStorage.getItem('schemaName')
        const savedAccessToken = sessionStorage.getItem('accessToken') // 저장되어 있다면 복원

        if (savedUser && savedRefreshToken) {
            const parsedUser = JSON.parse(savedUser)

            setUserData(parsedUser)

            refreshToken.value = savedRefreshToken
            schemaName.value = savedSchemaName
            accessToken.value = savedAccessToken
        } else {
            forceLogout()
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

        forcedLogout,
        restoreFromStorage,
        isLoggedIn,

        refreshToken,
        schemaName,
        login,
        logout,
        forceLogout,
        clearState,
        tryReissueToken
    }
})
