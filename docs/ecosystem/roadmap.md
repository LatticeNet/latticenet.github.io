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

## Near-term

1. Signed release manifest and channel resolver for server/agent artifacts.
2. Plugin marketplace fetch/install workflow that still separates install from
   activation.
3. Concrete runner isolation tests before enabling system, worker, or wasm
   plugin execution.
4. Geo-Routing apply and parent-zone publication workflow.
5. Log ingestion v2 with per-line accepted offsets.

## Longer-term

- Official sing-box, xray, Sub-Store, and notification plugins.
- Private DNS deployment and GeoDNS operations.
- Richer dashboard UX for repeated operator workflows.
- bbolt-first runtime storage.
- Optional proto/gRPC contracts where cross-language clients justify the cost.

## Hard gates

- Marketplace install must not bypass manifest verification or capability
  review.
- Marketplace activation must wait for runner sandbox maturity.
- Agent update channels must resolve to immutable URL + SHA + version tuples.
- Community host-risk plugins stay blocked by default.
