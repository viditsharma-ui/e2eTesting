import axios, { AxiosInstance, AxiosError } from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const client: AxiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token to headers
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 errors (expired/invalid token)
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
