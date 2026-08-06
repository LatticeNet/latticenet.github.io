# Sub-Store

`latticenet.sub-store` — a native subscription platform: store subscriptions,
fetch them from providers, run them through a processing pipeline, and publish
the result at a public URL the server owns.

This is the plugin that lets you shut down a standalone Sub-Store instance. For
what it does operationally, see [Subscriptions](/guide/subscriptions); this page
covers the plugin itself.

## Capabilities

Declared in the signed manifest, so the list cannot change without re-signing:

```
rpc:call            http:egress          http:operator-target
kv:read             kv:write             secret:read
secret:write        subscription:serve
```

`subscription:serve` is **host-risk**. It requires a valid signature from a
publisher in your trust file, it is system-only, and it is not exempt for
non-system plugins. What it grants is narrow: produce the body of a subscription
the server publishes. It grants no route, no port, no listener, no response
header, and no access to the share token.

`http:egress` is also host-risk — arbitrary outbound HTTP is a powerful
primitive — and is broker-guarded rather than handed to the plugin raw.

## Interfaces

Three services. Method names are wire contract.

### `latticenet.sub-store/subscription`

The design-16 surface.

| Method | Effect | Scopes |
|---|---|---|
| `fetch` | read | `substore:read` |
| `render` | read | `substore:read` |
| `operators` | read | `substore:read` |
| `preview` | read | `substore:read` |
| `list` | read | `substore:read` |
| `export` | read | `substore:read` |
| `get_settings` | read | `substore:read` |
| `migrate` | write | `substore:admin` |
| `import` | write | `substore:admin` |
| `save_settings` | write | `substore:admin` |
| `publish` | write | `substore:admin` |

`migrate` and `publish` additionally declare `operator_target_fields`, because
both hand the host a URL the operator designated. That is what keeps
`http:operator-target` from becoming general outbound access.

### `latticenet.sub-store/engine`

`convert`, `transform_response`, `save_pipeline`, `get_pipeline`,
`list_pipelines`, `delete_pipeline`, `run_pipeline`.

The conversion engine runs the upstream Sub-Store `proxy-utils` bundle inside an
embedded JavaScript engine, so conversions and operator chains behave the way
they do upstream.

### `latticenet.sub-store/import`

`status`, `preview`, `import`, `endpoint_status`, `save_endpoint`,
`clear_endpoint` — importing nodes from proxy-core and talking to a standalone
Sub-Store endpoint during migration.

## Storage

The plugin keeps subscription definitions in a single KV document rather than
one key per record, because the host exposes no key listing or deletion. That
shape has bounds, and they are enforced by the plugin rather than discovered in
production:

- at most 256 subscription records
- at most 1 MB for the whole document
- at most 256 KB of inline content per record

The host accepts a KV value of any size and KV rides the full-rewrite state
path, so the plugin bounds itself instead of waiting for a host-side fix.

Anything durable that is not a definition — most importantly the last good
provider snapshot — is held by the **server**, not the plugin. A plugin's
runtime working directory is deleted when the runtime stops, and it has no other
durable storage. See [Subscriptions](/guide/subscriptions#refresh-and-the-last-good-snapshot).

## Install

Download the bundle and manifest from the release, verify the digest, and place
them in your plugin directory as `manifest.json` and `artifact`:

```sh
mkdir -p /path/to/plugins/latticenet.sub-store
# fetch the release assets, then:
sha256sum /path/to/plugins/latticenet.sub-store/artifact
# must equal bundle.digest_sha256 in manifest.json
```

Restart the server. The loader reports how many bundles it accepted and how many
it refused; a refusal is audited with a reason.

::: warning Server version floor
This plugin declares `subscription:serve`. A server released before that
capability existed rejects the manifest outright. Release the server first, then
the plugin — the ordering is enforced by the manifest validator, not by
convention.
:::

## Activation

Loading a plugin verifies it. It does not switch it on. An operator activates it
explicitly, and only then does the server bind its host access and start its
runtime. A plugin that is loaded but not active contributes no UI and answers no
calls.
