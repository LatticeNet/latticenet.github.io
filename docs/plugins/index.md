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

## Safety Rule

A marketplace entry is only an install candidate. It must never bypass manifest
verification, capability review, or the lifecycle gate.
