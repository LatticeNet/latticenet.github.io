<script setup lang="ts">
import { ref, onMounted } from "vue";

// A crisp, theme-aware lattice mesh rendered as pure SVG — replaces the baked
// low-res hero bitmap. The node field is generated deterministically (no random,
// no bitmap) so it is sharp at any DPI and re-themes via CSS custom properties
// (--mesh-*) set in custom.css. Motion is opt-out under prefers-reduced-motion.

const VW = 1200;
const VH = 640;
const COLS = 8;
const ROWS = 5;

interface Node {
  x: number;
  y: number;
  r: number;
  c: number;
  i: number;
  hub: boolean;
}

const nodes: Node[] = [];
for (let r = 0; r < ROWS; r += 1) {
  for (let c = 0; c < COLS; c += 1) {
    const i = r * COLS + c;
    // Deterministic sine jitter keeps the grid organic without randomness.
    const jx = Math.sin((r * 3.1 + c * 1.7) * 1.3) * 26;
    const jy = Math.cos((c * 2.2 + r * 1.1) * 1.15) * 22;
    nodes.push({
      i,
      r,
      c,
      x: 70 + c * ((VW - 140) / (COLS - 1)) + jx,
      y: 80 + r * ((VH - 200) / (ROWS - 1)) + jy,
      hub: (r * COLS + c) % 6 === 2,
    });
  }
}

const at = (r: number, c: number) =>
  nodes.find((n) => n.r === r && n.c === c);

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  key: string;
}
const edges: Edge[] = [];
for (const n of nodes) {
  const right = at(n.r, n.c + 1);
  const down = at(n.r + 1, n.c);
  const diag = n.i % 3 === 0 ? at(n.r + 1, n.c + 1) : undefined;
  for (const m of [right, down, diag]) {
    if (m) edges.push({ x1: n.x, y1: n.y, x2: m.x, y2: m.y, key: `${n.i}-${m.i}` });
  }
}

// A few edges carry a travelling "data pulse" for life. Picked by index so the
// arrangement is stable across reloads.
const pulseEdges = edges.filter((_, idx) => idx % 11 === 4).slice(0, 5);

const reduced = ref(false);
onMounted(() => {
  reduced.value =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
});
</script>

<template>
  <div class="hero-backdrop" aria-hidden="true">
    <svg
      class="hero-mesh"
      :viewBox="`0 0 ${VW} ${VH}`"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="mesh-glow" cx="62%" cy="40%" r="62%">
          <stop offset="0%" stop-color="var(--mesh-glow)" stop-opacity="0.9" />
          <stop offset="55%" stop-color="var(--mesh-glow)" stop-opacity="0.18" />
          <stop offset="100%" stop-color="var(--mesh-glow)" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="mesh-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--mesh-line)" stop-opacity="0.05" />
          <stop offset="50%" stop-color="var(--mesh-line)" stop-opacity="0.55" />
          <stop offset="100%" stop-color="var(--mesh-line)" stop-opacity="0.05" />
        </linearGradient>
        <filter id="mesh-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#mesh-glow)" />

      <g class="mesh-edges" stroke="url(#mesh-edge)" stroke-width="1">
        <line
          v-for="e in edges"
          :key="e.key"
          :x1="e.x1"
          :y1="e.y1"
          :x2="e.x2"
          :y2="e.y2"
        />
      </g>

      <g class="mesh-nodes">
        <template v-for="n in nodes" :key="n.i">
          <circle
            v-if="n.hub"
            class="mesh-ring"
            :class="{ still: reduced }"
            :cx="n.x"
            :cy="n.y"
            r="11"
            :style="{ animationDelay: `${(n.i % 5) * 0.7}s` }"
          />
          <circle
            :cx="n.x"
            :cy="n.y"
            :r="n.hub ? 4.5 : 2.4"
            :class="n.hub ? 'mesh-dot hub' : 'mesh-dot'"
          />
        </template>
      </g>

      <g v-if="!reduced" class="mesh-pulses">
        <circle
          v-for="(e, idx) in pulseEdges"
          :key="`p-${e.key}`"
          r="3"
          class="mesh-pulse"
        >
          <animateMotion
            :dur="`${3.6 + (idx % 3) * 1.1}s`"
            :begin="`${idx * 0.8}s`"
            repeatCount="indefinite"
            :path="`M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`"
          />
        </circle>
      </g>
    </svg>
    <div class="hero-grain" />
  </div>
</template>

<style scoped>
.hero-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.hero-mesh {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mesh-dot {
  fill: var(--mesh-node);
}

.mesh-dot.hub {
  fill: var(--mesh-accent);
  filter: drop-shadow(0 0 6px var(--mesh-accent));
}

.mesh-ring {
  fill: none;
  stroke: var(--mesh-accent);
  stroke-width: 1.2;
  opacity: 0.5;
  transform-box: fill-box;
  transform-origin: center;
  animation: mesh-pulse-ring 4.5s ease-out infinite;
}

.mesh-ring.still {
  animation: none;
  opacity: 0.35;
}

.mesh-pulse {
  fill: var(--mesh-accent);
  filter: drop-shadow(0 0 5px var(--mesh-accent));
}

@keyframes mesh-pulse-ring {
  0% {
    transform: scale(0.7);
    opacity: 0.55;
  }
  70% {
    transform: scale(2.4);
    opacity: 0;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

/* Soft animated drift on the whole mesh — disabled for reduced motion. */
.hero-mesh {
  animation: mesh-drift 26s ease-in-out infinite alternate;
}

@keyframes mesh-drift {
  from {
    transform: translate3d(0, 0, 0) scale(1.02);
  }
  to {
    transform: translate3d(-18px, -10px, 0) scale(1.05);
  }
}

.hero-grain {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at center,
    var(--mesh-grain) 0.5px,
    transparent 0.6px
  );
  background-size: 4px 4px;
  opacity: 0.4;
  mix-blend-mode: overlay;
}

@media (prefers-reduced-motion: reduce) {
  .hero-mesh,
  .mesh-ring {
    animation: none;
  }
}
</style>
