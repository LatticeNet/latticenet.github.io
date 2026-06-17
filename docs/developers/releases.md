# Release Workflow

Lattice has separate release lanes for the server image, node-agent binary, SDK
contract, docs, and plugin index.

## Server image

`lattice-server` publishes to GHCR from its container workflow.

```txt
ghcr.io/latticenet/lattice-server:latest
ghcr.io/latticenet/lattice-server:alpha
ghcr.io/latticenet/lattice-server:<version>
```

Image publication is tag-driven. The moving `latest` git tag publishes
`:latest`, the moving `alpha` git tag publishes `:alpha`, and stable `v*` tags
publish immutable version tags. There is no `main` image channel. Use a version
tag or digest for unattended production deployments when you do not want a
moving channel.

GitHub Container Registry lists package versions by digest. A tagged manifest
appears with tags such as `latest` or `alpha`; historical untagged digests cannot
be renamed after the fact. The server repository disables buildx provenance/SBOM
attestation manifests for the image workflow and runs `package cleanup` to prune
old `tags: []` container versions. Cleanup protects the architecture child
digests referenced by the active `latest` and `alpha` manifest lists, then
removes stale untagged versions.

Every server image exposes its build metadata through:

```sh
curl -fsS https://lattice.example.com/api/version
```

The dashboard also shows the same information under Settings -> About.

## Node-agent binaries

`lattice-node-agent` publishes Linux binaries from `v*` tags:

```txt
lattice-agent-linux-amd64
lattice-agent-linux-arm64
SHA256SUMS
```

Release tags inject the binary version with:

```txt
-X main.version=$VERSION
```

The binary must report the same value used by the server update policy:

```sh
lattice-agent -version
```

## Create an agent release

```sh
cd lattice-node-agent
git tag v0.2.0
git push origin v0.2.0
```

The release workflow builds both Linux artifacts, publishes SHA checksums, and
attaches everything to the GitHub Release.

After it completes, get the digest:

```sh
curl -fsSL https://github.com/LatticeNet/lattice-node-agent/releases/download/v0.2.0/SHA256SUMS
```

Use the matching row in the dashboard policy:

```txt
target version: 0.2.0
binary URL: https://github.com/LatticeNet/lattice-node-agent/releases/download/v0.2.0/lattice-agent-linux-amd64
SHA-256: value from SHA256SUMS
install path: /usr/local/bin/lattice-agent
service name: lattice-agent.service
```

## SDK order

If server or agent code depends on a new shared model, publish the
`lattice-sdk` tag first. Downstream CI may use workspace replaces, but users who
clone one repository should not need an unpublished SDK tag.

## Plugin index

The plugin index is static and signed. Updating it should not imply remote
install or runner activation. Marketplace install remains blocked until
verification, lifecycle registration, and runner sandbox maturity are all in
place.
