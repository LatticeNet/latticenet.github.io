---
layout: home

hero:
  name: LatticeNet
  text: Every privileged change has a visible plan.
  tagline: A self-hosted control plane for small fleets. Nodes dial out, never in. Firewall, DNS, WireGuard, proxy-core and subscriptions all move through the same review gate — and the approval hashes what you were actually shown.
  actions:
    - theme: brand
      text: Deploy the server
      link: /guide/docker-server
    - theme: alt
      text: Read the security model
      link: /security/
---

<section class="home-section">
<div class="home-inner">
<div class="home-head">
<p class="home-kicker">Architecture</p>
<h2 class="home-title">Three layers, one rule: nothing reaches a host without a plan someone approved.</h2>
<p class="home-copy">
The server is the only component that holds state. Nodes run an agent that opens outbound
connections and leases work. Plugins extend the server, but they are verified before they load
and hold no durable storage of their own.
</p>
</div>

<ArchDiagram />
</div>
</section>

<section class="home-section is-alt">
<div class="home-inner">
<div class="home-head">
<p class="home-kicker">First install</p>
<h2 class="home-title">Bind to loopback, terminate TLS at a proxy you trust, then add privileges deliberately.</h2>
</div>

<div class="install-split">
<div>
<p class="home-copy">
The recommended start is a server on <code>127.0.0.1:8088</code> behind a reverse proxy, TOTP on
the first admin, and one node-agent enrolled with host mutation still switched off. Execution is
opt-in per node, so an enrolled agent that nobody has authorised can report but cannot change
anything.
</p>
<p class="home-copy">
State lives in a bind-mounted directory: the image carries none of it. Back up
<code>state.json</code>, the hot store, the audit WAL and <code>master.key</code> together —
losing the key makes stored credentials unrecoverable.
</p>
</div>

<div class="term">
<div class="term-bar">
<span class="term-dot"></span><span class="term-dot"></span><span class="term-dot"></span>
<span class="term-title">lattice — first run</span>
</div>
<pre><code><span class="p">$</span> git clone https://github.com/LatticeNet/lattice.git
<span class="p">$</span> cd lattice/compose
<span class="p">$</span> cp .env.example .env
<span class="p">$</span> $EDITOR .env
<span class="p">$</span> mkdir -p data plugins
<span class="p">$</span> docker compose up -d</code></pre>
<p class="term-note">The bootstrap admin password is printed once, to the container log.</p>
</div>
</div>
</div>
</section>

<section class="home-section">
<div class="home-inner">
<div class="home-head">
<p class="home-kicker">Control loop</p>
<h2 class="home-title">The gate is a hash of the plan you read, not of the plan the server meant.</h2>
<p class="home-copy">
Firewall rules, DNS records, WireGuard topology, proxy-core deployment and agent updates all
travel the same path. Only one stage stops for a human, and it is the same stage every time.
</p>
</div>

<FlowRail />
</div>
</section>

<section class="home-section is-alt">
<div class="home-inner">
<div class="home-head">
<p class="home-kicker">Status</p>
<h2 class="home-title">What is running, at which version, and what is deliberately not built yet.</h2>
<p class="home-copy">
Lattice is early. It is usable for private fleets with a hardened perimeter, and it is honest
about the parts that are not finished — those sit in the same table as the parts that are.
</p>
</div>

<StatusMatrix />
</div>
</section>

<section class="home-section">
<div class="home-inner">
<div class="home-head">
<p class="home-kicker">Plugin trust</p>
<h2 class="home-title">A bundle is refused unless its bytes and its publisher both check out.</h2>
<p class="home-copy">
The capability list lives inside the signed payload. A plugin cannot quietly ask for more
privilege than it was signed for, because asking for more changes the signature.
</p>
</div>

<SigningChain />
</div>
</section>

<section class="home-section is-alt">
<div class="home-inner">
<div class="home-head">
<p class="home-kicker">Where to start</p>
<h2 class="home-title">Three ways in.</h2>
</div>

<div class="entry-grid">
<a class="entry-card" href="/guide/">
<span class="entry-role">Operators</span>
<h3>Run it</h3>
<p>Install the server, enrol agents, enable TOTP, back up state, and switch on host mutation only where you actually need it.</p>
<span class="entry-go">Operator guide</span>
</a>

<a class="entry-card" href="/security/">
<span class="entry-role">Security reviewers</span>
<h3>Audit it</h3>
<p>Trust boundaries, approval hashing, capability gates, probe resistance on the public subscription route, and why an agent never needs an inbound port.</p>
<span class="entry-go">Security model</span>
</a>

<a class="entry-card" href="/developers/">
<span class="entry-role">Developers</span>
<h3>Extend it</h3>
<p>Split-repo layout, versioned SDK contracts, the release tag order that downstream artifacts depend on, and how to author and sign a plugin.</p>
<span class="entry-go">Developer guide</span>
</a>
</div>
</div>
</section>
