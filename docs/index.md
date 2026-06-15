---
layout: home

hero:
  name: LatticeNet
  text: Security-first fleet control for small distributed infrastructure.
  tagline: Monitoring, node automation, firewall intent, DNS, proxy-core management, and signed plugins behind one reviewed control plane.
  image:
    src: /logo.svg
    alt: LatticeNet
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: Security Model
      link: /security/
    - theme: alt
      text: GitHub
      link: https://github.com/LatticeNet

features:
  - title: Agents dial out
    details: Nodes do not need public inbound management ports. The server owns identity, authorization, task queues, audit, and policy intent.
  - title: Reviewed host mutation
    details: Firewall, DNS, proxy-core, and agent update changes follow plan → approve → apply instead of silent background mutation.
  - title: Plugin trust foundation
    details: Signed manifests, capability scopes, lifecycle records, and a brokered host API are in place before marketplace execution is opened.
  - title: Fleet operations
    details: Metrics, host facts, renewal reminders, log ingestion, geo display, proxy subscriptions, and node-agent lifecycle updates.
---

## Current Status

Lattice is under active early development. The current project is usable as a
local or private-fleet control plane, but public production deployment still
requires careful perimeter hardening, backups, and review of privileged node
tasks.

The recommended first deployment path is:

```txt
Docker/Compose lattice-server + systemd lattice-node-agent
```

Start with the [operator guide](/guide/) and keep the [security model](/security/)
open while enabling privileged features.

## Repositories

- [`lattice`](https://github.com/LatticeNet/lattice): overview, docs, roadmap, compose files.
- [`lattice-server`](https://github.com/LatticeNet/lattice-server): Go control plane.
- [`lattice-node-agent`](https://github.com/LatticeNet/lattice-node-agent): outbound node agent.
- [`lattice-dashboard`](https://github.com/LatticeNet/lattice-dashboard): dependency-light dashboard.
- [`lattice-sdk`](https://github.com/LatticeNet/lattice-sdk): shared Go models and contracts.
- [`lattice-plugin-template`](https://github.com/LatticeNet/lattice-plugin-template): plugin authoring kit.

## Near-Term Direction

1. Containerized server releases through GHCR.
2. Signed plugin index as a read-only marketplace foundation.
3. Release manifest signing for agent/server artifacts.
4. Concrete plugin runners only after isolation, limits, audit, and rollback are
   fully specified.
