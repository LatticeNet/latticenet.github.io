# Node Agent

`lattice-node-agent` should normally run as a host binary managed by systemd.

The agent:

- reports metrics and host facts;
- tails assigned logs;
- reports proxy usage snapshots;
- polls for reviewed tasks;
- can apply privileged changes only when explicitly started with execution flags.

Minimal enrollment:

```sh
lattice-agent \
  -server https://lattice.example.com \
  -node-id gmami-jp1 \
  -token '<node-token>'
```

Operations node:

```sh
lattice-agent \
  -server https://lattice.example.com \
  -node-id gmami-jp1 \
  -token '<node-token>' \
  -wg-ip 10.66.0.11/32 \
  -ssh-alerts \
  -log-state-dir /var/lib/lattice-agent/logtail \
  -allow-exec=true \
  -allow-root-exec=true
```

Use `LATTICE_NO_EXEC=1` as a kill switch.

## Updates

The server can create reviewed update plans for the agent. The node does not
fetch `latest` directly. An update policy resolves to:

```txt
target version + HTTPS binary URL + SHA-256 + install path + service name
```

The apply task verifies the digest, runs the candidate with `-version`, backs up
the previous binary, installs atomically, and schedules a delayed restart.
