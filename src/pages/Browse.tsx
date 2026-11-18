import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { NovelCard } from "../components/novel/NovelCard"
import { Pagination } from "../components/common/Pagination"
import { Spinner } from "../components/common/Spinner"
import { getGenres, getNovels } from "../service/novel"
import type { Meta, Novel } from "../types"

export const Browse = () => {
  const [params, setParams] = useSearchParams()
  const q = params.get("q") ?? ""
  const genre = params.get("genre") ?? ""
  const sort = params.get("sort") ?? "latest"
  const page = Number(params.get("page")) || 1

  const [search, setSearch] = useState(q)
  const [novels, setNovels] = useState<Novel[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [genres, setGenres] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    if (!("page" in patch)) next.delete("page")
    setParams(next)
  }

  useEffect(() => setSearch(q), [q])
  useEffect(() => {
    getGenres().then((g) => setGenres(g.data.map((x) => x.name))).catch(() => undefined)
  }, [])
  useEffect(() => {
    setLoading(true)
    getNovels({ q: q || undefined, genre: genre || undefined, sort, page, limit: 24 })
      .then((res) => {
        setNovels(res.data)
        setMeta(res.meta)
      })
      .catch(() => setNovels([]))
      .finally(() => setLoading(false))
  }, [q, genre, sort, page])

  return (
    <div>
      <div className="glass p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <form className="flex-1 flex gap-2" onSubmit={(e) => { e.preventDefault(); update({ q: search.trim() }) }}>
            <input className="input" placeholder="Search title or author…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-solid">Search</button>
          </form>
          <select className="input sm:!w-48" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="latest">Latest</option>
            <option value="views">Most viewed</option>
            <option value="chapters">Most chapters</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button className={`chip ${!genre ? "chip-active" : ""}`} onClick={() => update({ genre: "" })}>All</button>
          {genres.map((g) => (
            <button key={g} className={`chip ${genre === g ? "chip-active" : ""}`} onClick={() => update({ genre: g })}>{g}</button>
          ))}
        </div>
      </div>

      {meta && <p className="muted text-sm mb-4">{meta.total.toLocaleString()} novels{q && ` for “${q}”`}{genre && ` in ${genre}`}</p>}
      {loading ? (
        <Spinner />
      ) : novels.length === 0 ? (
        <p className="muted text-center py-16">No novels found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {novels.map((n) => <NovelCard key={n.slug} novel={n} />)}
        </div>
      )}
      {meta && <Pagination page={page} totalPages={meta.totalPages} onChange={(p) => update({ page: String(p) })} />}
    </div>
  )
}
