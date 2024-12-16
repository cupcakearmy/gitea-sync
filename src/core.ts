import { listAllRepositories as giteaRepos, mirror, MirrorOptions, updateRepository } from './api/gitea.ts'
import { listAllRepositories as githubRepos } from './api/github.ts'
import { Config } from './config.ts'
import { logger } from './logger.ts'

let running = false

const l = logger.child({ context: 'runner' })

export async function sync() {
  if (running) {
    l.info('already running, skipping')
    return
  }
  try {
    l.info('starting sync')
    const syncedRepos = await giteaRepos()
    const toSync = await githubRepos()
    l.debug('loaded repos', { remote: toSync.length, local: syncedRepos.length })

    // List of all the repos in gitea, that are not on github
    const notInSource = new Set(syncedRepos.map((r) => r.name))

    for (const repo of toSync) {
      const lr = l.child({ repo: repo.name })
      const sameName = syncedRepos.find((r) => r.name === repo.name || r.original_url === repo.clone_url)
      if (sameName) {
        notInSource.delete(sameName.name)
        if (sameName.original_url === repo.clone_url) {
          if (sameName.private === repo.private) logger.info('Already synced, skipping', { name: repo.name })
          else {
            lr.info('visibility changed, updating')
            const [owner, repository] = sameName.full_name.split('/')
            if (!owner || !repository) {
              lr.error('invalid repository name', { full_name: sameName.full_name })
              continue
            }
            await updateRepository(owner, repository, { private: repo.private })
          }
        } else {
          lr.error('repo with same name but different url', {
            url: repo.clone_url,
            original_url: sameName.original_url,
          })
        }
        continue
      }

      const options: MirrorOptions = {
        repo_name: repo.name,
        clone_addr: repo.clone_url,
        private: repo.private,
        auth_token: Config.github.token,
      }
      lr.info('mirroring repository', options)
      await mirror(options)
      lr.info('mirrored repository')
    }
    if (notInSource.size) {
      l.info(`Found ${notInSource.size} surplus repositories in gitea`, { repos: [...notInSource] })
    }
    l.info('Finished sync')
  } catch (error) {
    l.debug(error)
    l.error('Failed to sync', { error: error instanceof Error ? error.message : 'Unknown error' })
  } finally {
    running = false
  }
}
