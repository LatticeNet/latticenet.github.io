# Release 0.2.2

Server image tag `alpha-0.2.2a6`. The headline is that Lattice now serves proxy
subscriptions itself, and the 0.3 line of the node agent finally has a stable
release.

## Subscriptions became a first-class surface

Lattice publishes subscriptions at `/sub/<share-slug>/<token>` and renders them
through the Sub-Store plugin. A standalone Sub-Store instance is no longer
needed. See [Subscriptions](/guide/subscriptions) for the operational shape.

Two new server state collections back it. `SubscriptionShares` holds the public
URL and its token — the token is sealed at rest, in the same envelope as every
other bearer credential. `SubscriptionSnapshots` holds the last content a
provider successfully served, in plaintext by design, because it is public
content the provider already handed to anyone with the URL.

### New capability: `subscription:serve`

A plugin may produce the **body** of a subscription the server publishes. It
grants no route, no port, no listener, no response header, and no access to the
share token. It is host-risk, system-only, and not exempt for non-system
plugins.

A general `http:serve` capability was considered and rejected: it would have
moved token checking and rate limiting into plugin code.

### Probe resistance

Anything that is not a valid, servable subscription returns a bodiless `404`
with no request id — unknown slug, wrong token, unknown format, rate limited, or
an empty render. Format is validated before the token is examined, so the
response cannot be used as an oracle for whether a token exists.

## Behaviour changes

::: danger Two changes that alter existing behaviour

**`/sub/<token>` is removed.** The two-segment share is the only shape served.
This was affordable at the time it shipped because the reference deployment had
no proxy users, profiles or inbounds; a deployment that issued single-segment
links must re-publish them as shares before upgrading.

**An empty subscription is no longer an empty `200`.** A client that receives an
empty success deletes every node it had, and "the profile is not applied yet"
must not arrive at a client as "you have no nodes". Renders that produce nothing
now leave through the same refusal path as everything else.

**Rotating a proxy user's `sub_token` no longer changes public access.** The
share holds the public credential. The rotate response returns the share URL and
`rotates_public_access: false`.
:::

## Node agent v0.3.3 — first stable of the 0.3 line

The fleet had been running an **untagged 0.3.0 build**. No `v0.3.0`, `v0.3.1` or
`v0.3.2` release ever existed: 0.3.0 was prepared, the stable lane was rewound to
0.2.9, and the 0.3 line continued only as `0.3.3-alpha.N`.

The visible symptom was that agents reported a version matching no release, and
`target_version=latest` resolved to v0.2.9 and refused the downgrade once per
node per evaluation. The refusal was the policy working correctly — the stable
pointer was what was wrong.

`v0.3.3` promotes the exact tree already tagged `v0.3.3-alpha.2`.

::: tip Nothing auto-upgrades
Update policy evaluation only creates pending approval records. An agent
upgrades when an operator approves it, not when a release appears.
:::

## Also in this release

- The SDK's `v0.2.18` stable tag now lives on `main`.
- Plugin bundles refreshed: Sub-Store `0.5.0-alpha.1`, VPN Core `0.8.0-alpha.7`,
  NetGuard and WireGuard `0.1.0-alpha.9`.
- Plugin manifests must declare `scopes` on every interface method. The
  validator asserts rather than defaulting, so a scopeless method is a build
  failure, not a permissive grant.

## Upgrade notes

The state directory is a host bind mount and the image carries none of it. No
migration in this release rewrites existing records — the two new collections are
additive.

Take a backup with the service stopped, so the bolt hot store is consistent, and
verify the archive is readable **before** anything is overwritten. Plugin
lifecycle state is keyed by plugin id and preserved across a version change: an
active plugin stays active after its bundle is replaced.

Release the server before signing plugins that declare `subscription:serve`. A
manifest validator from an earlier release rejects the capability outright, so
the ordering is enforced rather than advisory.
