# Security Model

Lattice is security-first, not magic. It reduces operational risk by separating
identity, intent, review, execution, result reporting, and audit.

## Defaults

- Agents dial out to the server.
- Management APIs are intended for localhost, WireGuard, Cloudflare Access, or a
  trusted HTTPS reverse proxy.
- High-risk host mutations require reviewed approvals.
- API tokens use scopes and node allowlists.
- Plugin host APIs are capability-gated and audited.
- Secrets are encrypted at rest when `master.key` is present.
- Audit events are append-only and hash-chained.

## Host Mutation

Any feature that changes nft, DNS, proxy-core configs, or the agent binary should
follow:

```txt
plan -> review -> approve(plan_sha256) -> queue task -> result -> audit
```

Unknown future plugins with reviewable plans should fail closed until they
choose explicit approval semantics.

## Network

Host-side firewalling helps, but upstream DDoS protection still matters. If
traffic saturates the uplink before it reaches your server, nftables/XDP cannot
recover the lost bandwidth. Use cloud security groups, upstream ACLs, or DDoS
protection for public services.

## Residual Risk

Privileged node execution is inherently dangerous. Only enable `-allow-exec` and
`-allow-root-exec` on nodes where reviewed host mutation is required.
