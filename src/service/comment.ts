import api from "./api"
import type { CommentItem, Meta } from "../types"

export const getComments = async (novel: string, chapter: number | null, page = 1) =>
  (await api.get("/comments", { params: { novel, chapter: chapter ?? undefined, page } })).data as {
    data: CommentItem[]
    meta: Meta
  }

export const addComment = async (novel: string, chapter: number | null, body: string) =>
  (await api.post("/comments", { novel, chapter, body })).data as { data: CommentItem }

export const removeComment = async (id: string) => api.delete(`/comments/${id}`)
