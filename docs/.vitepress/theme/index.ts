import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import HeroMotif from "./components/HeroMotif.vue";
import ArchDiagram from "./components/ArchDiagram.vue";
import FlowRail from "./components/FlowRail.vue";
import StatusMatrix from "./components/StatusMatrix.vue";
import DiagramFrame from "./components/DiagramFrame.vue";
import SigningChain from "./components/SigningChain.vue";
import SubscriptionPath from "./components/SubscriptionPath.vue";
import "./custom.css";

// The diagram components are registered globally so any markdown page can drop
// one in without an import block at the top of the file. They share one visual
// language (see DiagramFrame) — a page that needs different chrome is a signal
// worth noticing rather than styling around.
export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // info-before renders inside .main; the motif's inset:0 escapes to the
      // position:relative .VPHomeHero, covering the whole hero without tripping
      // VitePress's two-column has-image layout.
      "home-hero-info-before": () => h(HeroMotif),
    });
  },
  enhanceApp({ app }) {
    app.component("ArchDiagram", ArchDiagram);
    app.component("FlowRail", FlowRail);
    app.component("StatusMatrix", StatusMatrix);
    app.component("DiagramFrame", DiagramFrame);
    app.component("SigningChain", SigningChain);
    app.component("SubscriptionPath", SubscriptionPath);
  },
} satisfies Theme;
