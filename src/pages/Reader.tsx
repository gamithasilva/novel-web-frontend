import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { CommentSection } from "../components/comment/CommentSection"
import { Spinner } from "../components/common/Spinner"
import { TTSPlayer } from "../components/reader/TTSPlayer"
import { useSpeech } from "../hooks/useSpeech"
import { downloadNovel, getChapter } from "../service/novel"

type ChapterResponse = Awaited<ReturnType<typeof getChapter>>
const EMPTY: string[] = []

export const Reader = () => {
  const { slug = "", index = "" } = useParams()
  const chapterIndex = Number(index)
  const navigate = useNavigate()
  const location = useLocation()

  const [res, setRes] = useState<ChapterResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("READER_FONT")) || 18)
  const [serif, setSerif] = useState(() => localStorage.getItem("READER_SERIF") !== "0")
  const [autoNext, setAutoNext] = useState(() => localStorage.getItem("TTS_AUTONEXT") === "1")
  const [dlBusy, setDlBusy] = useState("")
  const paraRefs = useRef<(HTMLParagraphElement | null)[]>([])

  const paragraphs = res?.data.paragraphs ?? EMPTY
  const next = res?.next ?? null
  const prev = res?.prev ?? null

  const speech = useSpeech(paragraphs, () => {
    if (autoNext && next !== null) navigate(`/read/${slug}/${next}`, { state: { autoplay: true } })
  })

  useEffect(() => {
    setLoading(true)
    setError(false)
    getChapter(slug, chapterIndex)
      .then((r) => {
        setRes(r)
        localStorage.setItem(`READ:${slug}`, String(chapterIndex))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
    window.scrollTo(0, 0)
  }, [slug, chapterIndex])

  // Continue listening when the previous chapter finished with auto-play on.
  useEffect(() => {
    if (!res || !(location.state as { autoplay?: boolean } | null)?.autoplay) return
    const t = setTimeout(() => speech.play(0), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res])

  useEffect(() => {
    if (speech.current >= 0) paraRefs.current[speech.current]?.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [speech.current])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if (e.key === "ArrowLeft" && prev !== null) navigate(`/read/${slug}/${prev}`)
      if (e.key === "ArrowRight" && next !== null) navigate(`/read/${slug}/${next}`)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [prev, next, slug, navigate])

  const changeFont = (delta: number) => {
    const v = Math.min(30, Math.max(14, fontSize + delta))
    setFontSize(v)
    localStorage.setItem("READER_FONT", String(v))
  }
  const toggleSerif = () => {
    localStorage.setItem("READER_SERIF", serif ? "0" : "1")
    setSerif(!serif)
  }
  const changeAutoNext = (v: boolean) => {
    localStorage.setItem("TTS_AUTONEXT", v ? "1" : "0")
    setAutoNext(v)
  }
  const download = async (format: "pdf" | "txt") => {
    setDlBusy(format)
    try {
      await downloadNovel(slug, format, String(chapterIndex))
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setDlBusy("")
    }
  }

  if (loading) return <Spinner label="Loading chapter…" />
  if (error || !res) return <p className="text-center py-20">Chapter not found. <Link to={`/novel/${slug}`} className="underline">Back to novel</Link></p>

  const NavButtons = () => (
    <div className="flex items-center justify-between gap-3">
      <button className="btn" disabled={prev === null} onClick={() => navigate(`/read/${slug}/${prev}`)}>← Previous</button>
      <Link to={`/novel/${slug}`} className="btn">Chapters</Link>
      <button className="btn btn-solid" disabled={next === null} onClick={() => navigate(`/read/${slug}/${next}`)}>Next →</button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="glass p-4 sm:p-5">
        <Link to={`/novel/${slug}`} className="muted text-xs hover:underline">← {res.novel.title}</Link>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">{res.data.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button className="btn btn-sm" onClick={() => changeFont(-1)} aria-label="Smaller text">A−</button>
          <button className="btn btn-sm" onClick={() => changeFont(1)} aria-label="Larger text">A+</button>
          <button className="btn btn-sm" onClick={toggleSerif}>{serif ? "Serif" : "Sans"}</button>
          <span className="flex-1" />
          <button className="btn btn-sm" disabled={!!dlBusy} onClick={() => download("pdf")}>{dlBusy === "pdf" ? "…" : "⬇ PDF"}</button>
          <button className="btn btn-sm" disabled={!!dlBusy} onClick={() => download("txt")}>{dlBusy === "txt" ? "…" : "⬇ TXT"}</button>
        </div>
      </div>

      <NavButtons />

      <article className="glass p-5 sm:p-10">
        <div
          className="reader-text leading-[1.85]"
          style={{ fontSize, fontFamily: serif ? "Georgia, 'Times New Roman', serif" : "inherit" }}
        >
          {paragraphs.map((p, i) => (
            <p
              key={i}
              ref={(el) => { paraRefs.current[i] = el }}
              className={speech.current === i ? "tts-active" : ""}
              onDoubleClick={() => speech.supported && speech.play(i)}
              title={speech.supported ? "Double-click to listen from here" : undefined}
            >
              {p}
            </p>
          ))}
        </div>
      </article>

      <NavButtons />
      <CommentSection slug={slug} chapter={chapterIndex} />

      <div className="sticky bottom-3 z-40">
        <TTSPlayer speech={speech} autoNext={autoNext} setAutoNext={changeAutoNext} />
      </div>
    </div>
  )
}
