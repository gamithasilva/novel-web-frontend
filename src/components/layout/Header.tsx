import { useState, type FormEvent } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { useTheme } from "../../hooks/useTheme"

export const Header = () => {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [q, setQ] = useState("")

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) navigate(`/browse?q=${encodeURIComponent(q.trim())}`)
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${isActive ? "" : "muted hover:opacity-100"}`

  return (
    <header className="sticky top-3 z-50 mx-3 sm:mx-6 mt-3">
      <div className="glass max-w-7xl mx-auto px-4 sm:px-5 h-14 flex items-center gap-4">
        <Link to="/" className="text-lg font-black tracking-[0.2em]">
          READORIA
        </Link>
        <nav className="hidden sm:flex items-center gap-5 ml-2">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/browse" className={link}>Browse</NavLink>
        </nav>

        <form onSubmit={onSearch} className="hidden md:block flex-1 max-w-sm ml-auto">
          <input className="input !py-1.5" placeholder="Search novels or authors…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <button className="btn btn-sm" onClick={toggle} aria-label="Toggle theme" title="Toggle theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
          {user ? (
            <>
              <span className="hidden sm:inline text-xs font-semibold">{user.name}</span>
              <button className="btn btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm">Login</Link>
              <Link to="/register" className="btn btn-sm btn-solid hidden sm:inline-flex">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
