import axios from 'axios'

import { Config } from '../config.js'
import type { ListRepositoriesResponse } from './github.types.js'

const Base = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${Config.github.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
})

async function listRepos(page: number, limit: number) {
  const response = await Base<ListRepositoriesResponse>({
    url: `user/repos`,
    method: 'GET',
    params: {
      page,
      per_page: limit,
      affiliation: 'owner',
    },
  })
  return response.data
}

export async function listAllRepositories() {
  const limit = 100
  const repos: ListRepositoriesResponse = []
  let page = 1
  while (true) {
    const response = await listRepos(page, limit)
    repos.push(...response)
    if (response.length < limit) break
    page++
  }
  return repos
}
