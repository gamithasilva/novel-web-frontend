import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { NovelCard } from "../components/novel/NovelCard"
import { Spinner } from "../components/common/Spinner"
import { getGenres, getNovels } from "../service/novel"
import type { Novel } from "../types"

const Row = ({ title, to, novels }: { title: string; to: string; novels: Novel[] }) => (
  <section className="mt-12">
    <div className="flex items-end justify-between mb-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <Link to={to} className="muted text-sm hover:underline">View all →</Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {novels.map((n) => <NovelCard key={n.slug} novel={n} />)}
    </div>
  </section>
)

export const Home = () => {
  const navigate = useNavigate()
  const [q, setQ] = useState("")
  const [trending, setTrending] = useState<Novel[]>([])
  const [latest, setLatest] = useState<Novel[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([getNovels({ sort: "views", limit: 12 }), getNovels({ sort: "latest", limit: 12 }), getGenres()])
      .then(([t, l, g]) => {
        setTrending(t.data)
        setLatest(l.data)
        setGenres(g.data.slice(0, 16).map((x) => x.name))
      })
      .catch(() => setError("Couldn’t reach the server. Is the API running?"))
      .finally(() => setLoading(false))
  }, [])

  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/browse?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div>
      <section className="glass px-6 py-14 sm:py-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight">Read. Listen. Download.</h1>
        <p className="muted mt-4 max-w-xl mx-auto">Thousands of web novels in one quiet, beautiful place — with text-to-speech and PDF downloads built in.</p>
        <form onSubmit={onSearch} className="mt-8 max-w-xl mx-auto flex gap-2">
          <input className="input" placeholder="Search by title or author…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-solid">Search</button>
        </form>
        {genres.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {genres.map((g) => (
              <Link key={g} to={`/browse?genre=${encodeURIComponent(g)}`} className="chip">{g}</Link>
            ))}
          </div>
        )}
      </section>

      {loading && <Spinner />}
      {error && <p className="text-center mt-10">{error}</p>}
      {!loading && !error && (
        <>
          <Row title="Trending" to="/browse?sort=views" novels={trending} />
          <Row title="Recently added" to="/browse?sort=latest" novels={latest} />
        </>
      )}
    </div>
  )
}
