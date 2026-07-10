# Lattice 0.2.1 Release Notes

Lattice 0.2.1 coordinates the plugin UI isolation work with a corrected stable
node-agent line and published SDK contracts.

## Version matrix

| Surface | Version | Commit or artifact |
| --- | --- | --- |
| Server | `lattice-server v0.2.1` | `993e56759a7435aed06a5d3d7710848bb449eed8`, `ghcr.io/latticenet/lattice-server:0.2.1` |
| Dashboard | `lattice-dashboard v0.2.1` | `41fbd0fa3a1a7f2b778b31c479052455f3375962`, embedded by the server image |
| Node agent | `lattice-node-agent v0.2.9` | `94546a4f4302c18cf6cf3586e22b558756b94e6a`, stable GitHub Release binaries |
| SDK | `lattice-sdk v0.2.17` | `4623d3b58b50bd9406816779146532e33e10d32d` |
| Umbrella | `lattice v0.2.0` | Coordinated plugin architecture and workspace baseline |
| Plugin index | `lattice-plugin-index v0.2.0` | NetGuard and WireGuard entries corrected to signed `v0.1.0-alpha.5` artifacts |
| Plugin template | `lattice-plugin-template v0.2.0` | Authoring contract aligned with the core plugin generation |
| Docs | site package `0.2.1` | GitHub Pages |

## Highlights

- Plugin-contributed navigation is visually and structurally isolated from core
  navigation. Only active plugins contribute routes and tabs; uninstalling or
  deactivating a plugin returns the dashboard to its base capabilities.
- NetGuard and WireGuard remain at `v0.1.0-alpha.5`. Their manifests are signed
  by the trusted `latticenet` Ed25519 publisher key and production can verify,
  install, and activate them without enabling unsigned host-risk plugins.
- Activation is not host apply. Activation registers declared UI and capability
  surfaces; firewall or tunnel mutation still requires an explicit reviewed
  plan and apply path.
- Stable node-agent development resumes at `v0.2.9`. Historical `v0.3.0` through
  `v0.3.3` artifacts remain prereleases, so the server's stable `latest` resolver
  skips them. The `v0.2.9` binary declares server and dashboard floor `v0.2.1`.
- Nodes already reporting `0.3.x` are not automatically downgraded to `0.2.9`.
  The server rejects that semver downgrade; operators must make any deliberate
  channel transition explicit instead of relying on a moving update policy.
- Server and node-agent consume the published `lattice-sdk v0.2.17` tag rather
  than a pseudo-version.

## Plugin versions intentionally unchanged

`lattice-plugin-vpn-core v0.7.2` and `lattice-plugin-sub-store v0.3.1` remain
unchanged. NetGuard and WireGuard are not promoted to stable until their host
bootstrap, drift reporting, and configuration workflows receive further testing.

## Operational notes

- Pin production to `ghcr.io/latticenet/lattice-server:0.2.1` or its digest.
- Verify `/api/version` reports server `v0.2.1`, the server commit above, and the
  dashboard commit above before considering deployment complete.
- Plugin signing seeds are publisher credentials, not server access tokens. Keep
  the seed offline or in a restricted release environment and distribute only
  the public key to production trust configuration.
