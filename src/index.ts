import cron from 'node-cron'

import { Config } from './config.js'
import { sync } from './core.js'
import { logger } from './logger.js'

logger.info(`Mirror manager - ${Config.version}`, { version: Config.version })

await sync()
cron.schedule('0/5 * * * *', sync)
