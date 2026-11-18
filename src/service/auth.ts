import api from "./api"
import type { User } from "../types"

export const login = async (email: string, password: string) =>
  (await api.post("/auth/login", { email, password })).data as {
    data: { access_token: string; refresh_token: string }
  }

export const register = async (name: string, email: string, password: string) =>
  (await api.post("/auth/register", { name, email, password })).data

export const getMyDetails = async () =>
  (await api.get("/auth/me")).data as { data: User }

export const refreshTokenCall = async (refreshToken: string) =>
  (await api.post("/auth/refresh", { refreshToken })).data as { data: { accessToken: string } }
