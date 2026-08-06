<script setup lang="ts">
import { ref, computed } from 'vue'
import DiagramFrame from './DiagramFrame.vue'

/**
 * The three-layer architecture, switchable.
 *
 * All three views share one grammar so a reader learns it once:
 *   solid teal edge   — a reviewed path the product actively guarantees
 *   plain edge        — ordinary traffic
 *   dashed rule       — a trust boundary; crossing it needs a named mechanism
 *   dotted grey edge  — something deliberately NOT wired, drawn so the absence
 *                       is visible instead of merely unmentioned
 *
 * Boxes and edges are data rather than hand-placed SVG: it keeps the three
 * views from drifting into three different visual languages.
 */

type Kind = 'core' | 'edge' | 'node' | 'store' | 'off'

type Box = {
  id: string
  x: number
  y: number
  w: number
  h: number
  title: string
  sub?: string
  kind: Kind
}

type Edge = {
  from: string
  to: string
  label?: string
  style?: 'plain' | 'trusted' | 'absent'
  /** Route the edge under the boxes instead of straight between centres. */
  dip?: number
}

type View = {
  id: string
  tab: string
  caption: string
  boxes: Box[]
  edges: Edge[]
  /** Vertical dashed trust boundary at this x, with a label. */
  boundary?: { x: number; label: string }
}

const VIEWS: View[] = [
  {
    id: 'control',
    tab: 'Control plane',
    caption:
      'The server is a container with a bind-mounted state directory. It listens on loopback and is reached through a reverse proxy that terminates TLS — the only surface deliberately exposed without a session is the public subscription route.',
    boundary: { x: 322, label: 'TLS terminates here' },
    boxes: [
      { id: 'client', x: 24, y: 132, w: 132, h: 62, title: 'Operator', sub: 'browser session', kind: 'edge' },
      { id: 'sub', x: 24, y: 236, w: 132, h: 62, title: 'Proxy client', sub: 'no session', kind: 'edge' },
      { id: 'proxy', x: 196, y: 178, w: 108, h: 74, title: 'Reverse proxy', sub: 'TLS', kind: 'edge' },
      { id: 'server', x: 372, y: 150, w: 168, h: 96, title: 'lattice-server', sub: '127.0.0.1:8088', kind: 'core' },
      { id: 'dash', x: 372, y: 44, w: 168, h: 58, title: 'Dashboard', sub: 'served by the server', kind: 'core' },
      { id: 'state', x: 606, y: 30, w: 176, h: 62, title: 'state.json', sub: 'sealed at rest', kind: 'store' },
      { id: 'hot', x: 606, y: 110, w: 176, h: 62, title: 'state-hot.db', sub: 'record-level writes', kind: 'store' },
      { id: 'wal', x: 606, y: 190, w: 176, h: 62, title: 'audit WAL', sub: 'append-only trail', kind: 'store' },
      { id: 'key', x: 606, y: 270, w: 176, h: 62, title: 'master.key', sub: 'back this up', kind: 'store' },
    ],
    edges: [
      { from: 'client', to: 'proxy' },
      // Short on purpose: the full share shape does not fit the gap between
      // these two boxes and gets overdrawn by them. The subscription page
      // carries the exact form.
      { from: 'sub', to: 'proxy', label: '/sub/…' },
      { from: 'proxy', to: 'server', style: 'trusted' },
      { from: 'server', to: 'dash' },
      { from: 'server', to: 'state' },
      { from: 'server', to: 'hot' },
      { from: 'server', to: 'wal' },
      { from: 'server', to: 'key' },
    ],
  },
  {
    id: 'nodes',
    tab: 'Nodes',
    caption:
      'The agent opens outbound HTTPS and leases bounded tasks. Nothing listens for management traffic on the node, so a change reaches a host only after an operator approved the hash of the plan they were shown.',
    boundary: { x: 388, label: 'no inbound management port' },
    boxes: [
      { id: 'server', x: 24, y: 148, w: 168, h: 96, title: 'lattice-server', sub: 'holds the queue', kind: 'core' },
      { id: 'plan', x: 24, y: 36, w: 168, h: 74, title: 'Rendered plan', sub: 'secret-safe preview', kind: 'core' },
      { id: 'approve', x: 224, y: 36, w: 136, h: 74, title: 'Approval', sub: 'SHA-256 of the plan', kind: 'core' },
      { id: 'agent', x: 470, y: 148, w: 172, h: 96, title: 'lattice-agent', sub: 'systemd unit', kind: 'node' },
      { id: 'apply', x: 690, y: 46, w: 168, h: 74, title: 'Apply', sub: 'validate, then mutate', kind: 'node' },
      { id: 'report', x: 690, y: 158, w: 168, h: 74, title: 'Report', sub: 'result + actor trail', kind: 'node' },
      { id: 'inbound', x: 470, y: 282, w: 172, h: 62, title: 'Inbound port', sub: 'never opened', kind: 'off' },
    ],
    edges: [
      { from: 'plan', to: 'approve', style: 'trusted' },
      { from: 'approve', to: 'server', style: 'trusted' },
      { from: 'agent', to: 'server', label: 'leases a task (outbound)', style: 'trusted' },
      { from: 'agent', to: 'apply' },
      { from: 'apply', to: 'report' },
      { from: 'report', to: 'agent' },
      { from: 'inbound', to: 'agent', style: 'absent' },
    ],
  },
  {
    id: 'plugins',
    tab: 'Plugins',
    caption:
      'A bundle is refused unless its digest matches the manifest and the manifest is signed by a publisher the operator trusts. Capabilities are granted from the manifest at load time, and the runtime forks per call — a plugin holds no long-lived process and no durable storage of its own.',
    boundary: { x: 470, label: 'host boundary' },
    boxes: [
      { id: 'bundle', x: 24, y: 40, w: 160, h: 74, title: 'Signed bundle', sub: 'manifest + artifact', kind: 'edge' },
      { id: 'digest', x: 24, y: 150, w: 160, h: 66, title: 'Digest check', sub: 'artifact vs manifest', kind: 'core' },
      { id: 'trust', x: 24, y: 252, w: 160, h: 66, title: 'Publisher trust', sub: 'operator-held keys', kind: 'core' },
      { id: 'loader', x: 248, y: 148, w: 168, h: 96, title: 'Loader', sub: 'verify, then register', kind: 'core' },
      { id: 'caps', x: 248, y: 36, w: 168, h: 74, title: 'Capabilities', sub: 'granted from manifest', kind: 'core' },
      { id: 'runner', x: 540, y: 148, w: 176, h: 96, title: 'Runtime', sub: 'fork per call', kind: 'node' },
      { id: 'host', x: 540, y: 36, w: 176, h: 74, title: 'Host methods', sub: 'kv, http, secrets', kind: 'node' },
      { id: 'store', x: 762, y: 156, w: 112, h: 80, title: 'No durable', sub: 'store of its own', kind: 'off' },
    ],
    edges: [
      { from: 'bundle', to: 'loader' },
      { from: 'digest', to: 'loader', style: 'trusted' },
      { from: 'trust', to: 'loader', style: 'trusted' },
      { from: 'caps', to: 'loader', style: 'trusted' },
      { from: 'loader', to: 'runner', style: 'trusted' },
      { from: 'runner', to: 'host' },
      { from: 'runner', to: 'store', style: 'absent' },
    ],
  },
]

const active = ref(VIEWS[0].id)
const view = computed(() => VIEWS.find((v) => v.id === active.value) ?? VIEWS[0])

const byId = computed(() => {
  const map: Record<string, Box> = {}
  for (const b of view.value.boxes) map[b.id] = b
  return map
})

/** Edge endpoints clipped to the box borders so lines never sit under a label. */
function path(e: Edge) {
  const a = byId.value[e.from]
  const b = byId.value[e.to]
  if (!a || !b) return ''
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
  const p1 = clip(a, ac, bc)
  const p2 = clip(b, bc, ac)
  return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`
}

/** Walk from a box centre toward a target and stop at the rectangle border. */
function clip(box: Box, from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (dx === 0 && dy === 0) return from
  const hw = box.w / 2 + 6
  const hh = box.h / 2 + 6
  const scale = Math.min(
    dx === 0 ? Infinity : hw / Math.abs(dx),
    dy === 0 ? Infinity : hh / Math.abs(dy),
  )
  return { x: from.x + dx * scale, y: from.y + dy * scale }
}

/**
 * Label position: the midpoint of the VISIBLE segment, not of the centre line.
 *
 * Between two boxes of different sizes the centre-line midpoint can land inside
 * one of them, which is how the `/sub/<slug>/<token>` label ended up printed
 * across a box. Averaging the clipped endpoints keeps the label in the gap the
 * line actually crosses.
 */
function midpoint(e: Edge) {
  const a = byId.value[e.from]
  const b = byId.value[e.to]
  if (!a || !b) return { x: 0, y: 0 }
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
  const p1 = clip(a, ac, bc)
  const p2 = clip(b, bc, ac)
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
}
</script>

<template>
  <DiagramFrame label="Architecture" :caption="view.caption">
    <template #controls>
      <div class="arch-tabs" role="tablist" aria-label="Architecture layer">
        <button
          v-for="v in VIEWS"
          :key="v.id"
          type="button"
          role="tab"
          :aria-selected="active === v.id"
          :class="['arch-tab', { 'is-active': active === v.id }]"
          @click="active = v.id"
        >
          {{ v.tab }}
        </button>
      </div>
    </template>

    <svg class="arch-svg" viewBox="0 0 890 356" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-text-3)" />
        </marker>
        <marker id="arch-arrow-trusted" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--vp-c-brand-1)" />
        </marker>
      </defs>

      <!-- Trust boundary -->
      <g v-if="view.boundary">
        <line
          :x1="view.boundary.x"
          y1="8"
          :x2="view.boundary.x"
          y2="348"
          stroke="var(--vp-c-text-3)"
          stroke-width="1.2"
          stroke-dasharray="5 5"
          stroke-opacity="0.55"
        />
        <text
          :x="view.boundary.x + 8"
          y="346"
          class="arch-boundary-label"
        >{{ view.boundary.label }}</text>
      </g>

      <!-- Edges -->
      <g>
        <g v-for="(e, i) in view.edges" :key="`e${i}`">
          <path
            :d="path(e)"
            fill="none"
            :stroke="e.style === 'trusted' ? 'var(--vp-c-brand-1)' : 'var(--vp-c-text-3)'"
            :stroke-width="e.style === 'trusted' ? 1.8 : 1.2"
            :stroke-opacity="e.style === 'absent' ? 0.35 : e.style === 'trusted' ? 0.95 : 0.5"
            :stroke-dasharray="e.style === 'absent' ? '2 6' : undefined"
            :marker-end="e.style === 'absent' ? undefined : e.style === 'trusted' ? 'url(#arch-arrow-trusted)' : 'url(#arch-arrow)'"
          />
          <text
            v-if="e.label"
            :x="midpoint(e).x"
            :y="midpoint(e).y - 8"
            text-anchor="middle"
            class="arch-edge-label"
          >{{ e.label }}</text>
        </g>
      </g>

      <!-- Boxes -->
      <g>
        <g v-for="b in view.boxes" :key="b.id" :class="['arch-box', `is-${b.kind}`]">
          <rect :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="10" />
          <text :x="b.x + b.w / 2" :y="b.sub ? b.y + b.h / 2 - 4 : b.y + b.h / 2 + 5" text-anchor="middle" class="arch-title">
            {{ b.title }}
          </text>
          <text v-if="b.sub" :x="b.x + b.w / 2" :y="b.y + b.h / 2 + 15" text-anchor="middle" class="arch-sub">
            {{ b.sub }}
          </text>
        </g>
      </g>
    </svg>

    <div class="arch-legend">
      <span class="lg lg-trusted">reviewed path</span>
      <span class="lg lg-plain">ordinary traffic</span>
      <span class="lg lg-boundary">trust boundary</span>
      <span class="lg lg-absent">deliberately not wired</span>
    </div>
  </DiagramFrame>
</template>

<style scoped>
.arch-tabs {
  display: flex;
  gap: 4px;
}

.arch-tab {
  padding: 5px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
}

.arch-tab:hover {
  color: var(--vp-c-text-1);
}

.arch-tab.is-active {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 40%, transparent);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.arch-svg {
  display: block;
  width: 100%;
  min-width: 720px;
}

.arch-box rect {
  fill: var(--vp-c-bg-soft);
  stroke: var(--vp-c-border);
  stroke-width: 1.2;
}

.arch-box.is-core rect {
  fill: color-mix(in srgb, var(--vp-c-brand-1) 9%, var(--vp-c-bg-elv));
  stroke: color-mix(in srgb, var(--vp-c-brand-1) 42%, var(--vp-c-border));
}

.arch-box.is-node rect {
  fill: var(--vp-c-bg-elv);
  stroke: var(--vp-c-border);
}

.arch-box.is-store rect {
  fill: var(--vp-c-bg-soft);
  stroke-dasharray: 3 3;
}

/* Something the product deliberately does not do. Drawn, not omitted. */
.arch-box.is-off rect {
  fill: transparent;
  stroke: var(--vp-c-text-3);
  stroke-opacity: 0.4;
  stroke-dasharray: 4 4;
}

.arch-title {
  fill: var(--vp-c-text-1);
  font-size: 13.5px;
  font-weight: 650;
}

.arch-box.is-off .arch-title {
  fill: var(--vp-c-text-3);
}

.arch-sub {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
}

.arch-edge-label {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
}

.arch-boundary-label {
  fill: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
}

.arch-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 18px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.lg {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.lg::before {
  content: '';
  width: 20px;
  height: 0;
  border-top-width: 2px;
  border-top-style: solid;
}

.lg-trusted::before {
  border-color: var(--vp-c-brand-1);
}

.lg-plain::before {
  border-color: var(--vp-c-text-3);
  border-top-width: 1.5px;
}

.lg-boundary::before {
  border-color: var(--vp-c-text-3);
  border-top-style: dashed;
}

.lg-absent::before {
  border-color: var(--vp-c-text-3);
  border-top-style: dotted;
}
</style>
