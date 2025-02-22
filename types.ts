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

export interface Moment {
  createTime: number
  content: string
}

