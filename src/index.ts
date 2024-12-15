import cron from 'node-cron'

import { Config } from './config.ts'
import { sync } from './core.ts'
import { logger } from './logger.ts'

logger.info(`Mirror manager - ${Config.version}`, { version: Config.version })

await sync()
cron.schedule(Config.cron, sync)
