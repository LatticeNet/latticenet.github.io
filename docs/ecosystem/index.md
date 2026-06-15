# Ecosystem

LatticeNet is intentionally split across small repositories so each deployable
unit can be released and secured independently.

| Repository | Role |
| --- | --- |
| [`lattice`](https://github.com/LatticeNet/lattice) | Umbrella docs, roadmap, compose, workspace orchestration |
| [`lattice-server`](https://github.com/LatticeNet/lattice-server) | Control plane server and APIs |
| [`lattice-node-agent`](https://github.com/LatticeNet/lattice-node-agent) | Outbound node agent |
| [`lattice-dashboard`](https://github.com/LatticeNet/lattice-dashboard) | Static dashboard |
| [`lattice-sdk`](https://github.com/LatticeNet/lattice-sdk) | Shared Go model/contracts |
| [`lattice-plugin-template`](https://github.com/LatticeNet/lattice-plugin-template) | Plugin author kit |
| [`lattice-plugin-index`](https://github.com/LatticeNet/lattice-plugin-index) | Planned signed plugin marketplace index |
| [`latticenet.github.io`](https://github.com/LatticeNet/latticenet.github.io) | Public website |

## Release Direction

- Server image: GHCR.
- Agent binaries: GitHub Releases.
- Docs/site: GitHub Pages.
- Plugins: signed artifact releases plus static signed index.
