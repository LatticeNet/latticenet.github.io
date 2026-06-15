# Plugin Trust

Lattice plugins are capability-based.

Current foundation:

- manifest validation;
- artifact SHA-256 digest pinning;
- Ed25519 publisher signatures for host-risk plugins;
- trusted publisher policy;
- startup loader from `LATTICE_PLUGIN_DIR`;
- lifecycle state in server storage;
- capability-scoped broker;
- audited host API calls.

Current limitation:

```txt
plugin artifact code does not execute by default
```

The runtime manager can arm a noop runner and report lifecycle health. Concrete
system, worker, and wasm runners are future work.

## Bundle Layout

```txt
plugins/
  example.plugin/
    manifest.json
    artifact
```

The manifest may not point the loader at arbitrary paths. The artifact filename
is fixed and digest-pinned.

## Marketplace Policy

The first marketplace should be a read-only signed index. Installation should
still require:

1. fetch manifest and artifact;
2. verify digest and publisher signature;
3. show capability risks;
4. approve install;
5. register lifecycle state.

Community host-risk plugins should remain blocked by default.
