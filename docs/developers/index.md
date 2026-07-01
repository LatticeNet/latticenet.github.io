# Developer Guide

LatticeNet is split into small repositories so each deployable surface has its
own release and security boundary.

| Repository | Purpose |
| --- | --- |
| [`lattice`](https://github.com/LatticeNet/lattice) | Umbrella docs, roadmap, compose files, workspace orchestration |
| [`lattice-server`](https://github.com/LatticeNet/lattice-server) | Go control plane, APIs, storage, approvals, task queue |
| [`lattice-node-agent`](https://github.com/LatticeNet/lattice-node-agent) | Outbound node agent and bounded task executor |
| [`lattice-dashboard`](https://github.com/LatticeNet/lattice-dashboard) | Vue static operator console |
| [`lattice-sdk`](https://github.com/LatticeNet/lattice-sdk) | Shared Go model and wire contracts |
| [`lattice-plugin-template`](https://github.com/LatticeNet/lattice-plugin-template) | Plugin authoring kit |
| [`lattice-plugin-index`](https://github.com/LatticeNet/lattice-plugin-index) | Draft plugin index and signing foundation |
| [`Astra`](https://github.com/LatticeNet/Astra) | iOS companion app for phone-first fleet operations |

## Contracts

SDK contract: `github.com/LatticeNet/lattice-sdk v0.2.6`.

When shared models change, cut the SDK tag before downstream repositories depend
on it. CI and Docker builds may use a local workspace replace, but standalone
server and agent builds must be able to resolve the tagged SDK.

## Local workspace

Use the umbrella workspace when working across repos:

```sh
cd lattice
go work init ../lattice-sdk ../lattice-server ../lattice-node-agent ../lattice-plugin-template
make test
make build
```

For focused repositories:

```sh
cd lattice-server
GOWORK=../lattice/go.work go test ./...

cd ../lattice-node-agent
GOWORK=../lattice/go.work go test -race -cover ./...
```

## Release discipline

The release tag order is:

1. `lattice-sdk` when model contracts change.
2. `lattice-server` image through GHCR.
3. `lattice-node-agent` binaries through GitHub Releases.
4. Public docs and plugin index updates.
5. Astra iOS source publication through its repository. TestFlight and signed
   release artifacts remain separate device/distribution work.

Agent update policies consume release binaries by immutable URL and SHA-256
digest. The default operator workflow is now official-release mode: leave the
binary URL and SHA-256 empty, choose `latest` or a concrete version, and let the
server resolve the trusted `LatticeNet/lattice-node-agent` release into a
plan-bound URL and digest. Server container deployments should use a version tag
or digest in production.

Compatibility rule: non-special releases must be rolling-upgrade safe across
server, dashboard, node-agent, SDK, and official plugins. Additive fields,
capability checks, and fallback UI are preferred. Breaking changes require a
documented version gate and rollback path.

## Plugin development

Start with local bundles from
[`lattice-plugin-template`](https://github.com/LatticeNet/lattice-plugin-template).
Keep capabilities narrow, sign host-risk manifests, and document rollback.

Remote marketplace install is intentionally separate from activation. Real
runner work depends on runner sandbox maturity across system, worker, and wasm
tiers. Do not design a plugin that assumes community artifact execution is
available by default.

## Contribution rules

- Keep behavior behind tests before hardening or refactoring.
- Preserve plan-hash approval semantics for host mutation.
- Keep secret-bearing artifacts out of list/read views and audit text.
- Prefer dependency-free stdlib paths unless a dependency has a documented ADR.
- Update public docs when operator behavior changes.
