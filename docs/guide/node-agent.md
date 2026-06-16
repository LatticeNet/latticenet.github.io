# Node Agent

`lattice-node-agent` is a host binary, not the main Docker deployment path. It
dials out to the server, reports node state, leases reviewed tasks, and posts
results. It has no inbound listener.

## Download

Linux release artifacts are published from the
[`lattice-node-agent`](https://github.com/LatticeNet/lattice-node-agent)
repository:

```txt
lattice-agent-linux-amd64
lattice-agent-linux-arm64
SHA256SUMS
```

Install the matching architecture:

```sh
VERSION=v0.2.0
ARCH=amd64
curl -fsSLO "https://github.com/LatticeNet/lattice-node-agent/releases/download/${VERSION}/lattice-agent-linux-${ARCH}"
curl -fsSLO "https://github.com/LatticeNet/lattice-node-agent/releases/download/${VERSION}/SHA256SUMS"
grep "lattice-agent-linux-${ARCH}$" SHA256SUMS | sha256sum -c -
sudo install -m 0755 "lattice-agent-linux-${ARCH}" /usr/local/bin/lattice-agent
```

For `arm64`, set `ARCH=arm64`.

## Minimal enrollment

```sh
lattice-agent \
  -server https://lattice.example.com \
  -node-id gmami-jp1 \
  -token '<node-token>'
```

The token is sent as `Authorization: Bearer`, not in the JSON request body.
Remote cleartext `http://` is refused by default.

## systemd service

Create `/etc/systemd/system/lattice-agent.service`:

```ini
[Unit]
Description=Lattice node agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
EnvironmentFile=-/etc/lattice/agent.env
ExecStart=/usr/local/bin/lattice-agent \
  -server ${LATTICE_SERVER_URL} \
  -node-id ${LATTICE_NODE_ID} \
  -token ${LATTICE_NODE_TOKEN} \
  -log-state-dir /var/lib/lattice-agent/logtail
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Create `/etc/lattice/agent.env`:

```sh
LATTICE_SERVER_URL=https://lattice.example.com
LATTICE_NODE_ID=gmami-jp1
LATTICE_NODE_TOKEN=replace-with-node-token
```

Enable it:

```sh
sudo mkdir -p /etc/lattice /var/lib/lattice-agent/logtail
sudo systemctl daemon-reload
sudo systemctl enable --now lattice-agent.service
lattice-agent -version
```

## Privileged operations

Execution is off unless you enable it. Add these only on nodes where reviewed
host mutation is acceptable:

```ini
ExecStart=/usr/local/bin/lattice-agent \
  -server ${LATTICE_SERVER_URL} \
  -node-id ${LATTICE_NODE_ID} \
  -token ${LATTICE_NODE_TOKEN} \
  -log-state-dir /var/lib/lattice-agent/logtail \
  -allow-exec=true \
  -allow-root-exec=true
```

`LATTICE_NO_EXEC=1` is a kill switch and wins over the enable flags.

## Server-controlled updates

Agent updates are reviewed server tasks. The update policy uses:

```txt
target version + HTTPS binary URL + SHA-256 + install path + service name
```

For the default service above:

```txt
target version: 0.2.0
binary URL: https://github.com/LatticeNet/lattice-node-agent/releases/download/v0.2.0/lattice-agent-linux-amd64
SHA-256: value from SHA256SUMS
install path: /usr/local/bin/lattice-agent
service name: lattice-agent.service
```

The server downloads the candidate, verifies the SHA-256, requires
`lattice-agent -version` to match the target version, backs up the old binary,
installs atomically, and restarts `lattice-agent.service` after the task result
is posted.

Keep auto-plan disabled until the release artifact URL and SHA are final.
