<script setup lang="ts">
import { COMPONENTS, PLUGINS, NOT_ENABLED } from '../../data/versions'
import DiagramFrame from './DiagramFrame.vue'

/**
 * What is actually running, at what version, and what is deliberately absent.
 *
 * The absent rows are not filler. A capability table listing only working
 * features implies the rest works too, which is the specific way a status page
 * misleads — so the things the project refuses to do yet sit in the same table
 * as the things it does, with the reason attached.
 */
</script>

<template>
  <DiagramFrame
    label="What is live"
    caption="Versions come from one file the release check verifies against the GitHub releases API, so a stale number here fails the build rather than quietly misinforming a reader."
  >
    <table class="matrix">
      <thead>
        <tr>
          <th>Component</th>
          <th>State</th>
          <th>Version</th>
          <th>What it does</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in COMPONENTS" :key="c.repo">
          <td>
            <a v-if="c.link" :href="c.link" class="matrix-name">{{ c.name }}</a>
            <span v-else class="matrix-name">{{ c.name }}</span>
          </td>
          <td>
            <span :class="['pill', c.channel === 'stable' ? 'pill-live' : 'pill-preview']">
              {{ c.channel }}
            </span>
          </td>
          <td><code>{{ c.version }}</code></td>
          <td class="matrix-desc">{{ c.summary }}</td>
        </tr>

        <tr v-for="p in PLUGINS" :key="p.id">
          <td>
            <a :href="p.link" class="matrix-name">{{ p.name }}</a>
            <span class="matrix-id">{{ p.id }}</span>
          </td>
          <td>
            <span :class="['pill', p.state === 'live' ? 'pill-live' : 'pill-preview']">
              {{ p.state }}
            </span>
          </td>
          <td><code>{{ p.version }}</code></td>
          <td class="matrix-desc">{{ p.summary }}</td>
        </tr>

        <tr v-for="n in NOT_ENABLED" :key="n.name" class="row-off">
          <td><span class="matrix-name">{{ n.name }}</span></td>
          <td><span class="pill pill-off">not enabled</span></td>
          <td><code>—</code></td>
          <td class="matrix-desc">{{ n.why }}</td>
        </tr>
      </tbody>
    </table>
  </DiagramFrame>
</template>

<style scoped>
.matrix {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 14px;
}

.matrix th {
  padding: 0 14px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.matrix td {
  padding: 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  vertical-align: top;
}

.matrix tbody tr:last-child td {
  border-bottom: 0;
}

.matrix-name {
  display: block;
  font-weight: 650;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

a.matrix-name:hover {
  color: var(--vp-c-brand-1);
}

.matrix-id {
  display: block;
  margin-top: 3px;
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  color: var(--vp-c-text-3);
}

.matrix-desc {
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.matrix code {
  font-size: 12.5px;
  white-space: nowrap;
}

.pill {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.pill-live {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.pill-preview {
  background: color-mix(in srgb, var(--vp-c-text-3) 16%, transparent);
  color: var(--vp-c-text-2);
}

.pill-off {
  background: transparent;
  border: 1px dashed color-mix(in srgb, var(--vp-c-text-3) 55%, transparent);
  color: var(--vp-c-text-3);
}

.row-off .matrix-name {
  color: var(--vp-c-text-3);
  white-space: normal;
}
</style>
