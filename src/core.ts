import { listAllRepositories as giteaRepos, mirror, MirrorOptions, updateRepository } from './api/gitea.js'
import { listAllRepositories as githubRepos } from './api/github.js'
import { Config } from './config.js'
import { logger } from './logger.js'

let running = false

export async function sync() {
  if (running) {
    logger.info('Already running, skipping')
    return
  }
  try {
    logger.info('Starting sync')
    const syncedRepos = await giteaRepos()
    const toSync = await githubRepos()
    logger.debug('Loaded repos', { remote: toSync.length, local: syncedRepos.length })

    for (const repo of toSync) {
      const sameName = syncedRepos.find((r) => r.name === repo.name || r.original_url === repo.clone_url)
      if (sameName) {
        if (sameName.original_url === repo.clone_url) {
          if (sameName.private === repo.private) logger.info('Already synced, skipping', { name: repo.name })
          else {
            logger.info('Visibility changed, updating', { name: repo.name })
            const [owner, repository] = sameName.full_name.split('/')
            await updateRepository(owner, repository, { private: repo.private })
          }
        } else {
          logger.error('Repo with same name but different url', {
            name: repo.name,
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
      logger.info('Mirroring repository', options)
      await mirror(options)
      logger.info('Mirrored repository', { name: repo.name })
    }
    logger.info('Finished sync')
  } catch (error) {
    logger.debug(error)
    logger.error('Failed to sync', { error: error instanceof Error ? error.message : 'Unknown error' })
  } finally {
    running = false
  }
}
