import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export type SpeechStatus = "idle" | "playing" | "paused"
interface Chunk { p: number; text: string }

/** Splits a paragraph into short sentence chunks (long utterances get cut off by some browsers). */
const splitText = (text: string, max = 220): string[] => {
  const sentences = text.match(/[^.!?…]+[.!?…]+["”’')\]]*\s*|[^.!?…]+$/g) ?? [text]
  const out: string[] = []
  let buf = ""
  for (const s of sentences) {
    if ((buf + s).length > max && buf) {
      out.push(buf.trim())
      buf = ""
    }
    buf += s
    while (buf.length > max * 1.5) {
      const cut = buf.lastIndexOf(" ", max)
      const at = cut > 40 ? cut : max
      out.push(buf.slice(0, at).trim())
      buf = buf.slice(at)
    }
  }
  if (buf.trim()) out.push(buf.trim())
  return out
}

export const useSpeech = (paragraphs: string[], onFinished?: () => void) => {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState(() => localStorage.getItem("TTS_VOICE") || "")
  const [rate, setRate] = useState(() => Number(localStorage.getItem("TTS_RATE")) || 1)
  const [status, setStatus] = useState<SpeechStatus>("idle")
  const [current, setCurrent] = useState(-1) // paragraph index being read

  const chunks = useMemo<Chunk[]>(
    () => paragraphs.flatMap((t, p) => splitText(t).map((text) => ({ p, text }))),
    [paragraphs]
  )

  const token = useRef(0)
  const chunkIdx = useRef(0)
  const live = useRef({ chunks, rate, voiceURI, voices, onFinished })
  live.current = { chunks, rate, voiceURI, voices, onFinished }

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener("voiceschanged", load)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load)
  }, [supported])

  const stop = useCallback(() => {
    token.current++
    if (supported) window.speechSynthesis.cancel()
    setStatus("idle")
    setCurrent(-1)
  }, [supported])

  const speakFrom = useCallback(
    (start: number) => {
      if (!supported) return
      const synth = window.speechSynthesis
      const t = ++token.current
      synth.cancel()

      const run = (i: number) => {
        if (t !== token.current) return
        const { chunks, rate, voiceURI, voices, onFinished } = live.current
        if (i >= chunks.length) {
          setStatus("idle")
          setCurrent(-1)
          onFinished?.()
          return
        }
        chunkIdx.current = i
        const u = new SpeechSynthesisUtterance(chunks[i].text)
        u.rate = rate
        const voice = voices.find((v) => v.voiceURI === voiceURI)
        if (voice) {
          u.voice = voice
          u.lang = voice.lang
        }
        u.onend = () => run(i + 1)
        u.onerror = (e) => {
          if (e.error === "interrupted" || e.error === "canceled") return
          run(i + 1)
        }
        setCurrent(chunks[i].p)
        synth.speak(u)
      }

      setStatus("playing")
      run(start)
    },
    [supported]
  )

  /** Start reading from a paragraph (default: the beginning). */
  const play = useCallback(
    (paragraph = 0) => {
      const i = live.current.chunks.findIndex((c) => c.p >= paragraph)
      speakFrom(Math.max(i, 0))
    },
    [speakFrom]
  )

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    setStatus("paused")
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    setStatus("playing")
  }, [supported])

  // Re-apply voice / speed changes immediately while playing.
  const statusRef = useRef(status)
  statusRef.current = status
  useEffect(() => {
    localStorage.setItem("TTS_RATE", String(rate))
    localStorage.setItem("TTS_VOICE", voiceURI)
    if (statusRef.current === "playing") speakFrom(chunkIdx.current)
  }, [rate, voiceURI, speakFrom])

  // Stop when the text changes (new chapter) or the page unmounts.
  useEffect(() => {
    stop()
    return () => {
      token.current++
      if (supported) window.speechSynthesis.cancel()
    }
  }, [paragraphs, stop, supported])

  return { supported, voices, voiceURI, setVoiceURI, rate, setRate, status, current, play, pause, resume, stop }
}
