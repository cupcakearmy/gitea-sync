# Backup GitHub repos to Gitea

Simple docker image that syncs your GitHub repos to a given Gitea server. It takes all the repos (public and private) and sets up a mirror. Private repos will stay a private mirror. Repos that are already set up will be skipped.

## Quick Start

Create a `docker-compose.yaml` and `.env` (see `.env.sample`). Create and insert tokens, and you are ready to go.

```yaml
version: '3.8'

services:
  sync:
    image: cupcakearmy/gitea-sync:1
    restart: unless-stopped
    env_file: .env
```

## Configuration

```sh
# Github PAT (deprecated)
# or
# Fine Grained token (Metadata and Content read-only scopes required)
GITHUB_TOKEN=

# Host of the Gitea server
GITEA_HOST=
# Gitea token (scopes: repos: read and write; user: read)
GITEA_TOKEN=

# OPTIONAL

# Cron schedule
CRON="0 */2 * * *"
```

## Known limitations

- Issues, PR, etc. can be imported, but [not for a mirror](https://github.com/go-gitea/gitea/issues/18369)
