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

## Current release shape

- Server image: `ghcr.io/latticenet/lattice-server`.
- Dashboard: canonical Vue console embedded in the server image, currently
  covering Login, Overview, Security & 2FA, Nodes, Fleet Map, Approvals, Tasks,
  and Audit.
- Agent binaries: `lattice-agent-linux-amd64`, `lattice-agent-linux-arm64`, and
  `SHA256SUMS` on GitHub Releases.
- Docs/site: GitHub Pages.
- Plugins: signed artifact releases plus a draft static index foundation; an
  official index requires a top-level index signature.
- SDK contract: latest published tag is
  `github.com/LatticeNet/lattice-sdk v0.2.12`; server currently consumes
  `v0.2.12`, and node-agent currently consumes `v0.2.10`.
- Astra iOS companion: source repository with v2 Overview, Nodes, Monitors,
  Inventory, More, and Network & security read views backed by a typed Swift
  API client. Mobile approval sends the reviewed plan's SHA-256; TestFlight and
  signed builds are not published yet.

## Stability note

Lattice is early. The control plane is usable for private fleets with careful
perimeter hardening, backups, and reviewed node privileges. Marketplace install
and real plugin runners are deliberately staged behind more security work.
