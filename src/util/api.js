import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

const api = axios.create({
    timeout: 50000
})

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

export default api