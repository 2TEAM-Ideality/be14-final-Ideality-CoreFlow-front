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
    const profileImage = ref(null)
    const deptName = ref('')
    const jobRankName = ref('')
    const jobRoleName = ref('')
    const userOfRoles = ref([])

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
        profileImage.value = data.profileImage || '/images/profile/defaultProfile.png'
        deptName.value = data.deptName
        jobRankName.value = data.jobRankName
        jobRoleName.value = data.jobRoleName
        userOfRoles.value = data.userOfRoles
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
            userOfRoles: userOfRoles.value
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
        profileImage.value = null
        deptName.value = ''
        jobRankName.value = ''
        jobRoleName.value = ''
        userOfRoles.value = []

        forcedLogout = false

        refreshToken = null
        schemaName = null

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
            const response = await axios.post('/api/member/reissue', {
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
                userOfRoles: userOfRoles.value
            }))
            return true
        } catch (e) {
            forcedLogout.value = true
            logout()
            return false
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
        userOfRoles,

        forcedLogout,

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
