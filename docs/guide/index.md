# Operator Guide

Lattice is designed for a small private fleet where operators want one control
plane for monitoring, reviewed automation, network policy, DNS, proxy-core
configuration, logs, and plugin lifecycle.

Recommended production shape:

```txt
Internet
  -> HTTPS reverse proxy / Cloudflare / WireGuard entry
  -> lattice-server container on 127.0.0.1:8088

Nodes
  -> outbound HTTPS to server
  -> systemd lattice-node-agent host binary
```

## First Deployment

1. Deploy [Docker Server](/guide/docker-server).
2. Put it behind HTTPS.
3. Log in with the bootstrap admin.
4. Enable TOTP.
5. Enroll one node with a systemd `lattice-agent`.
6. Add privileged capabilities only when you need them.

## Principle

Lattice separates intent from mutation:

```txt
configure intent -> render reviewed plan -> approve hash -> queue task -> agent result -> audit
```

That shape is used for nft, DNS, proxy-core apply, and server-controlled
node-agent updates.

## Canonical Docs

The detailed engineering docs live in the umbrella repository:

```txt
https://github.com/LatticeNet/lattice/tree/main/docs
```

This site is the public entry point; the repo docs remain the source of truth for
implementation-level design and iteration records.
