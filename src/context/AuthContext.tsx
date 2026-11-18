import { createContext, useCallback, useEffect, useState, type ReactNode } from "react"
import { getMyDetails } from "../service/auth"
import type { User } from "../types"

interface AuthState {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("ACCESS_TOKEN")) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await getMyDetails()
      setUser(res.data ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("REFRESH_TOKEN")
    setUser(null)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return <AuthContext.Provider value={{ user, loading, refresh, logout }}>{children}</AuthContext.Provider>
}

export default AuthProvider
