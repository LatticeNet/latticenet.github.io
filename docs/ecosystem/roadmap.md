# Roadmap

This page is the public summary. The canonical engineering roadmap remains in
the umbrella repository:

```txt
https://github.com/LatticeNet/lattice/blob/main/docs/roadmap.md
```

## Recently completed

- Docker server image published through GHCR.
- GitHub Pages public website and docs entry point.
- Node-agent GitHub Release workflow for Linux amd64/arm64 binaries and
  `SHA256SUMS`.
- Server-controlled node-agent update policies with manual plan and auto-plan
  pending approvals.
- Static plugin index foundation.
- KV Store v2 / Static hosting v2 foundation: bucket model, host/IP bindings,
  bucket-scoped access tokens, dashboard management, and public static serving.
- Notifications v2 foundation: multi-channel destinations, event routing rules,
  simple templates, and dashboard management.
- SSO provider setup guide in both the public docs and the dashboard New
  Provider dialog, including redirect URI and field-by-field OIDC guidance.
- Server-controlled node-agent diagnostics: per-node debug mode, optional
  central collection into managed Logs sources, and `lattice-agent` `v0.2.1`
  release artifacts.

## Near-term

1. Signed release manifest and channel resolver for server/agent artifacts.
2. Plugin marketplace fetch/install workflow that still separates install from
   activation.
3. Concrete runner isolation tests before enabling system, worker, or wasm
   plugin execution.
4. Geo-Routing apply and parent-zone publication workflow.
5. Log ingestion v2 with per-line accepted offsets and richer debug retention
   controls.
6. Static hosting follow-up: immutable object publishing, optional Cloudflare
   Pages integration, cache purge hooks, and reviewed cutover workflow.
7. Browser terminal design: explicit opt-in, audited interactive sessions,
   scoped node access, PTY/session transport, and safe disconnect semantics.
8. Notifications follow-up: delivery history, retry policy, mute windows, and
   richer channel-specific field help.

## Longer-term

- Official sing-box, xray, Sub-Store, and notification plugins.
- Private DNS deployment and GeoDNS operations.
- Richer dashboard UX for repeated operator workflows.
- Optional group-leader / relay topology for regional fleets. This requires
  parent/child enrollment semantics, delegated node tokens, health propagation,
  and clear failure behavior; current agents point directly at the primary
  server.
- bbolt-first runtime storage.
- Optional proto/gRPC contracts where cross-language clients justify the cost.

## Hard gates

- Marketplace install must not bypass manifest verification or capability
  review.
- Marketplace activation must wait for runner sandbox maturity.
- Agent update channels must resolve to immutable URL + SHA + version tuples.
- Community host-risk plugins stay blocked by default.
- Terminal and group-leader features must ship with server-side authorization,
  audit events, and documented failure modes before dashboard controls claim
  support. KV and Static controls now have server-side authorization, audit events,
  and documented failure modes; future publishing workflows must preserve that bar.
