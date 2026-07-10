---
layout: home

hero:
  name: LatticeNet
  text: Reviewed control plane for self-hosted fleets.
  tagline: Monitor nodes, plan privileged changes, deploy DNS and proxy-core config, publish signed plugin releases, and keep every host mutation behind an approval trail.
  actions:
    - theme: brand
      text: Start with Docker
      link: /guide/docker-server
    - theme: alt
      text: Read the security model
      link: /security/
    - theme: alt
      text: Browse GitHub
      link: https://github.com/LatticeNet
---

<section class="home-section">
<div class="home-inner">
<p class="home-kicker">Deployment shape</p>
<h2 class="home-title">Docker server first. systemd node-agent on each host.</h2>
<p class="home-copy">
Lattice is built for small private infrastructure where the control plane should stay boring:
run the server as a container, keep agents as host binaries, and let nodes dial out instead of
exposing management ports.
</p>
<div class="path-grid">
<article class="path-card">
<h3>Server</h3>
<p>Use the GHCR image behind HTTPS, with durable state, audit WAL, logs, plugin bundles, and master key backed up together.</p>
<a href="/guide/docker-server">Docker guide</a>
</article>
<article class="path-card">
<h3>Node agent</h3>
<p>Install the outbound agent as a systemd service. Execution stays off until an operator explicitly enables reviewed tasks.</p>
<a href="/guide/node-agent">Agent guide</a>
</article>
<article class="path-card">
<h3>Updates</h3>
<p>GitHub Release binaries and SHA256SUMS feed server-reviewed agent update policies. Nothing follows a mutable latest pointer.</p>
<a href="/security/agent-updates">Update model</a>
</article>
</div>
</div>
</section>

<section class="home-section">
<div class="home-inner split-panel">
<div>
<p class="home-kicker">First install</p>
<h2 class="home-title">Get a private control plane online, then add privileges deliberately.</h2>
<p class="home-copy">
The recommended start is a local server bound to <code>127.0.0.1:8088</code>, a trusted reverse proxy, TOTP for the first admin, and one node-agent enrolled without host mutation.
</p>
</div>
<div class="command-panel">
<pre><code>git clone https://github.com/LatticeNet/lattice.git
cd lattice/compose
cp .env.example .env
$EDITOR .env
mkdir -p data plugins
docker compose up -d</code></pre>
</div>
</div>
</section>

<section class="home-section">
<div class="home-inner">
<p class="home-kicker">Control loop</p>
<h2 class="home-title">Every dangerous change has a visible plan before it becomes a task.</h2>
<p class="home-copy">
Firewall, DNS, proxy-core deployment, and agent updates share the same review shape:
operators inspect the rendered intent, approve the visible plan hash, and the node reports the result back through the outbound task channel.
</p>
<div class="flow" aria-label="Lattice operation flow">
<div class="flow-step"><strong>Configure</strong><span>Set intent in the dashboard or API.</span></div>
<div class="flow-step"><strong>Render</strong><span>Server creates a secret-safe review plan.</span></div>
<div class="flow-step"><strong>Approve</strong><span>Dashboard sends the SHA-256 of the visible plan.</span></div>
<div class="flow-step"><strong>Queue</strong><span>Agent leases a bounded task over outbound HTTPS.</span></div>
<div class="flow-step"><strong>Apply</strong><span>Node validates artifacts before mutation.</span></div>
<div class="flow-step"><strong>Audit</strong><span>Result and actor trail stay in the server log.</span></div>
</div>
</div>
</section>

<section class="home-section">
<div class="home-inner">
<p class="home-kicker">What is live now</p>
<h2 class="home-title">Fleet operations, network policy, DNS, proxy-core, logs, and plugin foundations.</h2>
<div class="capability-grid">
<article class="capability-card">
<h3>Inventory and monitoring</h3>
<p>Metrics, host facts, machine cost and renewal reminders, fleet map, logs, SSH alerts, and node token lifecycle.</p>
</article>
<article class="capability-card">
<h3>Network and DNS</h3>
<p>Reviewed nft policy, Network Guard, self-host DNS apply/publish, Geo-Routing preview, and rollback-protected apply scripts.</p>
</article>
<article class="capability-card">
<h3>Proxy-core operations</h3>
<p>VLESS + REALITY profile management, subscriptions, usage reporting, quota/expiry notifications, and collector health.</p>
</article>
<article class="capability-card">
<h3>Agent lifecycle</h3>
<p>Manual update plans and auto-plan pending approvals for pinned HTTPS artifacts, SHA-256 digests, and target versions.</p>
</article>
<article class="capability-card">
<h3>Plugin trust</h3>
<p>Signed manifests, digest pinning, trusted publisher policy, validated lifecycle, active-only UI contributions, and a bounded runner for trusted system plugins.</p>
</article>
<article class="capability-card">
<h3>Public ecosystem</h3>
<p>GHCR server image, GitHub Release binaries for the agent, GitHub Pages docs, and a Draft plugin index roadmap.</p>
</article>
</div>
<div class="status-band">
Lattice is early and usable for private fleets with careful perimeter hardening. Arbitrary community plugin execution is not enabled; marketplace work starts with a read-only draft index and signed release manifests.
</div>
</div>
</section>

<section class="home-section">
<div class="home-inner">
<p class="home-kicker">Choose your path</p>
<h2 class="home-title">Operators get deployment runbooks. Developers get release contracts and extension boundaries.</h2>
<div class="repo-grid">
<article class="repo-card">
<h3>Operators</h3>
<p>Install the server, enroll agents, enable TOTP, back up state, and turn on host mutation only where needed.</p>
<a href="/guide/">Read the operator guide</a>
</article>
<article class="repo-card">
<h3>Security reviewers</h3>
<p>Understand trust boundaries, approval hashing, plugin capability gates, and why agents never need inbound management ports.</p>
<a href="/security/">Review the model</a>
</article>
<article class="repo-card">
<h3>Plugin authors</h3>
<p>Start with local bundles and signed manifests. Publisher verification, operator activation, and node apply remain separate safety gates.</p>
<a href="/plugins/lifecycle">Understand plugin lifecycle</a>
</article>
<article class="repo-card">
<h3>Contributors</h3>
<p>Work across the split repos, keep SDK contracts versioned, and follow release tag order before cutting downstream artifacts.</p>
<a href="/developers/">Developer guide</a>
</article>
<article class="repo-card">
<h3>Release managers</h3>
<p>Publish server images through GHCR and node-agent binaries through GitHub Releases with SHA256SUMS.</p>
<a href="/developers/releases">Release workflow</a>
</article>
<article class="repo-card">
<h3>Roadmap readers</h3>
<p>Track what is implemented, what is intentionally blocked, and what must mature before remote marketplace install or community runners.</p>
<a href="/ecosystem/roadmap">Roadmap</a>
</article>
</div>
</div>
</section>
