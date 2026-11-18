import { useState } from "react"
import { downloadNovel } from "../../service/novel"
import { toSpec } from "../../util/spec"

const MAX = 300

interface Props {
  slug: string
  total: number
  selected: number[]
}

export const DownloadPanel = ({ slug, total, selected }: Props) => {
  const [format, setFormat] = useState<"pdf" | "txt">("pdf")
  const [mode, setMode] = useState<"selected" | "range" | "all">("range")
  const [from, setFrom] = useState(1)
  const [to, setTo] = useState(Math.min(50, total || 50))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const spec = mode === "all" ? undefined : mode === "range" ? `${from}-${to}` : toSpec(selected)
  const count = mode === "all" ? total : mode === "range" ? Math.max(0, Math.abs(to - from) + 1) : selected.length
  const tooMany = count > MAX
  const disabled = busy || count === 0 || tooMany

  const go = async () => {
    setBusy(true)
    setError("")
    try {
      await downloadNovel(slug, format, spec)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="glass p-5 sm:p-6">
      <h2 className="text-lg font-bold mb-4">Download</h2>

      <div className="flex gap-2 mb-4">
        {(["pdf", "txt"] as const).map((f) => (
          <button key={f} className={`chip ${format === f ? "chip-active" : ""}`} onClick={() => setFormat(f)}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button className={`chip ${mode === "range" ? "chip-active" : ""}`} onClick={() => setMode("range")}>Range</button>
        <button className={`chip ${mode === "selected" ? "chip-active" : ""}`} onClick={() => setMode("selected")}>
          Selected ({selected.length})
        </button>
        <button className={`chip ${mode === "all" ? "chip-active" : ""}`} onClick={() => setMode("all")}>All chapters</button>
      </div>

      {mode === "range" && (
        <div className="flex items-center gap-2 mb-4">
          <input type="number" min={1} className="input" value={from} onChange={(e) => setFrom(Number(e.target.value))} />
          <span className="muted">to</span>
          <input type="number" min={1} className="input" value={to} onChange={(e) => setTo(Number(e.target.value))} />
        </div>
      )}
      {mode === "selected" && selected.length === 0 && (
        <p className="muted text-xs mb-4">Tick chapters in the list below, or use “Select all”.</p>
      )}

      <button className="btn btn-solid w-full" disabled={disabled} onClick={go}>
        {busy ? "Preparing file…" : `Download ${count.toLocaleString()} chapter${count === 1 ? "" : "s"} as ${format.toUpperCase()}`}
      </button>
      {tooMany && <p className="text-xs mt-2">Max {MAX} chapters per file — pick a smaller range.</p>}
      {error && <p className="text-xs mt-2">{error}</p>}
      <p className="muted text-[11px] mt-3">PDFs support Latin text; use TXT for other scripts.</p>
    </section>
  )
}
