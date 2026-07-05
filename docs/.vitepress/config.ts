import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "LatticeNet",
  description: "Reviewed control plane for self-hosted fleet operations, node automation, DNS, proxy-core, and signed plugins.",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["meta", { name: "theme-color", content: "#0d1117" }],
    ["meta", { name: "og:site_name", content: "LatticeNet" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:url", content: "https://latticenet.github.io/" }],
    ["meta", { property: "og:title", content: "LatticeNet — reviewed control plane for self-hosted fleets" }],
    ["meta", { property: "og:description", content: "Reviewed control plane for self-hosted fleet operations, node automation, DNS, proxy-core, and signed plugins. Every privileged change ships behind a visible plan and an approval trail." }],
    ["meta", { property: "og:image", content: "https://latticenet.github.io/og-image.png" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "LatticeNet — reviewed control plane for self-hosted fleets" }],
    ["meta", { name: "twitter:description", content: "Monitor nodes, plan privileged changes, deploy DNS and proxy-core config, and publish signed plugins — all behind an approval trail." }],
    ["meta", { name: "twitter:image", content: "https://latticenet.github.io/og-image.png" }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "LatticeNet",
    nav: [
      { text: "Install", link: "/guide/docker-server" },
      { text: "Security", link: "/security/" },
      { text: "Plugins", link: "/plugins/" },
      { text: "Developers", link: "/developers/" },
      { text: "Roadmap", link: "/ecosystem/roadmap" },
      { text: "Release 0.2.0", link: "/developers/release-0.2.0" },
      { text: "GitHub", link: "https://github.com/LatticeNet" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Overview", link: "/guide/" },
            { text: "Docker Server", link: "/guide/docker-server" },
            { text: "Node Agent", link: "/guide/node-agent" },
            { text: "Storage Hosting", link: "/guide/storage-hosting" },
            { text: "Single Sign-On", link: "/guide/sso" },
            { text: "Operations", link: "/guide/operations" },
          ],
        },
      ],
      "/security/": [
        {
          text: "Security",
          items: [
            { text: "Overview", link: "/security/" },
            { text: "Agent Updates", link: "/security/agent-updates" },
            { text: "Plugin Trust", link: "/security/plugin-trust" },
          ],
        },
      ],
      "/plugins/": [
        {
          text: "Plugins",
          items: [
            { text: "Marketplace", link: "/plugins/" },
            { text: "Authoring", link: "/plugins/authoring" },
            { text: "Index Format", link: "/plugins/index-format" },
          ],
        },
      ],
      "/developers/": [
        {
          text: "Developers",
          items: [
            { text: "Developer Guide", link: "/developers/" },
            { text: "Release Workflow", link: "/developers/releases" },
          ],
        },
      ],
      "/ecosystem/": [
        {
          text: "Ecosystem",
          items: [
            { text: "Repositories", link: "/ecosystem/" },
            { text: "Roadmap", link: "/ecosystem/roadmap" },
            { text: "sing-box", link: "/ecosystem/sing-box" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/LatticeNet" },
    ],
    search: {
      provider: "local",
    },
    footer: {
      message: "Security-first, self-hosted, and release-gated.",
      copyright: "Copyright 2026 LatticeNet contributors",
    },
  },
});
