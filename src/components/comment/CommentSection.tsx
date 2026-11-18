import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { addComment, getComments, removeComment } from "../../service/comment"
import type { CommentItem } from "../../types"

interface Props {
  slug: string
  chapter?: number | null
}

export const CommentSection = ({ slug, chapter = null }: Props) => {
  const { user } = useAuth()
  const [items, setItems] = useState<CommentItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(
    async (p: number, replace: boolean) => {
      const res = await getComments(slug, chapter, p)
      setItems((prev) => (replace ? res.data : [...prev, ...res.data]))
      setTotal(res.meta.total)
      setPages(res.meta.totalPages)
      setPage(p)
    },
    [slug, chapter]
  )

  useEffect(() => {
    setItems([])
    load(1, true).catch(() => setError("Could not load comments"))
  }, [load])

  const submit = async () => {
    if (!text.trim()) return
    setBusy(true)
    setError("")
    try {
      const res = await addComment(slug, chapter, text.trim())
      setItems((prev) => [res.data, ...prev])
      setTotal((t) => t + 1)
      setText("")
    } catch {
      setError("Could not post comment")
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    await removeComment(id)
    setItems((prev) => prev.filter((c) => c._id !== id))
    setTotal((t) => t - 1)
  }

  return (
    <section className="glass p-5 sm:p-6">
      <h2 className="text-lg font-bold mb-4">Comments <span className="muted text-sm font-normal">({total})</span></h2>

      {user ? (
        <div className="mb-6">
          <textarea
            className="input min-h-24 resize-y"
            maxLength={1000}
            placeholder={chapter ? "Share your thoughts on this chapter…" : "What do you think about this novel?"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="muted text-xs">{text.length}/1000</span>
            <button className="btn btn-solid btn-sm" disabled={busy || !text.trim()} onClick={submit}>
              {busy ? "Posting…" : "Post comment"}
            </button>
          </div>
        </div>
      ) : (
        <p className="muted text-sm mb-6">
          <Link to="/login" className="underline font-semibold">Log in</Link> to join the discussion.
        </p>
      )}
      {error && <p className="text-sm mb-3">{error}</p>}

      <ul className="space-y-4">
        {items.map((c) => (
          <li key={c._id} className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{c.user_name}</p>
              <div className="flex items-center gap-3">
                <time className="muted text-xs">{new Date(c.createdAt).toLocaleString()}</time>
                {user && (user.id === c.user || user.roles.includes("ADMIN")) && (
                  <button className="muted text-xs hover:opacity-100 underline" onClick={() => remove(c._id)}>delete</button>
                )}
              </div>
            </div>
            <p className="text-sm mt-1.5 whitespace-pre-wrap break-words">{c.body}</p>
          </li>
        ))}
        {items.length === 0 && <p className="muted text-sm">No comments yet. Be the first!</p>}
      </ul>

      {page < pages && (
        <div className="text-center mt-5">
          <button className="btn btn-sm" onClick={() => load(page + 1, false)}>Load more</button>
        </div>
      )}
    </section>
  )
}
