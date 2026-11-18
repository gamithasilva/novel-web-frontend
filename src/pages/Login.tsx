import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { login } from "../service/auth"

export const Login = () => {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      const res = await login(email, password)
      localStorage.setItem("ACCESS_TOKEN", res.data.access_token)
      localStorage.setItem("REFRESH_TOKEN", res.data.refresh_token)
      await refresh()
      navigate("/")
    } catch {
      setError("Invalid email or password")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <form onSubmit={submit} className="glass p-8 space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-black">Welcome back</h1>
          <p className="muted text-xs mt-1">Sign in to comment on novels</p>
        </div>
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-xs">{error}</p>}
        <button className="btn btn-solid w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="muted text-xs text-center">
          No account? <Link to="/register" className="underline font-semibold">Register</Link>
        </p>
      </form>
    </div>
  )
}
