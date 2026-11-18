import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type { ChapterItem } from "../../types"
import { Pagination } from "../common/Pagination"

const PAGE_SIZE = 100

interface Props {
  slug: string
  chapters: ChapterItem[]
  selected: Set<number>
  onSelect: (next: Set<number>) => void
}

export const ChapterList = ({ slug, chapters, selected, onSelect }: Props) => {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chapters
    return chapters.filter((c) => String(c.index) === q || c.title.toLowerCase().includes(q))
  }, [chapters, query])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const toggle = (i: number) => {
    const next = new Set(selected)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    onSelect(next)
  }
  const addAll = (list: ChapterItem[]) => onSelect(new Set([...selected, ...list.map((c) => c.index)]))

  return (
    <section className="glass p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold">Chapters <span className="muted text-sm font-normal">({chapters.length.toLocaleString()})</span></h2>
        <input
          className="input !w-56"
          placeholder="Find chapter…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button className="btn btn-sm" onClick={() => addAll(chapters)}>Select all</button>
        <button className="btn btn-sm" onClick={() => addAll(slice)}>Select this page</button>
        <button className="btn btn-sm" disabled={selected.size === 0} onClick={() => onSelect(new Set())}>
          Clear ({selected.size})
        </button>
      </div>

      <ul className="grid sm:grid-cols-2 gap-x-6">
        {slice.map((c) => (
          <li key={c.index} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
            <input type="checkbox" checked={selected.has(c.index)} onChange={() => toggle(c.index)} className="accent-current" />
            <Link to={`/read/${slug}/${c.index}`} className="text-sm truncate hover:underline">
              <span className="muted mr-2">{c.index}.</span>
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
      {slice.length === 0 && <p className="muted text-sm">No chapters match.</p>}
      <Pagination page={current} totalPages={pages} onChange={setPage} />
    </section>
  )
}
