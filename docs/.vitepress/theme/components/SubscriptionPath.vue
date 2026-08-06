<script setup lang="ts">
import DiagramFrame from './DiagramFrame.vue'

/**
 * What happens when a proxy client fetches a subscription URL.
 *
 * The load-bearing point of the drawing is where the boundary sits: routing,
 * token comparison, rate limiting, caching and headers are all core-owned, and
 * the plugin is asked exactly one question. A general "let a plugin serve HTTP"
 * capability would have moved token checking into plugin code, which is the
 * shape this design refuses.
 *
 * The refusal branch is drawn as a branch, not as a footnote: every failure
 * leaves by the same door, and the door looks like a path that is not served.
 */

type Step = {
  n: string
  name: string
  detail: string
  owner: 'core' | 'plugin'
}

const STEPS: Step[] = [
  { n: '01', name: 'Route', detail: '/sub/<slug>/<token> — the only shape served.', owner: 'core' },
  { n: '02', name: 'Format', detail: 'Validated before the token is looked at, so a bad format cannot reveal whether a token was real.', owner: 'core' },
  { n: '03', name: 'Resolve', detail: 'Slug and token compared whole-string against the share record.', owner: 'core' },
  { n: '04', name: 'Limit', detail: 'Rate limit and audit. Exceeding the limit leaves by the refusal door too.', owner: 'core' },
  { n: '05', name: 'Cache', detail: 'Keyed by share, format and a bounded client class. Empty bodies are never stored.', owner: 'core' },
  { n: '06', name: 'Render', detail: 'Given an id, a format and a client class, produce content. This is the whole plugin surface.', owner: 'plugin' },
  { n: '07', name: 'Serve', detail: 'Headers, traffic counters and content type are written by the core.', owner: 'core' },
]
</script>

<template>
  <DiagramFrame
    label="Subscription request path"
    caption="The plugin never sees the token, never owns the route, and never writes a response header. It answers one question, and the core decides whether the answer is served."
  >
    <div class="sub-path">
      <ol class="sub-steps">
        <li v-for="s in STEPS" :key="s.n" :class="['sub-step', `owner-${s.owner}`]">
          <div class="sub-head">
            <span class="sub-n">{{ s.n }}</span>
            <span class="sub-name">{{ s.name }}</span>
            <span class="sub-owner">{{ s.owner }}</span>
          </div>
          <p class="sub-detail">{{ s.detail }}</p>
        </li>
      </ol>

      <div class="sub-deny">
        <div class="sub-deny-head">Any refusal leaves here</div>
        <p>
          Unknown slug, wrong token, unknown format, rate limited, or a render that
          produced nothing — all of them return the same thing: a bodiless
          <code>404</code> with no request id. A prober cannot tell an existing
          share from a missing one, or learn whether the request reached the
          application at all.
        </p>
        <p class="sub-deny-note">
          The reason is still recorded in the audit trail. It is withheld from the
          client, not from the operator.
        </p>
      </div>
    </div>
  </DiagramFrame>
</template>

<style scoped>
.sub-path {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  /* The diagram's width comes from its container, not the viewport: the same
     component sits in an 820px prose column and in a 1360px home rail. Without
     this declaration the @container query below would never match anything. */
  container-type: inline-size;
}

/* Wraps instead of forcing one row.
   This diagram lives on a documentation page inside an 820px prose column,
   where seven fixed columns overflowed into a horizontal scroll and broke
   `/sub/<slug>/<token>` across lines mid-token. Order is carried by the step
   numbers, so wrapping costs nothing; a scrollbar cost legibility. */
.sub-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(158px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sub-step {
  position: relative;
  padding: 13px 12px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 11px;
  background: var(--vp-c-bg-soft);
}

/* One box in the row is the plugin's. Making it visually distinct is the point
   of the drawing — the boundary should be findable at a glance. */
.sub-step.owner-plugin {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, var(--vp-c-bg-elv));
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, var(--vp-c-border));
}

/* Connector between adjacent steps. Hidden once the grid wraps, because a
   connector at the end of a row points into empty space and implies a link to
   whatever happens to sit below it. */
.sub-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 24px;
  right: -10px;
  width: 10px;
  height: 1.5px;
  background: var(--vp-c-border);
}

@container (max-width: 1160px) {
  .sub-step::after {
    display: none;
  }
}

.sub-head {
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex-wrap: wrap;
  margin-bottom: 7px;
}

.sub-n {
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.sub-name {
  font-size: 13.5px;
  font-weight: 700;
}

.sub-owner {
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.owner-plugin .sub-owner,
.owner-plugin .sub-n {
  color: var(--vp-c-brand-1);
}

.sub-detail {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 12.3px;
  line-height: 1.55;
}

.sub-deny {
  padding: 16px 18px;
  border: 1px dashed color-mix(in srgb, var(--vp-c-text-3) 50%, transparent);
  border-radius: 12px;
  background: transparent;
}

.sub-deny-head {
  margin-bottom: 8px;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.sub-deny p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13.5px;
  line-height: 1.66;
}

.sub-deny-note {
  margin-top: 8px !important;
  color: var(--vp-c-text-3) !important;
  font-size: 12.5px !important;
}
</style>
