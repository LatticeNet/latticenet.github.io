# VPN Core

`latticenet.vpn-core` — proxy-core operations: VLESS + REALITY profiles, lines,
users, and usage reporting.

## Capabilities

```
node:read    network:plan    network:apply    task:run
```

No secret access and no outbound HTTP. The plugin plans changes and hands them
to the same review gate everything else uses; it does not reach hosts itself.
`network:apply` produces work for an agent to lease — it is not a licence to
mutate a node directly.

## Interfaces

| Service | Methods |
|---|---|
| `…/nodes` | `export`, `list` |
| `…/lines` | `list`, `get`, `sync_metadata`, `reattach` |
| `…/users` | `list`, `get` |
| `…/users-admin` | `create`, `update`, `delete`, `bind`, `unbind`, `plan_add`, `plan_remove`, `plan_update`, `rotate` |
| `…/profiles` | `query`, `settings`, `configure` |
| `…/usage` | `query` |

The split between `users` and `users-admin` is a scope boundary, not
organisation: read methods and mutating methods are separately grantable, so a
role can be allowed to see users without being allowed to create them.

The `plan_*` methods on `users-admin` render a change for review. They do not
apply it. Applying is what the approval gate is for — see
[the control loop](/security/#the-control-loop).

## Subscriptions

VPN Core does not publish subscriptions. Node data flows to the
[Sub-Store plugin](/plugins/sub-store) over `rpc:call`, and Sub-Store renders and
publishes. Keeping the two apart means the plugin that reaches proxy nodes is not
also the plugin exposed on a public URL.

## Install

Same as any signed bundle: place `manifest.json` and `artifact` in a directory
named for the plugin id under your plugin directory, verify the digest matches
the manifest, restart, then activate.
