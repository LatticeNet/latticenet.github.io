# Ecosystem

LatticeNet is split across small repositories so deployable units can be
released and secured independently.

| Repository | Role | Release surface |
| --- | --- | --- |
| [`lattice`](https://github.com/LatticeNet/lattice) | Umbrella docs, roadmap, compose, workspace orchestration | GitHub repo docs |
| [`lattice-server`](https://github.com/LatticeNet/lattice-server) | Control plane server and APIs | GHCR image |
| [`lattice-node-agent`](https://github.com/LatticeNet/lattice-node-agent) | Outbound node agent | GitHub Release binaries |
| [`lattice-dashboard`](https://github.com/LatticeNet/lattice-dashboard) | Vue static operator console | Bundled into server image |
| [`lattice-sdk`](https://github.com/LatticeNet/lattice-sdk) | Shared Go model/contracts | Semver Git tags |
| [`lattice-plugin-template`](https://github.com/LatticeNet/lattice-plugin-template) | Plugin author kit | Template repo |
| [`lattice-plugin-index`](https://github.com/LatticeNet/lattice-plugin-index) | Draft plugin marketplace index | Static JSON plus signing rules |
| [`latticenet.github.io`](https://github.com/LatticeNet/latticenet.github.io) | Public website | GitHub Pages |
| [`Astra`](https://github.com/LatticeNet/Astra) | iOS companion app for phone-first fleet operations | GitHub repo source + CI |
| [`sing-box`](https://github.com/lr00rl/sing-box) | Third-party proxy core dependency used by vpn-core workflows | External fork, documented baseline |

## Current release shape

> Snapshot as of 2026-07-28, describing **published** releases only. Prerelease lines
> move continuously and are not selected by `latest`; each repository's releases page is
> authoritative over this table.

- Server image: `ghcr.io/latticenet/lattice-server:0.2.1`, with moving `:latest`, `:alpha`, and `:beta` channels.
- Dashboard: `lattice-dashboard v0.2.1`, embedded in `lattice-server v0.2.1`, including isolated, active-only plugin navigation and lifecycle controls.
- Agent binaries: stable `lattice-node-agent v0.2.9` publishes Linux and Darwin artifacts plus `SHA256SUMS`; historical `v0.3.0` through `v0.3.3` remain prereleases and are not selected by `latest`.
- Docs/site: package `0.2.1` on GitHub Pages.
- Plugin platform: umbrella `lattice v0.2.0`, index `v0.2.0`, and author template `v0.2.0` are the current stable tags. NetGuard and WireGuard remain deliberately prerelease with no stable release yet (`v0.1.0-alpha.7` at the time of writing); vpn-core `v0.7.2` and Sub-Store `v0.3.1` are the current stable plugin releases, each with a newer prerelease line in flight.
- SDK contract: latest published tag is `github.com/LatticeNet/lattice-sdk v0.2.17`. Between milestones the server and node-agent pin a Go **pseudo-version** of the SDK commit they were built against rather than the published tag, so their `go.mod` may name a version that has not been tagged yet; the tag is what downstream consumers depend on.
- Astra iOS companion: source repository with v2 Overview, Nodes, Monitors,
  Inventory, More, and Network & security read views backed by a typed Swift
  API client. Mobile approval sends the reviewed plan's SHA-256; TestFlight and
  signed builds are not published yet.

## Stability note

Lattice is early. The control plane is usable for private fleets with careful
perimeter hardening, backups, and reviewed node privileges. Verified system
plugins can be installed and activated, but activation only exposes their
declared capability and UI surfaces; host changes still require a separate,
reviewed plan/apply operation.
