import axios, { AxiosError } from 'axios'

import { Config } from '../config.js'
import { logger } from '../logger.js'
import { ListRepositoriesResponse } from './gitea.types.js'

const Base = axios.create({
  baseURL: new URL('/api/v1', Config.gitea.host).href,
  headers: {
    Authorization: `token ${Config.gitea.token}`,
  },
})

export type MirrorOptions = {
  private: boolean
  auth_token: string
  clone_addr: string
  repo_name: string
}
export async function mirror(options: MirrorOptions) {
  try {
    logger.debug('Mirroring repository', options)
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
    logger.debug('Mirrored repository', { data: response.data })
    return response.data
  } catch (e) {
    if (e instanceof AxiosError) {
      logger.error('Error mirroring repository', e.response?.data)
    } else {
      logger.error('Unknown error', e)
    }
  }
}

export async function listRepositories(page: number, limit: number) {
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
  logger.debug('Listing all repositories in Gitea')
  const limit = 50
  const repos: ListRepositoriesResponse = []
  let page = 1
  while (true) {
    const response = await listRepositories(page, limit)
    repos.push(...response)
    if (response.length < limit) break
    page++
  }
  logger.debug('Listed all repositories in Gitea', { data: repos })
  return repos
}
