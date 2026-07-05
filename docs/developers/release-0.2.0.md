# Lattice 0.2.0 Release Notes

Lattice 0.2.0 is the first coordinated release where the server image, embedded dashboard, node-agent, SDK contract, and public docs are versioned together.

## Version matrix

| Surface | Version | Release artifact |
| --- | --- | --- |
| Server | `lattice-server v0.2.0` | `ghcr.io/latticenet/lattice-server:0.2.0`, plus moving `:latest` and `:alpha` |
| Dashboard | `lattice-dashboard v0.2.0` | Embedded in the server image from dashboard commit `ad83c6d1ad25519b08d5d90dfc52223531b67b76` |
| Node agent | `lattice-node-agent v0.3.0` | GitHub Release binaries for Linux and Darwin, amd64 and arm64 |
| SDK | `lattice-sdk v0.2.15` | Shared Go model/contract tag consumed by server and agent |
| Docs | site package `0.2.0` | GitHub Pages |
| sing-box dependency baseline | `lr00rl/sing-box@b4707b2e02ff54dfaf0ea4dbf70f29c7ab381c4a` | External third-party fork documented as a dependency baseline |

## Highlights

- server-side node-token auth cache: agent bearer authentication now reuses the PBKDF2 result for a short TTL keyed by node id, source IP, token fingerprint, and token hash. The server still checks node status, disable state, source allowlist, and token hash on every request, so token rotation and node disable remain fast while idle polling no longer burns CPU.
- On-demand terminal control channel: `lattice-node-agent v0.3.0` keeps an outbound control WebSocket. Opening a terminal pushes `terminal.open` to the agent; idle agents no longer need aggressive terminal discovery polling when the control socket is connected.
- Stale terminal runner shutdown: legacy poll-mode terminal input loops exit on `404` or `410` so deleted server sessions stop generating request noise.
- native passkeys: dashboard HTTPS origins can register discoverable WebAuthn credentials that Safari/iOS saves to Apple Passwords/iCloud Keychain. Passkey login issues the normal Lattice session and satisfies user verification.
- Passkey management hardening: deleting a passkey uses the correct layered dialogs so the 2FA/passkey step-up prompt is not hidden behind the delete confirmation.
- Cloudflare-inspired sidebar: the dashboard sidebar gained pinned shortcuts, recents, collapsible sections, active-section auto-open, and quick search while staying on Lattice design tokens.
- Versioned images: server images are named by release/channel (`0.2.0`, `0.2`, `latest`, `alpha`, future `beta`) instead of opaque hash strings.
- Release hygiene: server and agent now consume `lattice-sdk v0.2.15` instead of release-time pseudo-versions.
- Agent release resolver hardening: official agent update planning resolves `latest` through GitHub's release redirect instead of the REST releases API, and caches release metadata successes plus short-lived failures so multi-node policy evaluation does not exhaust anonymous GitHub API rate limits.

## Operational notes

- Existing `0.2.8` agents continue working with server `0.2.0`. They may still use low-frequency fallback discovery or legacy poll-mode terminal behavior.
- Roll out `lattice-node-agent v0.3.0` to remove idle terminal discovery load from upgraded nodes.
- Reverse proxies must pass WebSocket upgrade headers for `/api/terminal/sessions/:id/attach`, `/api/agent/terminal/stream`, and `/api/agent/control/stream`.
- Passkeys require the browser origin and WebAuthn RP ID to match the public HTTPS dashboard origin. No Apple developer account or associated domains file is required for the web dashboard path.
- The `alpha` channel is intentionally aligned to `0.2.0` at release time. Future testing should use `alpha` and `beta` moving tags instead of ad hoc hash-like image names.
- Official agent update metadata is shared server-side for a short TTL. A temporary upstream GitHub failure should not produce one upstream request per node in the same policy evaluation window.

## Third-party tools and acknowledgements

Lattice 0.2.0 stands on work from the Go, Vue, Vite, WebAuthn, Docker BuildKit, GitHub Actions, GitHub Container Registry, Cloudflare, Gorilla WebSocket, xterm.js, VitePress, and sing-box communities. The vpn-core workflows document the `lr00rl/sing-box` fork as a third-party dependency because Lattice integrates with its JSON/runtime surfaces rather than vendoring it directly.
