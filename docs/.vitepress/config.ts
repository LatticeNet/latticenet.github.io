import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "LatticeNet",
  description: "Security-first fleet monitoring, automation, and network control plane.",
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["meta", { name: "theme-color", content: "#0f766e" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "LatticeNet" }],
    ["meta", { property: "og:description", content: "Security-first fleet monitoring, automation, and network control plane." }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "LatticeNet",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "Security", link: "/security/" },
      { text: "Plugins", link: "/plugins/" },
      { text: "Ecosystem", link: "/ecosystem/" },
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
      message: "Released under the MIT License.",
      copyright: "Copyright 2026 LatticeNet contributors",
    },
  },
});
