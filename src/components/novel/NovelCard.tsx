import { useState } from "react"
import { Link } from "react-router-dom"
import type { Novel } from "../../types"

export const Cover = ({ src, title, className = "" }: { src?: string; title: string; className?: string }) => {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center p-3 text-center text-sm font-bold muted ${className}`} style={{ background: "var(--glass-strong)" }}>
        {title}
      </div>
    )
  }
  return <img src={src} alt={title} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}

export const NovelCard = ({ novel }: { novel: Novel }) => (
  <Link to={`/novel/${novel.slug}`} className="glass group block overflow-hidden transition hover:-translate-y-1">
    <Cover src={novel.cover} title={novel.title} className="w-full aspect-[2/3] transition group-hover:scale-105" />
    <div className="p-3">
      <h3 className="text-sm font-bold line-clamp-2 leading-snug">{novel.title}</h3>
      <p className="muted text-xs mt-1 truncate">{novel.author || "Unknown author"}</p>
      <p className="muted text-[11px] mt-2">
        {novel.chapter_count.toLocaleString()} ch · {(novel.views ?? 0).toLocaleString()} views
      </p>
    </div>
  </Link>
)
