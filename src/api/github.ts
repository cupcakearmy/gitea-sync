import axios from 'axios'

import { Config } from '../config.js'
import type { ListRepositoriesResponse } from './github.types.js'
import { logger } from '../logger.js'

const Base = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${Config.github.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
})

const l = logger.child({ api: 'github' })

async function listRepos(page: number, limit: number) {
  l.debug('listing repos', { page, limit })
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
  l.debug('listing all repos')
  const limit = 100
  const repos: ListRepositoriesResponse = []
  let page = 1
  while (true) {
    l.debug('listing page', { page })
    const response = await listRepos(page, limit)
    repos.push(...response)
    if (response.length < limit) break
    page++
  }
  l.debug('listed all repos')
  return repos
}
