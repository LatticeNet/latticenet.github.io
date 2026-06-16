# Docker Server

Use Docker for `lattice-server`. Use systemd for `lattice-node-agent`.

The public image is:

```txt
ghcr.io/latticenet/lattice-server
```

Use a version tag or digest for production. `:main` is acceptable for a first
private test, and `:latest` is published only as a compatibility alias. Avoid
unattended mutable tags for long-running deployments.

## Compose

```sh
git clone https://github.com/LatticeNet/lattice.git
cd lattice/compose
cp .env.example .env
$EDITOR .env
mkdir -p data plugins
docker compose up -d
```

The compose file binds the server to `127.0.0.1:8088`. Put a trusted HTTPS
reverse proxy in front of it.

The first boot creates `data/master.key` automatically. Do not set
`LATTICE_MASTER_KEY_FILE` unless you are mounting an existing key from a restore
or secret manager; pointing it at a missing file makes startup fail closed.

The image entrypoint fixes ownership of the mounted data directory before
dropping privileges to the `lattice` user, so a root-created `./data` directory
from the quickstart works without running the server process as root.

## Required settings

```ini
LATTICE_ADMIN_PASSWORD=replace-with-a-long-random-password
LATTICE_PUBLIC_URL=https://lattice.example.com
LATTICE_SECURE_COOKIES=1
```

Use `LATTICE_TRUST_PROXY=1` only when the only public path is a trusted reverse
proxy that sets client IP headers correctly.

## Persistent data

Back up these together:

```txt
state.json
state.json.audit-wal
logs.db
master.key
```

Losing `master.key` makes encrypted secrets unrecoverable.

## Plugin directory

Marketplace entries are metadata until install and runner workflows mature.
Local plugin bundles live under `LATTICE_PLUGIN_DIR`. The recommended server
mount is read-only:

```txt
./plugins -> /plugins:ro
```

## Agent boundary

Do not deploy `lattice-node-agent` as the primary Docker path. The agent applies
host-local operations such as nft rules, service restarts, binary replacement,
and log tailing. Run it as a host binary managed by systemd.

## Detailed source

The compose files and longer tutorial live in the umbrella repo:

```txt
https://github.com/LatticeNet/lattice/tree/main/compose
https://github.com/LatticeNet/lattice/blob/main/docs/tutorials/docker-server.md
```
