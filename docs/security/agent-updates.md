# Agent Updates

Lattice supports server-controlled node-agent updates without reinstalling a
node from scratch.

The server stores a per-node policy:

```txt
node id
target version
HTTPS binary URL
SHA-256 digest
install path
systemd service name
auto-plan flag
```

Auto-plan creates a pending approval when the node reports a different version.
It never approves or applies automatically.

## Apply Safety

The queued task:

1. downloads over HTTPS;
2. verifies SHA-256;
3. runs the candidate with `-version`;
4. backs up the current binary;
5. installs atomically;
6. schedules a delayed service restart so the current agent can report the task
   result.

If the policy changes after planning, the old approval is stale and must be
re-planned.

## Future Work

Release channels such as `stable` and `canary` should be implemented by a
server-side signed manifest resolver. Nodes should not fetch or trust arbitrary
`latest` metadata directly.
