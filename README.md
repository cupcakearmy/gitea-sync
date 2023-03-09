# Backup Github repos to Gitea

Simple docker image that syncs your Github repos to a given Gitea server. It takes all the repos (public and private) and sets up a mirror. Private repos will stay a private mirror. Repos that are already setup will be skipped.

## Quick Start

Create a `docker-compose.yaml` and `.env` (see `.env.sample`). Create and insert tokens and you are ready to go.

```yaml
version: '3.8'

services:
  sync:
    image: cupcakearmy/gitea-sync
    restart: unless-stopped
    env_file: .env
```

## Configuration

```sh
# Github PAT
# Also works with the new fine grained, read-only tokens
GITHUB_TOKEN=

# Host of the Gitea server
GITEA_HOST=
# Gitea token
GITEA_TOKEN=

# OPTIONAL

# Cron schedule
CRON="0 */2 * * *"
```

## Known limitations

- Issues, PR, etc. can be imported, but [not for a mirror](https://github.com/go-gitea/gitea/issues/18369)
