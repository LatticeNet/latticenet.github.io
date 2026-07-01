# Security Model

Lattice reduces operational risk by separating identity, intent, review,
execution, result reporting, and audit.

## Defaults

- Agents dial out to the server.
- The control plane should sit behind localhost, WireGuard, Cloudflare Access,
  or a trusted HTTPS reverse proxy.
- High-risk host mutations require reviewed approvals.
- Pending high-risk approvals require the dashboard-computed SHA-256 of the
  visible plan.
- API tokens use scopes and node allowlists.
- Plugin host APIs are capability-gated and audited.
- Secrets are encrypted at rest when `master.key` is present.
- Audit events are append-only and hash-chained.

## Host mutation

Any feature that changes nft, DNS, proxy-core configs, or the agent binary
follows:

```txt
plan -> review -> approve(plan_sha256) -> queue task -> result -> audit
```

If the reviewed plan no longer matches current server state, approval fails with
HTTP 409 and the stable `approval_stale` API error code. Re-plan, re-review the
visible plan SHA-256, and approve the replacement instead of retrying the stale
approval.

Operators with `network:apply` can reject a pending approval to close it without
queuing any task. Rejecting a plan is audited and does not weaken the
`approve(plan_sha256)` execution gate.

Agent updates add artifact gates: HTTPS URL, SHA-256, and a candidate version
that must match the policy target before install.

## Plugin trust

Plugins are capability-scoped. Host-risk plugins require signed manifests from
trusted publishers unless the operator explicitly accepts local development
risk.

Plugin artifact execution is not enabled by default. The current runtime
foundation can register lifecycle state and broker capabilities, but real
system, worker, and wasm runners remain gated by sandbox maturity.

## Network

Host-side firewalling helps, but upstream DDoS protection still matters. If
traffic saturates the uplink before it reaches your server, nftables or XDP on
that host cannot recover the lost bandwidth. Use cloud security groups,
upstream ACLs, or DDoS protection for public services.

## Login Transport

The password login endpoint receives username and password as JSON over HTTPS.
That is the standard browser login shape: the credential is not separately
encrypted by JavaScript because front-end encryption cannot replace TLS and often
creates misleading security assumptions.

Production deployments should use:

- HTTPS at the public edge;
- `LATTICE_SECURE_COOKIES=1`;
- `LATTICE_TRUST_PROXY=1` only behind a trusted reverse proxy;
- HSTS from the server when secure cookies are enabled;
- no remote cleartext `http://` path for operators or agents.

## Residual risk

Privileged node execution is inherently dangerous. Only enable `-allow-exec` and
`-allow-root-exec` on nodes where reviewed host mutation is required, and keep
release artifacts pinned by version and digest.
