import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 50000,
    withCredentials: true
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (token) {
            resolve(token)
        } else {
            reject(error)
        }
    })
    failedQueue = []
}

api.interceptors.request.use(
    config => {
        const accessToken = sessionStorage.getItem('accessToken')
        console.log(accessToken);
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    error => Promise.reject(error)
)

api.interceptors.response.use(response => response, async error => {
    const originalRequest = error.config
    const userStore = useUserStore()

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        resolve(api(originalRequest))
                    },
                    reject
                })
            })
        }

        isRefreshing = true

        try {
            const res = await api.post('/api/auth/reissue', {
                userId: userStore.id,
                companySchema: userStore.schemaName
            })

            const newToken = res.data.data.accessToken
            userStore.setAccessToken(newToken)

            processQueue(null, newToken)

            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
        } catch (error) {
            processQueue(error, null)
            console.log('에러', error)
            userStore.forceLogout()
            return Promise.reject(error)
        } finally {
            isRefreshing = false
        }
    }
    return Promise.reject(error)
})

export default api