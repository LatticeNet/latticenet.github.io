# NetGuard

`latticenet.netguard` — reviewed firewall policy: zones, groups and bindings,
rendered as a plan before anything is applied to a host.

## Capabilities

```
node:read    network:plan    network:apply    task:run
```

## Interface

`latticenet.netguard/firewall`

| Method | What it does |
|---|---|
| `overview` | Current zones, groups and bindings as the server understands them. |
| `upsert_zone` / `delete_zone` | Define where a rule set applies. |
| `upsert_group` / `delete_group` | Define a reusable set of rules. |
| `upsert_binding` | Attach a group to a zone. |
| `adopt` | Take over a host that already has rules, without flattening them first. |
| `plan` | Render the change for review. |

## Adopt before you apply

`adopt` exists because the dangerous moment with a firewall tool is the first
one. A tool that assumes it owns the ruleset will happily replace a working
configuration with its own idea of the world, and on a remote host that mistake
locks you out.

Adoption reads what is already there and brings it under management, so the
first plan you review is a diff against reality rather than against an empty
slate.

## Why a firewall plugin still cannot lock you out

`network:apply` does not mutate a host. It produces a task, and the task travels
the same path as everything else: rendered, hashed, approved, leased by the
agent, validated on the node, then applied. The node validates the artifact
before mutation, and apply scripts are rollback-protected.

That does not make a bad rule safe — it makes a bad rule *visible before it
ships*, and recoverable after.

## Install

Place `manifest.json` and `artifact` in a directory named for the plugin id,
verify the digest against the manifest, restart the server, then activate.
