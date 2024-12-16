import cron from 'node-cron'

import { Config } from './config.ts'
import { sync } from './core.ts'
import { logger } from './logger.ts'

logger.info(`Mirror manager - ${Config.version}`, { version: Config.version })

Deno.addSignalListener('SIGINT', () => {
  console.log('exiting...')
  Deno.exit()
})

// Run on startup once, then delegate to cron
await sync()
if (!Config.runOnce) {
  cron.schedule(Config.cron, sync)
}
