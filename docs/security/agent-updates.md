# Agent Updates

Lattice supports server-controlled node-agent updates without asking each node
to trust mutable release metadata.

The server stores a per-node policy:

```txt
node id
target_version
HTTPS binary URL
SHA-256 digest
install path
systemd service name
auto-plan flag
```

## Release inputs

The expected source is a GitHub Release from
[`LatticeNet/lattice-node-agent`](https://github.com/LatticeNet/lattice-node-agent):

```txt
lattice-agent-linux-amd64
lattice-agent-linux-arm64
SHA256SUMS
```

Use `SHA256SUMS` to fill the policy digest. Do not use a mutable `latest` URL as
the executable instruction.

## Apply safety

The queued task:

1. downloads over HTTPS;
2. verifies SHA-256;
3. verifies the candidate's `-version` output must equal `target_version`;
4. backs up the current binary;
5. installs atomically;
6. schedules a delayed service restart so the current agent can report the task
   result.

If the policy changes after planning, the old approval is stale and must be
re-planned.

## Auto-plan

auto-plan never auto-approves. It creates a pending approval only when:

```txt
node.agent_version != policy.target_version
```

and no equivalent `pending` or `approved` update is already open. An operator
still reviews the plan and approves the visible plan hash before any node task
is queued.

## Failure behavior

- SHA mismatch: fail before install.
- Version mismatch: fail before install.
- Missing `-allow-exec`: the agent refuses the task.
- No systemd: the binary may be installed, but restart is manual.

The policy stores the latest bounded error so the next plan is reviewable
instead of silently retrying.

## Future work

Release channels such as `stable` and `canary` should be implemented by a
server-side signed manifest resolver. The resolver must still produce the same
immutable tuple: version, URL, SHA-256, install path, and service name.
