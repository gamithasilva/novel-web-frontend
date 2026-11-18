import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { register } from "../service/auth"

export const Register = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await register(name, email, password)
      navigate("/login")
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message ?? "Registration failed" : "Registration failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <form onSubmit={submit} className="glass p-8 space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-black">Create account</h1>
          <p className="muted text-xs mt-1">Join the conversation</p>
        </div>
        <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password (min 6 characters)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-xs">{error}</p>}
        <button className="btn btn-solid w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        <p className="muted text-xs text-center">
          Already registered? <Link to="/login" className="underline font-semibold">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
