# Plugin Marketplace

The Lattice marketplace starts as a signed plugin index, not an open upload
store.

## Current State

Implemented in Lattice:

- local plugin directory loader;
- signed manifests;
- digest verification;
- trusted publisher policy;
- lifecycle registry/API/UI;
- capability broker;
- noop runtime manager.

Not implemented yet:

- remote index installation;
- plugin artifact execution;
- system/worker/wasm runner isolation;
- community plugin publishing flow.

## Planned Sources

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

## Local Storage

Installed bundle bytes are local server files under `LATTICE_PLUGIN_DIR`, for
example `/plugins/example.plugin/{manifest.json,artifact}`. The server stores
only lifecycle metadata, verified identity, capabilities, digest, timestamps,
and runtime health in its state store. Plugin-owned durable data should use a
plugin namespace such as `plugin:<id>`.

The recommended Docker mount is read-only:

```txt
./plugins -> /plugins:ro
```

## Safety Rule

A marketplace entry is only an install candidate. It must never bypass manifest
verification, capability review, or the lifecycle gate.

Until remote install and runner sandboxing are reviewed, the dashboard should
display marketplace metadata only; it should not install or execute remote
community bundles automatically.
