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

If the policy, target node state, or resolved artifact changes after planning,
the old approval is stale. Lattice refuses to queue it and closes the stale
pending approval as `rejected`; create a fresh plan and review its new plan
SHA-256 before approving. API clients should key this path from the stable
`approval_stale` error code, not from the human-readable error message.

## Auto-plan

auto-plan never auto-approves. It creates a pending approval only when:

```txt
node.agent_version != policy.target_version
```

and no equivalent `pending` or `approved` update is already open. When auto-plan
creates a replacement plan for the same node, older pending update approvals are
rejected so the inbox cannot keep unsafe-looking stale approvals. Editing or
deleting the update policy also rejects pending update approvals for that node,
and if the node already reports the current target before apply, the scheduler
closes the no-op approval as rejected. The approvals inbox performs the same
local cleanup for historical stale `agentupdate` approvals before rendering, so
an old pending plan may become `rejected` after a refresh. An operator still
reviews the plan and approves the visible plan SHA-256 before any node task is
queued.

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
