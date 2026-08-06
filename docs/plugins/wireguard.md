# WireGuard

`latticenet.wireguard` — WireGuard topology and device peers, planned before
they are applied.

## Capabilities

```
node:read    network:plan    network:apply    task:run
```

## Interface

`latticenet.wireguard/networks`

| Method | What it does |
|---|---|
| `overview` | Current topology, peers and their state. |
| `plan` | Render a topology change for review. |

The interface is deliberately small. Everything that changes a host goes through
`plan`, which means there is no second path that skips review.

## Keys

Private key material is never rendered into a review plan. A plan you approve
shows the topology — which peers exist, what they can reach — not the secrets
that implement it. This is the same rule the rest of the system follows: the
plan is secret-safe by construction, because it is a document a human is
expected to read and paste into an approval.

## A known gap

Applying a WireGuard change has **no automatic rollback**. Firewall apply is
rollback-protected; this is not. If a topology change makes a node unreachable,
recovery is manual.

This is documented rather than smoothed over because it changes how you should
sequence work: apply topology changes when you still have another way onto the
host.

## Install

Place `manifest.json` and `artifact` in a directory named for the plugin id,
verify the digest against the manifest, restart the server, then activate.
