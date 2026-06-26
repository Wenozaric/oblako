import axios from 'axios'

export const apiService = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
    withCredentials: true
})


apiService.interceptors.response.use(
    (res) => { return res },
    (err) => { return Promise.reject(err) }
)