# Operations

Lattice groups high-risk operations under a reviewable approval flow.

## Implemented Surfaces

- Node enrollment and token rotation.
- Metrics and host facts.
- Machine inventory, cost, renewal dates, and reminders.
- Log ingestion into bounded `logs.db`.
- Network Guard and NetPolicy plan/apply.
- Self-host DNS plan/apply and Cloudflare publication.
- Geo-Routing configure and preview.
- Proxy-core and subscriptions for the current VLESS + REALITY path.
- Node-agent update policies and reviewed apply.
- Plugin lifecycle registry and noop runtime foundation.

## Operator Rule

If an operation mutates a host or changes fleet security posture, it should
produce a plan first. Review the exact target, artifact hash, rendered config, or
nft rules before applying.

## Backups

Back up server state and encryption key together. Back up node-local configs
before enabling host mutation features on a node.

## Perimeter

Public internet should reach only intentionally published services. Keep the
control plane behind HTTPS plus WireGuard, Cloudflare Access, or another trusted
identity-aware perimeter.
