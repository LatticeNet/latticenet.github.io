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
| [`lattice-plugin-vpn-core`](https://github.com/LatticeNet/lattice-plugin-vpn-core) | sing-box lines, users, and usage | Signed plugin bundle |
| [`lattice-plugin-sub-store`](https://github.com/LatticeNet/lattice-plugin-sub-store) | Native subscription platform | Signed plugin bundle |
| [`lattice-plugin-netguard`](https://github.com/LatticeNet/lattice-plugin-netguard) | Reviewed nftables security groups | Signed plugin bundle |
| [`lattice-plugin-wireguard`](https://github.com/LatticeNet/lattice-plugin-wireguard) | WireGuard topology and device peers | Signed plugin bundle |
| [`lattice-plugin-bridge`](https://github.com/LatticeNet/lattice-plugin-bridge) | Sandboxed postMessage channel for plugin UIs | npm package |
| [`lattice-plugin-template`](https://github.com/LatticeNet/lattice-plugin-template) | Plugin author kit | Template repo |
| [`lattice-plugin-index`](https://github.com/LatticeNet/lattice-plugin-index) | Draft plugin marketplace index (`main`) | Static JSON plus signing rules |
| [`latticenet.github.io`](https://github.com/LatticeNet/latticenet.github.io) | Public website | GitHub Pages |
| [`Astra`](https://github.com/LatticeNet/Astra) | iOS companion app for phone-first fleet operations | GitHub repo source + CI |
| [`sing-box`](https://github.com/lr00rl/sing-box) | Personal fork of the proxy core used by vpn-core | External repo, not LatticeNet |

## Current release shape

Published versions live in one place, `docs/.vitepress/data/versions.ts`, and
`npm run check:pins` fails the Pages build when a `verify`-marked pin lags
GitHub. Do not copy numbers into this page; they go stale here first.

Stable GHCR tags are immutable (`:X.Y.Z`). `:latest` is the moving stable
image, published only by the `latest` git tag. `:alpha` and `:beta` are the
moving test channels. Prerelease GitHub releases never become Latest, and
`target_version=latest` on the server resolves stable only.

The dashboard does not ship alone: the server image bakes the commit in
`dashboard.ref`, and About shows the pair. Between SDK milestones the server
and node-agent may pin a Go pseudo-version of an SDK commit that has no tag
yet; downstream consumers still depend on the published `lattice-sdk` tag.

Astra remains source plus CI: TestFlight and signed builds are not published.

The first stable cut of the control plane and the four official plugins is
live. The numbers are in `versions.ts` (and the home-page status matrix that
reads it), not a second list in this page.

## Stability note

Lattice is early. The control plane is usable for private fleets with careful
perimeter hardening, backups, and reviewed node privileges. Verified system
plugins can be installed and activated, but activation only exposes their
declared capability and UI surfaces; host changes still require a separate,
reviewed plan/apply operation.
