# Plugin UI Bridge

`@latticenet/plugin-bridge` is the single bridge client every Lattice plugin UI
consumes. It replaces the per-plugin `bridge.ts` copies, so one reviewed
implementation sets the security bar for all of them.

## Why a package

A plugin UI ships as static assets inside the plugin's signed bundle and runs in
an opaque-origin `sandbox="allow-scripts"` iframe served with
`default-src 'none'; … connect-src 'none'`. The document cannot fetch anything:
its only channel is `postMessage` to the dashboard host, and the host rejects any
service/method the signed manifest does not declare. The bridge client is that
channel — handshake, origin validation, call transport, error mapping — and it
must fail closed everywhere, in every plugin, identically.

## Usage

```ts
import { BridgeClient, canCall } from "@latticenet/plugin-bridge";

const bridge = new BridgeClient({
  window,
  expectedPluginId: "latticenet.example", // your signed manifest id
  expectedRoutes: ["example"],            // your manifest ui.views routes
  idPrefix: "example",                    // optional call-id prefix
});

const init = await bridge.init;
if (canCall(init, "latticenet.example/items", "list")) {
  const { promise, cancel } = bridge.call("latticenet.example/items", "list", {});
  const result = await promise;
}
bridge.resize(document.documentElement.scrollHeight);
```

## Security invariants

All of the following fail closed and are covered by package tests:

- The frame URL fragment must carry `lattice_nonce` (16–128 chars) and a
  `host_origin` that reparses to exactly itself as an absolute http(s) origin.
  Absence, malformed values, and non-exact origins throw `BridgeHandshakeError`
  in the constructor — never a wildcard fallback.
- Inbound messages must match the nonce, the pinned origin exactly, and
  `event.source === window.parent`, in that order.
- `lattice.host.init` must declare protocol `version: "1"`, your plugin id, and
  one of your registered view routes.
- Host design tokens are filtered to a fixed CSS-variable allowlist before they
  touch the document.
- Every frame reload is a new trust boundary: the host re-keys the element and
  mints a fresh nonce.

## Typed errors

`BridgeError` subclasses let UIs distinguish failure classes without string
matching: `BridgeHandshakeError` (invalid channel), `BridgeRemoteError` (host
answered an error; carries the wire `code` when supplied, e.g. scope denials),
`BridgeCancelledError` (`cancel()`), `BridgeTimeoutError` (per-call timeout,
default 15 s), `BridgeDisposedError` (frame torn down).

## Migrating a plugin off its local copy

1. Depend on the exact published version, delete `ui/src/bridge.ts` and its
   test (the package's invariant suite replaces them).
2. Construct with the options object above; the local copy's hard-coded plugin
   id and routes become constructor arguments.
3. Keep the UI's `test` / `typecheck` / `build` / `verify:build` entries green.

The protocol itself is versioned in the Lattice API contract
(`contract/api-contract.md` §1, bridge protocol v1); changes there are contract
changes, not package refactors.

## Releases

Prerelease lane `0.x-alpha.N`, published to GitHub Packages from the
`lattice-plugin-bridge` repository's tag-triggered CI. Consumers pin exact
versions; a prerelease never becomes the registry's `latest`.
