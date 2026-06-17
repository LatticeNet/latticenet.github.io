# Operator Guide

Lattice is for small private fleets where monitoring, DNS, firewall intent,
proxy-core config, logs, and lifecycle automation need one reviewed control
plane.

Recommended production shape:

```txt
Internet
  -> trusted HTTPS reverse proxy / WireGuard / Cloudflare Access
  -> lattice-server container bound to 127.0.0.1:8088

Nodes
  -> outbound HTTPS to server
  -> systemd lattice-node-agent host binary
```

## First deployment path

1. Deploy [Docker Server](/guide/docker-server).
2. Put it behind HTTPS.
3. Log in with the bootstrap admin.
4. Enable TOTP.
5. Install one [node-agent](/guide/node-agent) without execution privileges.
6. Confirm metrics, host facts, and logs.
7. Enable privileged capabilities only on nodes that need reviewed mutation.

## Operating model

Lattice separates intent from mutation:

```txt
configure intent -> render reviewed plan -> approve hash -> queue task -> agent result -> audit
```

That shape is used for nft, DNS, proxy-core apply, and server-controlled
node-agent updates.

## Login and SSO

The bootstrap path is a local admin password, then TOTP. OIDC/SSO is optional:
an admin configures a provider in the dashboard, registers the redirect URL with
that identity provider, and pre-creates local users whose usernames match the
verified IdP email. The first successful SSO login binds the provider subject to
that local user; Lattice still issues its own `lattice_session` cookie and still
requires local TOTP when enabled.

See [Single Sign-On](/guide/sso) for the provider field guide and IdP callback
setup.

## What to back up

Back up server data and encryption material together:

- state store;
- audit WAL;
- `logs.db`;
- `master.key`;
- plugin directory when using local bundles.

Losing `master.key` makes encrypted secrets unrecoverable.

## Where to go next

- [Docker Server](/guide/docker-server): first production deployment.
- [Node Agent](/guide/node-agent): release binaries, systemd service, update policy.
- [Single Sign-On](/guide/sso): OIDC provider setup and field mapping.
- [Operations](/guide/operations): implemented operational surfaces and rules.
- [Security Model](/security/): trust boundaries and residual risks.
