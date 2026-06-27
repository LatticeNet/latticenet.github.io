import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import HeroBackdrop from "./HeroBackdrop.vue";
import "./custom.css";

// Extend the default theme and inject the animated lattice backdrop behind the
// home hero. The component positions itself absolutely over .VPHomeHero, so the
// hero copy (lifted above it in custom.css) reads on top of the live mesh.
export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // info-before renders inside .main; the backdrop's inset:0 escapes to the
      // position:relative .VPHomeHero, covering the whole hero without tripping
      // VitePress's two-column has-image layout.
      "home-hero-info-before": () => h(HeroBackdrop),
    });
  },
};
