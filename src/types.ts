export interface Novel {
  _id: string
  slug: string
  title: string
  author: string
  cover: string
  description: string
  genres: string[]
  chapter_count: number
  views?: number
}

export interface ChapterItem {
  index: number
  title: string
  volume: number | null
}

export interface Chapter extends ChapterItem {
  paragraphs: string[]
}

export interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: string
  name: string
  email: string
  roles: string[]
}

export interface CommentItem {
  _id: string
  user: string
  user_name: string
  body: string
  chapter_index: number | null
  createdAt: string
}
