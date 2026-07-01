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
git tag -a v0.2.4 -m "lattice-node-agent v0.2.4"
git push origin v0.2.4
```

The release workflow builds Linux and Darwin artifacts, publishes SHA checksums,
and attaches everything to the GitHub Release.

After it completes, get the digest:

```sh
curl -fsSL https://github.com/LatticeNet/lattice-node-agent/releases/download/v0.2.4/SHA256SUMS
```

The normal dashboard flow is official-release mode:

```txt
target version: latest or 0.2.4
binary URL: empty
SHA-256: empty
install path: empty unless the node is intentionally non-standard
service name: lattice-agent.service
```

The server resolves the configured official release repo, maps the target node
OS/arch to an artifact, reads `SHA256SUMS`, and writes the concrete version,
URL, and digest into the approval plan. Custom binary URL + SHA-256 remains
available for emergency or forked artifacts, but both fields must be provided
together and the URL must be HTTPS.

`latest` is an operator intent, not the immutable artifact identity. At plan
time it is resolved to the current `v*` release and the approval carries the
resolved version plus SHA-256. A successful update records the applied version;
the live source of truth is still the next node heartbeat's reported
`agent_version`.

## Compatibility discipline

Ordinary server, dashboard, agent, SDK, and official plugin releases must remain
backward compatible across at least one rolling deployment window.

- Server endpoints may add fields but must not remove or repurpose fields used
  by the current dashboard or agents without a version gate.
- Dashboard changes must tolerate older server responses and older node runtime
  reports.
- Agent changes must tolerate an older server until the next server deploy, and
  server code must tolerate older agents until they report the new runtime
  capability.
- Plugin manifests may add interfaces/views, but existing signed interface names
  and builtin component keys must keep working until a documented migration.
- Breaking behavior requires a release note, a rollback path, and an explicit
  capability/version check rather than relying on "latest".

## SDK order

If server or agent code depends on a new shared model, publish the
`lattice-sdk` tag first. Downstream CI may use workspace replaces, but users who
clone one repository should not need an unpublished SDK tag.

```sh
cd lattice-sdk
NEXT_SDK=v0.2.13 # replace with the next SDK tag after the latest published baseline
git tag -a "$NEXT_SDK" -m "lattice-sdk $NEXT_SDK"
git push origin main
git push origin "$NEXT_SDK"

cd ../lattice-server
GOPROXY=direct GOSUMDB=off GOWORK=off go get "github.com/LatticeNet/lattice-sdk@$NEXT_SDK"

cd ../lattice-node-agent
GOPROXY=direct GOSUMDB=off GOWORK=off go get "github.com/LatticeNet/lattice-sdk@$NEXT_SDK"
```

## Plugin index

The plugin index is static, but the current public catalog remains `draft`
until the top-level index signature is populated. Updating it should not imply
remote install or runner activation. Marketplace install remains blocked until
verification, lifecycle registration, and runner sandbox maturity are all in
place.
