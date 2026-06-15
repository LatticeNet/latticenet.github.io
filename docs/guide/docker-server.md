# Docker Server

Use Docker for `lattice-server`. Use systemd for `lattice-node-agent`.

## Compose

```sh
git clone https://github.com/LatticeNet/lattice.git
cd lattice/compose
cp .env.example .env
$EDITOR .env
mkdir -p data plugins
docker compose up -d
```

The compose file binds the container to `127.0.0.1:8088`. Put a trusted HTTPS
reverse proxy in front of it.

## Required Settings

```env
LATTICE_ADMIN_PASSWORD=replace-with-a-long-random-password
LATTICE_PUBLIC_URL=https://lattice.example.com
LATTICE_SECURE_COOKIES=1
```

Use `LATTICE_TRUST_PROXY=1` only when the only public path is a trusted reverse
proxy that sets client IP headers correctly.

## Persistent Data

Back up these together:

- `state.json`
- `state.json.audit-wal`
- `logs.db`
- `master.key`

Losing `master.key` makes encrypted secrets unrecoverable.

## Image

```txt
ghcr.io/latticenet/lattice-server
```

Use version tags or digests for production. Avoid unattended `latest`.

Detailed guide:

```txt
https://github.com/LatticeNet/lattice/blob/main/docs/tutorials/docker-server.md
```
