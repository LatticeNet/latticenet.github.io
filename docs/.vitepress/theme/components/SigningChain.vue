<script setup lang="ts">
import DiagramFrame from './DiagramFrame.vue'

/**
 * How a plugin bundle becomes something the server will load.
 *
 * Drawn as a chain because every link is a refusal point: any one of them
 * failing stops the load. The two host-side links are marked, because that is
 * the part an operator controls and the part a publisher cannot influence.
 */

type Link = {
  n: string
  name: string
  detail: string
  /** Enforced by the operator's own server rather than by the publisher. */
  host?: boolean
}

const LINKS: Link[] = [
  {
    n: '01',
    name: 'Build',
    detail: 'Runtime binaries and the UI are built on a pinned toolchain. A different Go or Node version produces different bytes.',
  },
  {
    n: '02',
    name: 'Pack',
    detail: 'A deterministic packer writes the archive. Packing twice must produce identical bytes, and CI rebuilds it to check.',
  },
  {
    n: '03',
    name: 'Sign',
    detail: 'The publisher signs the manifest, which covers the artifact digest, the capability list and the interfaces.',
  },
  {
    n: '04',
    name: 'Digest check',
    detail: 'The server hashes the artifact it actually has and compares it to the manifest. A swapped artifact fails here.',
    host: true,
  },
  {
    n: '05',
    name: 'Publisher check',
    detail: 'The signature is verified against the operator-held trust file. An unknown publisher is refused, not warned about.',
    host: true,
  },
  {
    n: '06',
    name: 'Grant',
    detail: 'Capabilities are granted from the verified manifest. Host-risk capabilities require a signature — that default is fail-closed.',
    host: true,
  },
]
</script>

<template>
  <DiagramFrame
    label="Plugin trust chain"
    caption="Because the capability list lives inside the signed payload, a plugin cannot quietly acquire a new privilege: changing what it asks for changes the signature, and an unsigned change fails at the publisher check."
  >
    <ol class="chain">
      <li v-for="l in LINKS" :key="l.n" :class="['chain-link', { 'is-host': l.host }]">
        <div class="chain-head">
          <span class="chain-n">{{ l.n }}</span>
          <span class="chain-name">{{ l.name }}</span>
        </div>
        <p class="chain-detail">{{ l.detail }}</p>
        <span v-if="l.host" class="chain-tag">enforced by your server</span>
      </li>
    </ol>
  </DiagramFrame>
</template>

<style scoped>
.chain {
  display: grid;
  grid-template-columns: repeat(6, minmax(148px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 900px;
  counter-reset: none;
}

.chain-link {
  position: relative;
  padding: 16px 14px 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

/* Host-enforced links are the operator's leverage; they read as the product's
   own surface rather than the publisher's. */
.chain-link.is-host {
  background: color-mix(in srgb, var(--vp-c-brand-1) 7%, var(--vp-c-bg-elv));
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 34%, var(--vp-c-border));
}

/* Connector between links, drawn in the gap. */
.chain-link:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 30px;
  right: -12px;
  width: 12px;
  height: 1.5px;
  background: var(--vp-c-border);
}

.chain-link.is-host:not(:last-child)::after {
  background: color-mix(in srgb, var(--vp-c-brand-1) 55%, transparent);
}

.chain-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 9px;
}

.chain-n {
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.chain-link.is-host .chain-n {
  color: var(--vp-c-brand-1);
}

.chain-name {
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.chain-detail {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 12.8px;
  line-height: 1.6;
}

.chain-tag {
  display: inline-block;
  margin-top: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}
</style>
