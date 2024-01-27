import axios, { AxiosError } from 'axios'

import { Config } from '../config.js'
import { logger } from '../logger.js'
import { ListRepositoriesResponse } from './gitea.types.js'
import { Repository } from './github.types.js'

const Base = axios.create({
  baseURL: new URL('/api/v1', Config.gitea.host).href,
  headers: {
    Authorization: `token ${Config.gitea.token}`,
  },
})

const l = logger.child({ api: 'gitea' })

export type MirrorOptions = {
  private: boolean
  auth_token: string
  clone_addr: string
  repo_name: string
}
export async function mirror(options: MirrorOptions) {
  try {
    l.debug('mirroring repository', options)
    const response = await Base({
      url: '/repos/migrate',
      method: 'POST',
      data: {
        ...options,

        lfs: true,
        mirror: true,
        service: 'github',
        wiki: true,

        // These don't work for now on mirrored repos.
        // https://github.com/go-gitea/gitea/issues/18369
        issues: true,
        labels: true,
        milestones: true,
        pull_requests: true,
        releases: true,
      },
    })
    l.debug('mirrored repository', { data: response.data })
    return response.data
  } catch (e) {
    if (e instanceof AxiosError) {
      l.error('Error mirroring repository', e.response?.data)
    } else {
      l.error('Unknown error', e)
    }
  }
}

export async function listRepositories(page: number, limit: number) {
  l.debug(`listing repos`, { page, limit })
  const response = await Base<ListRepositoriesResponse>({
    url: '/user/repos',
    method: 'GET',
    params: {
      page,
      limit,
    },
  })
  return response.data
}

export async function listAllRepositories() {
  l.debug('listing all repositories')
  const limit = 50
  const repos: ListRepositoriesResponse = []
  let page = 1
  while (true) {
    l.debug('listing page', { page })
    const response = await listRepositories(page, limit)
    repos.push(...response)
    if (response.length < limit) break
    page++
  }
  l.debug('listed all repositories', { repos: repos.map((repo) => repo.name) })
  return repos
}

export async function updateRepository(owner: string, repo: string, body: Partial<Repository>) {
  l.debug('updating repository', { owner, repo, body })
  await Base({
    url: `/repos/${owner}/${repo}`,
    method: 'PATCH',
    data: body,
  })
}
