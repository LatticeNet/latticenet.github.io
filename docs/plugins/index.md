# Plugin Marketplace

The first Lattice marketplace is a read-only signed index, not an open upload
store and not a remote execution channel.

## Current state

Implemented in Lattice:

- local plugin directory loader;
- signed manifests;
- digest verification;
- trusted publisher policy;
- lifecycle registry/API/UI;
- capability broker;
- active-only declarative UI contributions; and
- bounded system runner for trusted first-party/operator-audited plugins.

The dashboard may show marketplace metadata, but it does not install or execute remote community bundles automatically. Trusted local `system` plugins can run
only after verification and explicit `verified -> installed -> active`
transitions.

Not implemented yet:

- remote index install workflow;
- remote bundle installation;
- worker/wasm runner isolation;
- community plugin publishing flow.

## Planned sources

```txt
official   LatticeNet signed and reviewed
verified   trusted publishers explicitly added by the operator
community  opt-in, visible only after the operator enables the source
local      bundles already present in LATTICE_PLUGIN_DIR
```

Official index repository:

```txt
https://github.com/LatticeNet/lattice-plugin-index
```

## Local storage

Installed bundle bytes are local server files under `LATTICE_PLUGIN_DIR`, for
example:

```txt
/plugins/example.plugin/manifest.json
/plugins/example.plugin/artifact
```

The server stores lifecycle metadata, verified identity, capabilities, digest,
timestamps, and runtime health in its state store. Plugin-owned durable data
should use a plugin namespace such as `plugin:<id>`.

The recommended Docker mount is read-only:

```txt
./plugins -> /plugins:ro
```

## Safety rule

A marketplace entry is only an install candidate. It must never bypass manifest
verification, capability review, trusted-publisher policy, or the lifecycle
gate.

Marketplace install must remain separate from runner activation. Real community
plugin execution depends on runner sandbox maturity, limits, audit, and rollback
behavior.

Learn how publisher verification, operator authorization, active-only UI, and
host apply remain separate in [Plugin Lifecycle](/plugins/lifecycle). For key
material and trust roots, see [Plugin Trust](/security/plugin-trust).
