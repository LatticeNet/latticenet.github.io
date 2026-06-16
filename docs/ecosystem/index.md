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
| [`lattice-plugin-index`](https://github.com/LatticeNet/lattice-plugin-index) | Signed plugin marketplace index | Static signed JSON |
| [`latticenet.github.io`](https://github.com/LatticeNet/latticenet.github.io) | Public website | GitHub Pages |

## Current release shape

- Server image: `ghcr.io/latticenet/lattice-server`.
- Agent binaries: `lattice-agent-linux-amd64`, `lattice-agent-linux-arm64`, and
  `SHA256SUMS` on GitHub Releases.
- Docs/site: GitHub Pages.
- Plugins: signed artifact releases plus static signed index foundation.
- SDK contract: `github.com/LatticeNet/lattice-sdk v0.2.0`.

## Stability note

Lattice is early. The control plane is usable for private fleets with careful
perimeter hardening, backups, and reviewed node privileges. Marketplace install
and real plugin runners are deliberately staged behind more security work.
