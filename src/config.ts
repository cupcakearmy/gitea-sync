function getEnv(key: string, fallback: string, parse?: undefined, validator?: (s: string) => boolean): string
function getEnv<T>(key: string, fallback: T, parse: (value: string) => T, validator?: (T: string) => boolean): T
function getEnv<T>(
  key: string,
  fallback: T,
  parse?: (value: string) => T,
  validator?: (s: string | T) => boolean
): T | string {
  const value = Deno.env.get(key)
  const parsed = value === undefined ? fallback : parse ? parse(value) : value
  if (validator && !validator(parsed)) {
    console.error(`Invalid or missing value for ${key}: ${value}`)
    Deno.exit(1)
  }
  return parsed
}

function isPresent(s: string): boolean {
  return s.length > 0
}

function simple(key: string) {
  return getEnv(key, '', undefined, isPresent)
}

export const Config = {
  logging: {
    level: getEnv('LOG_LEVEL', 'info'),
  },
  github: {
    token: simple('GITHUB_TOKEN'),
  },
  gitea: {
    host: simple('GITEA_HOST'),
    token: simple('GITEA_TOKEN'),
  },
  cron: getEnv('CRON', '0 */2 * * *'),
  version: getEnv('npm_package_version', 'unknown'),
}
