<script setup lang="ts">
/**
 * Shared chrome for every diagram on the site.
 *
 * The point of this component is that the illustrations must read as one
 * language rather than as a pile of one-off drawings: same frame, same label
 * placement, same caption treatment, same legend grammar. A diagram that needs
 * different chrome is a sign the diagram is doing something the others are not,
 * which is worth noticing rather than styling around.
 */
defineProps<{
  /** Short uppercase label in the frame chrome — what the drawing IS. */
  label: string
  /** One sentence under the drawing — what the reader should take away. */
  caption?: string
}>()
</script>

<template>
  <figure class="lat-diagram">
    <div class="lat-diagram-bar">
      <span class="lat-diagram-label">{{ label }}</span>
      <slot name="controls" />
    </div>

    <div class="lat-diagram-body">
      <slot />
    </div>

    <figcaption v-if="caption || $slots.caption" class="lat-diagram-caption">
      <slot name="caption">{{ caption }}</slot>
    </figcaption>
  </figure>
</template>

<style scoped>
.lat-diagram {
  margin: 0;
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  background: var(--vp-c-bg-elv);
  overflow: hidden;
}

.lat-diagram-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.lat-diagram-label {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

/* Diagrams are wide by nature. They scroll inside their own frame so the page
   body never gains a horizontal scrollbar on a narrow screen. */
.lat-diagram-body {
  overflow-x: auto;
  padding: clamp(16px, 2.4vw, 28px);
}

.lat-diagram-caption {
  padding: 0 clamp(16px, 2.4vw, 28px) clamp(16px, 2.2vw, 22px);
  color: var(--vp-c-text-3);
  font-size: 13.5px;
  line-height: 1.65;
}
</style>
