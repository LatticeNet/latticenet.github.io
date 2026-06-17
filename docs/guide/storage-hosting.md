# Storage Hosting

Lattice has two storage surfaces:

- KV buckets: named key/value buckets for scripts and service integration.
- Static buckets: named object buckets that can serve small static sites.

Both surfaces use the same control model:

```txt
bucket -> host binding -> optional access token
```

## Dashboard workflow

Open Platform -> KV Store or Platform -> Static.

Use the object editor at the top of the page to inspect or update one bucket's
contents. Use Publishing and access below it to manage:

- buckets;
- hostname or IP bindings;
- bucket-scoped access tokens.

The required operator scopes are:

| Surface | Read contents | Write contents | Manage buckets, host bindings, and access tokens |
| --- | --- | --- | --- |
| KV | `kv:read` | `kv:write` | `kv:admin` |
| Static | `static:read` | `static:write` | `static:admin` |

The bootstrap admin user has `*`, which includes all of these scopes.

## Host bindings

A binding maps a hostname or IP to one bucket. The hostname must be routed to
the same `lattice-server` origin that serves the dashboard. With Cloudflare or a
reverse proxy, preserve the original `Host` header so the server can select the
binding.

Example:

```txt
assets.example.com -> lattice-server -> static bucket "site"
```

Static bindings are public read endpoints. A static bucket should define:

- `index.html` for directory and root requests;
- optional `404.html` for not-found responses.

KV bindings require a storage access token. This keeps KV usable for external
clients without making all key/value data public.

## Access tokens

Storage access tokens are separate from dashboard session cookies and operator
API tokens. They are intended for external clients, CI, or deployment scripts.

Each token has:

- surface: `kv` or `static`;
- access: `read`, `write`, or `admin`;
- buckets: one or more bucket names, or `*` for all buckets.

The token secret is shown once. Store it in a secret manager or rotate it if it
is lost.

KV binding examples:

```sh
curl -fsS \
  -H "Authorization: Bearer $LATTICE_STORAGE_TOKEN" \
  https://kv.example.com/site-title
```

```sh
curl -fsS -X PUT \
  -H "Authorization: Bearer $LATTICE_STORAGE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"Lattice"}' \
  https://kv.example.com/site-title
```

## Cloudflare and Pages

The current Static surface is first-party Lattice hosting: the request reaches
`lattice-server`, which serves the object from the bound bucket. Cloudflare can
still sit in front as DNS, TLS, and edge cache, but Cloudflare Pages deployment
automation is not yet a shipped integration.

Use normal Cloudflare cache rules carefully:

- keep `/api/*` bypassed;
- allow static hostnames to cache only when the content lifecycle is clear;
- keep the dashboard host on origin cache headers so deploys do not serve stale
  Vite chunks.

## Failure modes

- A binding returns 404 when the host does not match any enabled binding.
- Static root requests return the configured index document or 404.
- KV host reads and writes return 401 without a valid storage token.
- KV tokens fail with 403 when the access level or bucket list does not allow
  the requested operation.

