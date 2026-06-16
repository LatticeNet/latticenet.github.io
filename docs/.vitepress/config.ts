import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "LatticeNet",
  description: "Reviewed control plane for self-hosted fleet operations, node automation, DNS, proxy-core, and signed plugins.",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["meta", { name: "theme-color", content: "#f5efe4" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "LatticeNet" }],
    ["meta", { property: "og:description", content: "Reviewed control plane for self-hosted fleet operations, node automation, DNS, proxy-core, and signed plugins." }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
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
