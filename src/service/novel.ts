import axios from "axios"
import api from "./api"
import type { Chapter, ChapterItem, Meta, Novel } from "../types"

type Params = Record<string, string | number | undefined>

export const getNovels = async (params: Params) =>
  (await api.get("/novels", { params })).data as { data: Novel[]; meta: Meta }

export const getGenres = async () =>
  (await api.get("/novels/genres")).data as { data: { name: string; count: number }[] }

export const getNovel = async (slug: string) =>
  (await api.get(`/novels/${slug}`)).data as { data: Novel }

export const getChapters = async (slug: string) =>
  (await api.get(`/novels/${slug}/chapters`)).data as { data: ChapterItem[] }

export const getChapter = async (slug: string, index: number) =>
  (await api.get(`/novels/${slug}/chapters/${index}`)).data as {
    data: Chapter
    prev: number | null
    next: number | null
    novel: { slug: string; title: string; cover: string }
  }

export const postNovelView = async (slug: string) =>
  (await api.post(`/novels/${slug}/view`)).data as { views: number }

/** Downloads a novel (or a chapter selection like "1-10,15") as pdf/txt and saves it. */
export const downloadNovel = async (slug: string, format: "pdf" | "txt", chapters?: string) => {
  try {
    const res = await api.get(`/novels/${slug}/download`, {
      params: { format, chapters },
      responseType: "blob"
    })
    const cd = res.headers["content-disposition"] as string | undefined
    const name = cd?.match(/filename="?([^";]+)"?/)?.[1] ?? `${slug}.${format}`
    const url = URL.createObjectURL(res.data)
    const a = document.createElement("a")
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (e) {
    let message = "Download failed"
    if (axios.isAxiosError(e) && e.response?.data instanceof Blob) {
      try {
        message = JSON.parse(await e.response.data.text()).message ?? message
      } catch {
        /* keep default */
      }
    }
    throw new Error(message)
  }
}
