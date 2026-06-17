# Operations

Lattice groups high-risk operations under a reviewable approval flow.

## Implemented surfaces

- Node enrollment, token rotation, metrics, and host facts.
- Machine inventory, cost, renewal dates, and reminders.
- Log ingestion into bounded `logs.db`.
- Network Guard and NetPolicy plan/apply.
- Self-host DNS plan/apply and Cloudflare publication.
- Geo-Routing configure and preview.
- Proxy-core profiles and subscriptions for the current VLESS + REALITY path.
- Proxy usage reporting, quota/expiry notifications, and collector health.
- Notification channels plus routing rules for monitor, SSH-login, and proxy
  quota/expiry events.
- Node-agent update policies with manual plan and auto-plan pending approvals.
- Plugin lifecycle registry and noop runtime foundation.

## Operator rule

If an operation mutates a host or changes fleet security posture, it should
produce a plan first. Review the exact target, artifact hash, rendered config,
or nft rules before applying.

## Deployment perimeter

Public internet should reach only intentionally published services. Keep the
control plane behind HTTPS plus WireGuard, Cloudflare Access, or another trusted
identity-aware perimeter.

Host-side firewalling helps, but upstream DDoS protection still matters. If
traffic saturates the uplink before it reaches your server, nftables cannot
recover the lost bandwidth.

## Notifications

Platform -> Notifications separates destinations from routing:

- Channels are delivery destinations such as Telegram, Bark, Discord, or a
  generic webhook. Secret fields are write-only and are never returned by the
  server.
- Rules match event ids and select one or more channels. If no rules exist,
  Lattice preserves the old behavior and sends every notification to every
  enabled channel.
- Templates can rewrite the title and body using `{{event_type}}`, `{{title}}`,
  and `{{body}}`.

Current server event ids include:

| Event id | Source |
| --- | --- |
| `monitor.down` | Monitor transition to failing |
| `monitor.recovered` | Monitor transition back to healthy |
| `ssh.login` | Node-agent SSH login event |
| `proxy.quota` | Proxy user traffic threshold notification |
| `proxy.expiry` | Proxy user expiry notification |
| `*` | Match every notification event |

## Do not automate yet

- Community plugin installation.
- Plugin artifact execution.
- Agent auto-plan before release URL and SHA are final.
- Any release channel resolver that points nodes at mutable `latest` metadata.

These are roadmap items because they need stronger signing, runner isolation,
rollback, and audit behavior.
