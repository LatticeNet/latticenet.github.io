<script setup lang="ts">
import DiagramFrame from './DiagramFrame.vue'

/**
 * The approval loop as one continuous rail.
 *
 * It used to be six identical cards in a grid, which read as six unrelated
 * facts. The whole point is that these are ordered stages of a single path and
 * that the gate sits at a specific place in it, so the drawing is a rail with a
 * marked gate rather than a row of tiles.
 */

type Stage = {
  n: string
  name: string
  detail: string
  /** The stage where the change stops until a human acts. */
  gate?: boolean
  /** Which side of the boundary this stage runs on. */
  side: 'server' | 'node'
}

const STAGES: Stage[] = [
  { n: '01', name: 'Configure', detail: 'Intent is set in the dashboard or through the API.', side: 'server' },
  { n: '02', name: 'Render', detail: 'The server builds a review plan with secrets stripped.', side: 'server' },
  { n: '03', name: 'Approve', detail: 'The dashboard sends the SHA-256 of the plan actually shown.', gate: true, side: 'server' },
  { n: '04', name: 'Queue', detail: 'The agent leases a bounded task over outbound HTTPS.', side: 'node' },
  { n: '05', name: 'Apply', detail: 'The node validates artifacts before it mutates anything.', side: 'node' },
  { n: '06', name: 'Audit', detail: 'Result and actor trail land in the server log.', side: 'server' },
]
</script>

<template>
  <DiagramFrame
    label="Control loop"
    caption="The approval stage hashes what the operator was shown, not what the server intended to do — so a plan that changed between render and approval fails the comparison instead of applying quietly."
  >
    <ol class="rail">
      <li v-for="s in STAGES" :key="s.n" :class="['rail-stage', `side-${s.side}`, { 'is-gate': s.gate }]">
        <div class="rail-marker">
          <span class="rail-n">{{ s.n }}</span>
        </div>
        <div class="rail-body">
          <h4 class="rail-name">
            {{ s.name }}
            <span v-if="s.gate" class="rail-gate-tag">human gate</span>
          </h4>
          <p class="rail-detail">{{ s.detail }}</p>
          <span class="rail-side">{{ s.side === 'server' ? 'server' : 'node' }}</span>
        </div>
      </li>
    </ol>
  </DiagramFrame>
</template>

<style scoped>
.rail {
  display: grid;
  grid-template-columns: repeat(6, minmax(150px, 1fr));
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 860px;
}

.rail-stage {
  position: relative;
  padding: 0 16px 4px 0;
}

/* The rail itself: one continuous line through every marker, broken only at
   the gate so the stop is visible in the geometry and not just in the label. */
.rail-marker {
  position: relative;
  display: flex;
  align-items: center;
  height: 34px;
}

.rail-marker::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
  background: var(--vp-c-divider);
}

.rail-stage:last-child .rail-marker::before {
  right: calc(100% - 12px);
}

.rail-stage.is-gate .rail-marker::before {
  background: repeating-linear-gradient(
    90deg,
    var(--vp-c-brand-1) 0 6px,
    transparent 6px 12px
  );
}

.rail-n {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1.5px solid var(--vp-c-border);
  background: var(--vp-c-bg-elv);
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.rail-stage.is-gate .rail-n {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
}

.rail-body {
  padding-top: 14px;
}

.rail-name {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.rail-gate-tag {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.rail-detail {
  margin: 0 0 10px;
  padding-right: 8px;
  color: var(--vp-c-text-2);
  font-size: 13.5px;
  line-height: 1.6;
}

.rail-side {
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.side-node .rail-side {
  color: color-mix(in srgb, var(--vp-c-brand-1) 70%, var(--vp-c-text-3));
}
</style>
