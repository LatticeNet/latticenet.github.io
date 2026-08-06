<script setup lang="ts">
import { computed } from 'vue'

/**
 * Hero backdrop: agents dialling OUT to a control plane.
 *
 * This replaces a flat random mesh, which was decorative but said nothing. The
 * product's whole security posture is that nodes open outbound connections and
 * never expose an inbound management port, so the motif animates traffic
 * travelling from the nodes INWARD to the hub. Direction is the message; if the
 * pulses ever run outward the drawing is lying about the architecture.
 *
 * Geometry is seeded, not random: the same layout every load, so the hero does
 * not shuffle between navigations and screenshots stay comparable.
 */

const W = 1600
const H = 900
// Hub sits right of centre — hero copy occupies the left third.
const HUB = { x: 1105, y: 430 }

/** Deterministic PRNG (mulberry32). Keeps the layout stable across loads. */
function seeded(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Node = {
  x: number
  y: number
  r: number
  /** Distance-scaled travel time, so nearer nodes report back sooner. */
  dur: number
  delay: number
  /** Depth band 0..2 — drives opacity so the field has real depth. */
  band: number
}

const nodes = computed<Node[]>(() => {
  const rnd = seeded(20260805)
  const out: Node[] = []
  // Three rings of decreasing density; the innermost band reads as "enrolled".
  const rings = [
    { count: 7, min: 210, max: 330, band: 0 },
    { count: 11, min: 360, max: 620, band: 1 },
    { count: 13, min: 640, max: 1020, band: 2 },
  ]
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      // Even angular spread plus jitter — avoids the clumping pure random gives.
      const angle = (i / ring.count) * Math.PI * 2 + (rnd() - 0.5) * 0.55
      const dist = ring.min + rnd() * (ring.max - ring.min)
      const x = HUB.x + Math.cos(angle) * dist
      const y = HUB.y + Math.sin(angle) * dist * 0.62
      if (x < -80 || x > W + 80 || y < -60 || y > H + 60) continue
      out.push({
        x,
        y,
        r: 2.6 + (2 - ring.band) * 0.9 + rnd() * 1.1,
        dur: 3.4 + (dist / 1020) * 4.2,
        delay: rnd() * 6,
        band: ring.band,
      })
    }
  }
  return out
})

const bandOpacity = [0.5, 0.32, 0.18]
</script>

<template>
  <div class="hero-motif" aria-hidden="true">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="hm-hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--motif-accent)" stop-opacity="0.26" />
          <stop offset="48%" stop-color="var(--motif-accent)" stop-opacity="0.08" />
          <stop offset="100%" stop-color="var(--motif-accent)" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="hm-link" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="var(--motif-line)" stop-opacity="0.05" />
          <stop offset="100%" stop-color="var(--motif-line)" stop-opacity="0.55" />
        </linearGradient>
      </defs>

      <!-- Hub aura -->
      <circle :cx="HUB.x" :cy="HUB.y" r="520" fill="url(#hm-hub-glow)" />

      <!-- Orbit rings: the control plane's reach, not decoration -->
      <g class="hm-rings" fill="none" stroke="var(--motif-line)">
        <ellipse :cx="HUB.x" :cy="HUB.y" rx="300" ry="186" stroke-opacity="0.16" />
        <ellipse :cx="HUB.x" :cy="HUB.y" rx="560" ry="347" stroke-opacity="0.1" />
        <ellipse :cx="HUB.x" :cy="HUB.y" rx="880" ry="546" stroke-opacity="0.06" />
      </g>

      <!-- Links + inbound-to-hub pulses -->
      <g class="hm-links">
        <g v-for="(n, i) in nodes" :key="`l${i}`" :opacity="bandOpacity[n.band]">
          <line
            :x1="n.x"
            :y1="n.y"
            :x2="HUB.x"
            :y2="HUB.y"
            stroke="url(#hm-link)"
            stroke-width="1"
          />
          <circle class="hm-pulse" r="2.4" fill="var(--motif-accent)">
            <!-- Node → hub. Outbound dial-out is the architecture; keep the
                 direction, or the drawing contradicts the security model. -->
            <animate
              attributeName="cx"
              :from="n.x"
              :to="HUB.x"
              :dur="`${n.dur}s`"
              :begin="`${n.delay}s`"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              :from="n.y"
              :to="HUB.y"
              :dur="`${n.dur}s`"
              :begin="`${n.delay}s`"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.12;0.75;1"
              :dur="`${n.dur}s`"
              :begin="`${n.delay}s`"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>

      <!-- Nodes -->
      <g class="hm-nodes">
        <circle
          v-for="(n, i) in nodes"
          :key="`n${i}`"
          :cx="n.x"
          :cy="n.y"
          :r="n.r"
          fill="var(--motif-node)"
          :opacity="bandOpacity[n.band] + 0.28"
        />
      </g>

      <!-- Hub: the control plane.
           Drawn as concentric rings rather than a filled disc. A solid fill
           against the glow reads as a hole punched in the artwork — the eye
           sees absence where the drawing means "this is the thing everything
           reports to". -->
      <g class="hm-hub">
        <circle
          :cx="HUB.x"
          :cy="HUB.y"
          r="26"
          fill="var(--motif-hub-fill)"
          fill-opacity="0.55"
        />
        <circle
          :cx="HUB.x"
          :cy="HUB.y"
          r="26"
          fill="none"
          stroke="var(--motif-accent)"
          stroke-width="1.6"
          stroke-opacity="0.95"
        />
        <circle
          :cx="HUB.x"
          :cy="HUB.y"
          r="13"
          fill="none"
          stroke="var(--motif-accent)"
          stroke-width="1.1"
          stroke-opacity="0.6"
        />
        <circle :cx="HUB.x" :cy="HUB.y" r="4.2" fill="var(--motif-accent)" />
        <circle
          class="hm-hub-ping"
          :cx="HUB.x"
          :cy="HUB.y"
          r="26"
          fill="none"
          stroke="var(--motif-accent)"
          stroke-width="1.2"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.hero-motif {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-motif svg {
  width: 100%;
  height: 100%;
  display: block;
}

.hm-hub-ping {
  transform-origin: center;
  animation: hm-ping 4.8s ease-out infinite;
}

@keyframes hm-ping {
  0% {
    r: 30;
    stroke-opacity: 0.55;
  }
  70% {
    r: 132;
    stroke-opacity: 0;
  }
  100% {
    r: 132;
    stroke-opacity: 0;
  }
}

/* Motion is atmosphere, never information. Everything the drawing says is still
   said by the static frame, so freezing it loses nothing. */
@media (prefers-reduced-motion: reduce) {
  .hm-hub-ping {
    animation: none;
  }

  .hm-pulse {
    display: none;
  }
}
</style>
