# Plugin Lifecycle

Lattice deliberately separates four decisions that are easy to confuse:

1. **Publish**: a publisher signs a manifest and artifact digest.
2. **Verify**: the server checks the bundle against its local trust policy.
3. **Activate**: an authorized operator enables the verified plugin runtime.
4. **Apply**: a separately reviewed plan changes a managed node.

Passing one gate never implies that the next gate has been approved.

## State machine

The persisted lifecycle states are:

```txt
bundle discovered and verified
           |
           v
       verified -> installed -> active
                     |            |
                     v            v
                  disabled <------+
                     |
                     +-----------> active
```

The supported transitions are intentionally narrow:

| From | To | Meaning |
| --- | --- | --- |
| no record | `verified` | The loader accepted the local bundle. |
| `verified` | `installed` | An operator accepted the verified bundle for this server. |
| `installed` | `active` | The server arms the plugin runtime and capability broker. |
| `installed` | `disabled` | The bundle remains registered but cannot run. |
| `active` | `disabled` | Runtime access is detached and plugin UI contributions disappear. |
| `disabled` | `active` | The server re-arms the previously installed plugin. |

Skipping `installed`, returning an active plugin to `verified`, or activating a
bundle that is no longer loaded is rejected.

## What each state proves

### Verified

`verified` means the startup loader has accepted the bundle currently present
under `LATTICE_PLUGIN_DIR`. Depending on the manifest, verification includes:

- strict manifest parsing and known capability validation;
- SHA-256 verification of the fixed `artifact` file;
- Ed25519 signature verification over the manifest signing payload;
- publisher lookup in the operator's `LATTICE_PLUGIN_TRUST` policy; and
- host-risk rules that fail closed for unsigned or untrusted publishers.

Verification does **not** grant runtime access and does not make the plugin's UI
visible.

### Installed

`installed` records an operator's acceptance of an already verified local
bundle. It is not a remote marketplace download. Current production bundles are
placed on disk by the operator or deployment system and mounted read-only into
the server.

The lifecycle record keeps the plugin identity, version, capabilities, digest,
and timestamps. The bundle must still be present and pass loader verification
after a restart.

### Active

`active` arms the runtime selected for the plugin type. For a trusted `system`
plugin, the server:

- re-verifies the manifest-pinned artifact digest;
- stages a `0700` copy in a private runtime directory;
- invokes actions as fresh, deadline-bounded subprocesses without a shell;
- strips the environment except for a fixed safe `PATH` and explicit allowlist;
- caps output and broker calls; and
- trips a circuit breaker after repeated failures.

The plugin receives a capability-scoped broker, never raw server internals.
Activation and runtime transitions are audited.

Fallback runners do not silently acquire system execution. Worker and wasm
execution remain separate maturity and sandboxing decisions.

### Disabled

`disabled` preserves the installation record while detaching runtime and broker
access. Active-only UI contributions are removed from the dashboard. A failed
stop also detaches broker access so a plugin cannot retain host API access after
the operator has disabled it.

## UI contribution boundary

Plugin navigation is declarative manifest data covered by the publisher
signature. The server exposes contributions only for active plugins, and the
dashboard resolves only allowlisted builtin component keys.

Therefore:

- an absent plugin does not add navigation;
- a verified or installed plugin does not add navigation;
- disabling an active plugin removes its contribution;
- an unknown component key cannot inject arbitrary front-end code; and
- base Console pages remain functional without any plugin installed.

An active first-party plugin may enhance an allowlisted native surface, such as
adding VPN line information to the fleet map. That enhancement must be derived
from active, authorized contributions and must disappear cleanly when the
plugin is disabled or removed.

## Activation is not host apply

Activating a network plugin does not automatically change nftables, WireGuard,
sing-box, DNS, or any node service.

Host mutation remains behind the core control-plane path:

```txt
plan -> lint -> review -> approve(plan_sha256) -> bounded agent task
     -> validate -> snapshot/watchdog -> apply -> self-check -> audit
```

The current official NetGuard and WireGuard subprocesses answer `describe`,
`health`, and `plan`. They do not directly mutate hosts. Their manifests may
declare host-risk capabilities because the complete reviewed workflow needs
those capabilities, but the subprocess cannot bypass the server's approval and
agent boundaries.

## Authorization

Both lifecycle listing and transitions use:

```txt
GET  /api/plugins/lifecycle
POST /api/plugins/lifecycle
scope: plugin:admin
```

A dashboard administrator can use an authenticated browser session. Automation
should use a short-lived, least-privilege PAT with only `plugin:admin` and send
it in `Authorization: Bearer ...`. Publisher signing keys are not API
credentials and must never be used as PATs.

See [PAT Authorization](/security/pat-authorization) for safe token handling and
[Plugin Trust](/security/plugin-trust) for the signing and trust-policy model.

## Operator runbook

Before activation:

1. Confirm the expected plugin ID, version, publisher, digest, and capabilities.
2. Confirm the bundle is loaded with zero verification rejections.
3. Review host-risk capabilities and the plugin's documented failure behavior.
4. Transition `verified -> installed`.
5. Transition `installed -> active`.
6. Confirm runtime state is armed and the expected UI contribution appears.
7. Confirm no node plan was approved or applied as a side effect.

To remove a plugin safely:

1. Disable it and confirm runtime access and UI contributions disappear.
2. Remove the local bundle through the deployment system.
3. Restart or roll the server so the loader no longer registers the bundle.
4. Confirm the base dashboard still works and no plugin route remains active.

Do not edit lifecycle records directly in `state.json` or bbolt. Use the audited
API so transition validation and runtime cleanup always run.

## Common failure modes

| Symptom | Meaning | Correct response |
| --- | --- | --- |
| `publisher is not trusted publisher` | Trust policy has no matching public key. | Verify publisher identity and update the public-key policy; never copy the seed to the server. |
| `invalid signature` | Manifest, signed contribution data, or digest does not match the signature. | Reject the bundle and rebuild/re-sign from a trusted release workspace. |
| `artifact digest mismatch` | Artifact bytes changed after signing or loading. | Reject and replace the bundle; do not update the digest in production. |
| `verified -> active` rejected | Required install review was skipped. | Transition to `installed`, then activate. |
| Active plugin has no page | Contribution is unauthorized, unknown, stale, or failed to load. | Check scopes, active lifecycle, registered component key, and browser/server logs. |
| Activation fails | Runner could not arm the verified artifact. | Keep the plugin disabled, inspect the audited error, and fix the bundle/runtime configuration. |
