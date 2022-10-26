export interface User {
  login: string
  id: number
  node_id: string
  name: string
  avatar_url: string
  bio: string
  location: string
  company: string
  email: string
  blog: string

  url: string
  html_url: string

  public_repos: number
  public_gists: number
  followers: number
  following: number

  created_at: string
  updated_at: string
}

export interface Article {
  _id: string
  _draft: boolean
  _empty: boolean
  _extension: string
  _file: string
  _path: string
  _source: string
  _type: string

  id: number
  title: string
  description?: string
  uid?: number
  updateTime: string
  createTime: string
  slug: string
  draft: boolean
}

export interface JsonFile {
  _path: string
  _draft: boolean
  _partial: boolean
  _locale: string
  _id: string
  _type: string
  title: string
  _source: string
  _file: string
  _extension: string
  [timestamp: string]: string | boolean
}

