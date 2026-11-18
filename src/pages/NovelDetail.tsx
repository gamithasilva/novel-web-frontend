import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Cover } from "../components/novel/NovelCard"
import { ChapterList } from "../components/novel/ChapterList"
import { DownloadPanel } from "../components/novel/DownloadPanel"
import { CommentSection } from "../components/comment/CommentSection"
import { Spinner } from "../components/common/Spinner"
import { getChapters, getNovel, postNovelView } from "../service/novel"
import type { ChapterItem, Novel } from "../types"

export const NovelDetail = () => {
  const { slug = "" } = useParams()
  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<ChapterItem[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [views, setViews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [showAllGenres, setShowAllGenres] = useState(false)

  useEffect(() => {
    setLoading(true)
    setMissing(false)
    setSelected(new Set())
    Promise.all([getNovel(slug), getChapters(slug)])
      .then(([n, c]) => {
        setNovel(n.data)
        setViews(n.data.views ?? 0)
        setChapters(c.data)
        postNovelView(slug).then((v) => setViews(v.views)).catch(() => undefined)
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Spinner label="Loading novel…" />
  if (missing || !novel) return <p className="text-center py-20">Novel not found. <Link to="/browse" className="underline">Browse novels</Link></p>

  const lastRead = Number(localStorage.getItem(`READ:${slug}`)) || 0
  const first = chapters[0]?.index
  const genres = showAllGenres ? novel.genres : novel.genres.slice(0, 10)

  return (
    <div className="space-y-6">
      <section className="glass p-5 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8">
        <Cover src={novel.cover} title={novel.title} className="w-44 sm:w-56 aspect-[2/3] rounded-2xl shrink-0 mx-auto sm:mx-0" />
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">{novel.title}</h1>
          <p className="muted mt-2">{novel.author || "Unknown author"}</p>

          <div className="flex gap-6 mt-5 text-sm">
            <div><p className="text-xl font-bold">{novel.chapter_count.toLocaleString()}</p><p className="muted text-xs">Chapters</p></div>
            <div><p className="text-xl font-bold">{views.toLocaleString()}</p><p className="muted text-xs">Views</p></div>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {genres.map((g) => <Link key={g} to={`/browse?genre=${encodeURIComponent(g)}`} className="chip">{g}</Link>)}
            {novel.genres.length > 10 && (
              <button className="chip" onClick={() => setShowAllGenres((s) => !s)}>
                {showAllGenres ? "Show less" : `+${novel.genres.length - 10} more`}
              </button>
            )}
          </div>

          <p className="muted text-sm mt-5 leading-relaxed">{novel.description || "No description yet."}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            {first !== undefined && <Link to={`/read/${slug}/${first}`} className="btn btn-solid">Start reading</Link>}
            {lastRead > 0 && <Link to={`/read/${slug}/${lastRead}`} className="btn">Continue · Ch. {lastRead}</Link>}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-6 items-start">
        <ChapterList slug={slug} chapters={chapters} selected={selected} onSelect={setSelected} />
        <div className="lg:sticky lg:top-24">
          <DownloadPanel slug={slug} total={chapters.length} selected={[...selected]} />
        </div>
      </div>

      <CommentSection slug={slug} chapter={null} />
    </div>
  )
}
