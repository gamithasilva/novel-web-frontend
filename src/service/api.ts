import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { refreshTokenCall } from "./auth"

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"]
const isPublic = (url?: string) => PUBLIC_ENDPOINTS.some((p) => url?.includes(p))

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN")
  if (token && !isPublic(config.url)) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const hasSession = Boolean(localStorage.getItem("REFRESH_TOKEN"))

    if (error.response?.status === 401 && original && !original._retry && !isPublic(original.url) && hasSession) {
      original._retry = true
      try {
        const refresh = localStorage.getItem("REFRESH_TOKEN") as string
        const { data } = await refreshTokenCall(refresh)
        localStorage.setItem("ACCESS_TOKEN", data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        localStorage.removeItem("ACCESS_TOKEN")
        localStorage.removeItem("REFRESH_TOKEN")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
