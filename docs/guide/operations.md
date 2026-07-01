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

Pending approvals can also be rejected from **Operations -> Approvals**. Reject
closes the reviewed plan without queuing an agent task; use it for stale plans,
superseded auto-plans, or proposals the operator does not want to apply.

Stale node-agent update approvals are closed as `rejected`, not retried. The
Approvals page labels them stale and, for operators with planning rights, offers
**Create fresh plan**. That action creates a new pending approval for review; it
does not approve the old plan or queue an update task. If the node already
reports the target version, Approvals asks before **Force fresh plan** creates a
replacement pending approval; forced planning still does not approve or apply.

## Machine inventory

Use **Fleet -> Inventory** as the billing and renewal overlay for nodes. The
node-agent supplies host facts such as OS, CPU, memory, kernel, and architecture;
operators add the commercial metadata that cannot be discovered reliably:
vendor, region, price, renewal cycle, next renewal date, and support notes.

Stored console and provider-detail URLs are write-only operational links. The
dashboard shows whether a link exists, but it does not echo the saved URL back
in list views. Leave the URL fields blank while editing to keep the existing
stored value, or use the clear checkbox when the link should be removed.

Renewal reminders are explicit. Enabling reminders on a profile does not mutate
the node or provider account; it only lets the server emit notification events
when the configured `remind_days_before` thresholds are reached. Use the
selected-machine reminder action for a single profile and the page-level action
for a fleet-wide reminder pass.

## vpn-core runtime profiles

The official `latticenet.vpn-core` Node Profiles page is a runtime inventory,
not an authoring form. It combines managed proxy profiles, sing-box discovery,
applied state, collector health, and the node capabilities reported by the
agent. Use it to answer operational questions such as:

- which nodes have a managed vpn-core profile;
- whether the last plan has been applied on the node;
- how many listeners are declared versus discovered at runtime;
- whether the usage collector is healthy; and
- which nodes are discovered-only and still need an authored profile.

Treat `Managed` and `Discovered-only` as different states. A discovered-only
node can have a local sing-box process and still lack a Lattice-authored profile.
Apply plans from the profile authoring surfaces, then use Node Profiles to
confirm the node heartbeat and collector state caught up.

## Fleet expression filters

The dashboard's Nodes page and Task target picker include a small expression
language for selecting nodes without writing code. It is intentionally limited:
there is no SQL, no regex engine, and no numeric comparison syntax yet.

Supported forms:

```txt
AND(exec, root, NOT(sing-box))
AND(sing-box, NOT(vpn-lines))
OR(linux, darwin, amd64, arm64)
AND(tag:cd, agent:exec, NOT(vpn:recorded))
```

Useful tokens:

| Token | Meaning |
| --- | --- |
| `exec` | Agent runtime or saved launch profile allows task execution. |
| `root` | Agent runtime or saved launch profile allows root execution. |
| `terminal` | Browser terminal is enabled. |
| `stream` | Terminal transport is stream. |
| `poll` | Terminal transport is poll. |
| `sing-box` | Agent sing-box discovery is enabled. |
| `vpn-lines` | The official vpn-core plugin has recorded Lines for the node. |

Use `sing-box` and `vpn-lines` separately. A node can have sing-box discovery
enabled but still have no vpn-core Lines recorded yet:

```txt
AND(sing-box, NOT(vpn-lines))
```

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

For node-agent rollout details, use [Agent Updates](/security/agent-updates).
For release sequencing and cross-repository compatibility rules, use the
[Release Workflow](/developers/releases).
