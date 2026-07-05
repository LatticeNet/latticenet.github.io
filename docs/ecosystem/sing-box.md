# sing-box Dependency Baseline

Lattice's vpn-core workflows integrate with a third-party sing-box fork for proxy-core configuration and runtime discovery.

## Repository

```txt
https://github.com/lr00rl/sing-box
```

Current documented baseline:

```txt
b4707b2e02ff54dfaf0ea4dbf70f29c7ab381c4a
Preserve structured user mutation errors
```

This is a third-party dependency baseline, not a LatticeNet-owned release surface. Treat upgrades like any other privileged infrastructure dependency: review the diff, rebuild or install the matching binary intentionally, and record the exact commit in release notes.

## How Lattice uses it

- Node agents can discover sing-box runtime state when `LATTICE_SINGBOX_DISCOVER=1` is enabled.
- Discovery expects a local `sb`/sing-box-compatible command that can expose JSON inventory, for example `sb --json` surfaces used by the agent's read-only discovery path.
- vpn-core plugin and line-management workflows generate and reason about sing-box-style inbound, outbound, user, and usage metadata.
- Lattice stores and displays operational metadata, but secrets such as UUIDs, passwords, private keys, and token material must remain redacted or one-time-only depending on the workflow.

## Operator guidance

1. Install or update sing-box outside Lattice using your normal host package, systemd, or container workflow.
2. Keep the runtime command path stable. If the command is not named `sb`, set the agent environment variable that points discovery at the correct binary.
3. Enable discovery only on nodes where reporting proxy-core inventory to Lattice is acceptable.
4. After upgrades, check the node detail inventory panel and server logs for structured user mutation errors rather than treating every mutation failure as a generic shell failure.

## Upgrade checklist

- Record the sing-box fork commit and binary version.
- Confirm JSON discovery still emits the fields consumed by Lattice.
- Confirm user mutation errors remain structured so dashboard workflows can show actionable messages.
- Verify generated configs do not expose secret fields in Lattice audit logs or dashboard read APIs.
- Update this page and the release notes when the baseline changes.

## Credits

The sing-box project and ecosystem provide the proxy-core foundation used by Lattice's vpn-core workflows. Lattice documents the fork baseline so operators can audit exactly which third-party proxy-core behavior their deployment expects.
