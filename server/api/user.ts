import type { User } from '~/types'

const baseUrl = 'https://api.github.com'
const user = 'sechi747'
const url = `${baseUrl}/users/${user}`

export default defineEventHandler(async () => {
  const user: User = await $fetch(url)
  return user
})
