import type { useSpeech } from "../../hooks/useSpeech"

type Speech = ReturnType<typeof useSpeech>

interface Props {
  speech: Speech
  autoNext: boolean
  setAutoNext: (v: boolean) => void
}

export const TTSPlayer = ({ speech, autoNext, setAutoNext }: Props) => {
  const { supported, status, voices, voiceURI, setVoiceURI, rate, setRate, play, pause, resume, stop } = speech

  if (!supported) {
    return <div className="glass px-4 py-3 text-sm muted text-center">Text-to-speech isn’t supported in this browser.</div>
  }

  return (
    <div className="glass px-4 py-3 flex flex-wrap items-center gap-3">
      {status === "idle" && <button className="btn btn-solid btn-sm" onClick={() => play(0)}>▶ Listen</button>}
      {status === "playing" && <button className="btn btn-solid btn-sm" onClick={pause}>❚❚ Pause</button>}
      {status === "paused" && <button className="btn btn-solid btn-sm" onClick={resume}>▶ Resume</button>}
      <button className="btn btn-sm" onClick={stop} disabled={status === "idle"}>■ Stop</button>

      <select className="input !w-auto !py-1.5 !text-xs max-w-48" value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)}>
        <option value="">Default voice</option>
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-xs muted">
        Speed
        <input type="range" min={0.6} max={2} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        <span className="w-8 text-right">{rate.toFixed(1)}×</span>
      </label>

      <label className="flex items-center gap-2 text-xs muted ml-auto">
        <input type="checkbox" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} />
        Auto-play next
      </label>
    </div>
  )
}
