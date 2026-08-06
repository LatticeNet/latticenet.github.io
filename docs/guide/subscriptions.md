# Subscriptions

Lattice serves proxy subscriptions itself. A subscription lives in the server,
is rendered on demand by the Sub-Store plugin, and is published at a URL that
needs no session — which is the whole point, because the clients that fetch it
cannot log in.

This replaces running a standalone Sub-Store alongside Lattice. The acceptance
test for the migration is one sentence: *you can stop the standalone instance
and every client that subscribed to it keeps working.*

## The share URL

A published subscription has exactly one shape:

```
https://<your-host>/sub/<share-slug>/<token>
```

The slug is yours to choose and is human-readable — it shows up in reverse-proxy
access logs, so it is deliberately not treated as a secret. The token is
32 bytes of randomness and **is** the credential. Anyone holding the full URL can
fetch the subscription.

The dashboard keeps the full URL visible rather than showing it once. You will
need to copy it more than once, and a credential you cannot re-read is a
credential people write down somewhere worse.

::: warning The single-segment form is gone
Earlier builds served `/sub/<token>` for a proxy user's own subscription. That
route no longer exists — the two-segment share is the only shape. If you are
upgrading from a deployment that had proxy users with issued subscription links,
re-publish them as shares before cutting over.
:::

## Where the boundary sits

<SubscriptionPath />

The plugin is asked exactly one question: *given a subscription id, a format,
and a bounded description of the client, produce content.* Everything else —
routing, token comparison, rate limiting, caching, audit, response headers — is
the server's.

This is why the capability is called `subscription:serve` and not something like
`http:serve`. A general "let a plugin answer HTTP" capability would have handed
token checking and rate limiting to plugin code. The narrow capability grants no
route, no port, no listener, no response header, and no access to the share
token.

## Nothing is served on an empty render

A proxy client that receives an empty body with `HTTP 200` treats it as an
authoritative "you have no nodes" and deletes the ones it had. So an empty
render is never served as a success.

This is enforced in three independent places: the plugin refuses to produce
empty content, the server refuses to serve it, and the cache refuses to store
it. Any one of them alone would be a single point of silent destruction.

## What a prober sees

Anything that is not a valid, servable subscription returns the same response: a
bodiless `404` with no request id. That covers an unknown slug, a wrong token, an
unknown format, a rate-limited client, and a render that produced nothing.

The consequences are deliberate:

- You cannot tell an existing share from a missing one.
- You cannot tell whether the request reached the application at all.
- Format is validated **before** the token is looked at, so response timing and
  status do not leak whether a token was real.

The real reason is still recorded in the audit trail. It is withheld from the
client, not from you.

::: tip Edge configuration
If your reverse proxy substitutes its own error page for upstream 4xx responses,
it will replace the bodiless 404 with a branded page that announces a Lattice
server is behind it. On nginx, keep `proxy_intercept_errors off` for the `/sub/`
location.
:::

## Rotating a token

Rotating a share's token invalidates the old URL immediately and drops the
cached output for that share. Clients holding the old URL start getting the same
`404` as any other prober.

::: warning Rotation semantics changed
Rotating a *proxy user's* `sub_token` no longer changes public access, because
the share holds the public credential now. The rotate API returns the share URL
and `rotates_public_access: false` so the response cannot be mistaken for
something it does not do. To cut off public access, rotate the **share**.
:::

## Refresh and the last good snapshot

A subscription with a remote provider is fetched lazily, not on a timer. The
server keeps the last content the plugin successfully fetched, and serves it if
the provider is unreachable at request time.

The snapshot is durable server state, not a cache: a plugin has no durable
storage of its own, and its runtime working directory is deleted when the
runtime stops. The server holds the snapshot as an opaque blob and the plugin
stays stateless.

Snapshots are stored in plaintext by design. They are public subscription
content the provider already served to anyone holding the URL, so encrypting
them per refresh would buy nothing. The provider URL itself never enters the
snapshot — only the response body and its traffic header.

Share tokens, by contrast, **are** sealed at rest, in the same envelope as every
other bearer credential the server holds.

## Processing

Rendering runs the full upstream operator chain, so pipelines built for
Sub-Store behave the same way here.

One difference is deliberate. Upstream silently ignores an operator type it does
not recognise: a typo produces a pipeline that reports success and does nothing.
Lattice validates operator types against a catalogue and refuses the unknown
ones. The catalogue is extracted from the bundled engine by a test rather than
maintained by hand, so an engine bump that renames an operator breaks the build
instead of drifting.

## Migrating from a standalone Sub-Store

The plugin can import from a running Sub-Store instance. Point it at the base
URL, review what it found, and import. Each migrated record keeps a note of
where it came from.

Migrating does not publish anything. Imported subscriptions have no share until
you create one, so the cutover is a decision you make per subscription rather
than a side effect of the import.

## Backup and restore

Subscriptions export to a versioned envelope you can store outside the server
and import into another deployment. The export refuses an unknown or missing
format rather than guessing, so a truncated or hand-edited file fails loudly.

Shares export separately, sorted by id, in their own envelope.

## What the plugin can reach

The Sub-Store plugin declares these capabilities. Each one is inside the signed
manifest, so it cannot acquire another without being re-signed:

| Capability | Why it needs it |
|---|---|
| `subscription:serve` | Produce the body of a subscription the server publishes. |
| `http:egress` | Fetch from a remote subscription provider. |
| `http:operator-target` | Reach a host the operator explicitly designated, for migration and publishing. |
| `kv:read` / `kv:write` | Store subscription definitions and pipelines. |
| `secret:read` / `secret:write` | Hold provider credentials. |
| `rpc:call` | Talk to other plugins, for importing nodes from proxy-core. |

`subscription:serve` is host-risk: it requires a valid signature from a trusted
publisher, and that default is fail-closed. It is not exempt for non-system
plugins.

## See also

- [Sub-Store plugin](/plugins/sub-store) — install, activate, and the interface it exposes
- [Plugin trust](/security/plugin-trust) — how a bundle is verified before it loads
- [Security model](/security/) — where subscriptions sit in the trust boundaries
