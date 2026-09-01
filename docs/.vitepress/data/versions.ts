/**
 * Single source of truth for every version this site displays.
 *
 * Versions belong in exactly one file because the failure mode is drift: the
 * same number typed into a status table, a prose paragraph and an install
 * snippet goes stale in three places at three different times, and only the
 * install snippet is loud about it. Anything the site renders as a version
 * reads from here.
 *
 * `scripts/check-release-pins.mjs` verifies the entries carrying `verify`
 * against the real releases API, so this file going stale fails the build
 * rather than quietly misinforming a reader.
 */

export type Channel = 'stable' | 'prerelease'

export type Component = {
  /** Display name. */
  name: string
  /** GitHub repo, owner/name. */
  repo: string
  version: string
  channel: Channel
  /** Verify this version against the releases API at check time. */
  verify?: 'latest-stable' | 'latest-prerelease'
  /** Where a reader goes to learn about it. */
  link?: string
  /** One line: what this is. */
  summary: string
}

export const SERVER_IMAGE_TAG = 'alpha-0.2.2a78'

export const COMPONENTS: Component[] = [
  {
    name: 'lattice-server',
    repo: 'LatticeNet/lattice-server',
    version: SERVER_IMAGE_TAG,
    channel: 'prerelease',
    link: '/guide/docker-server',
    summary: 'The control plane. Holds all state; serves the dashboard.',
  },
  {
    name: 'lattice-agent',
    repo: 'LatticeNet/lattice-node-agent',
    version: 'v0.3.8',
    channel: 'stable',
    verify: 'latest-stable',
    link: '/guide/node-agent',
    summary: 'The host binary. Dials out, leases tasks, applies and reports.',
  },
  {
    name: 'lattice-sdk',
    repo: 'LatticeNet/lattice-sdk',
    version: 'v0.2.23',
    channel: 'stable',
    verify: 'latest-stable',
    link: '/developers/',
    summary: 'Shared models and the plugin protocol. Versioned contract.',
  },
  {
    // A package consumed by plugin UIs, not a loadable bundle: it declares no
    // capabilities and the server never sees it. Listing it beside the system
    // plugins would imply it goes through the same trust chain.
    name: '@latticenet/plugin-bridge',
    repo: 'LatticeNet/lattice-plugin-bridge',
    version: 'v0.1.0-alpha.1',
    channel: 'prerelease',
    link: '/plugins/bridge',
    summary: 'The sandboxed postMessage channel a plugin UI uses to reach its own backend.',
  },
]

export type PluginState = 'live' | 'preview' | 'blocked'

export type Plugin = {
  id: string
  name: string
  repo: string
  version: string
  state: PluginState
  /** Capabilities exactly as the deployed manifest declares them. */
  capabilities: string[]
  summary: string
  link: string
}

export const PLUGINS: Plugin[] = [
  {
    id: 'latticenet.sub-store',
    name: 'Sub-Store',
    repo: 'LatticeNet/lattice-plugin-sub-store',
    version: '0.13.0-alpha.27',
    state: 'live',
    capabilities: [
      'http:egress',
      'http:operator-target',
      'kv:read',
      'kv:write',
      'rpc:call',
      'subscription:serve',
    ],
    summary: 'A native subscription platform: store, fetch, process, publish.',
    link: '/plugins/sub-store',
  },
  {
    id: 'latticenet.vpn-core',
    name: 'VPN Core',
    repo: 'LatticeNet/lattice-plugin-vpn-core',
    version: '0.8.0-alpha.15',
    state: 'live',
    capabilities: ['node:read', 'network:plan', 'network:apply', 'task:run'],
    summary: 'VLESS + REALITY profiles, lines, users, and usage reporting.',
    link: '/plugins/vpn-core',
  },
  {
    id: 'latticenet.netguard',
    name: 'NetGuard',
    repo: 'LatticeNet/lattice-plugin-netguard',
    version: '0.1.0-alpha.14',
    state: 'live',
    capabilities: ['node:read', 'network:plan', 'network:apply', 'task:run'],
    summary: 'Reviewed firewall zones, groups and bindings with an adopt path.',
    link: '/plugins/netguard',
  },
  {
    id: 'latticenet.wireguard',
    name: 'WireGuard',
    repo: 'LatticeNet/lattice-plugin-wireguard',
    version: '0.1.0-alpha.13',
    state: 'live',
    capabilities: ['node:read', 'network:plan', 'network:apply', 'task:run'],
    summary: 'WireGuard topology and device peers, planned before applied.',
    link: '/plugins/wireguard',
  },
]

/**
 * Things the project deliberately does not do yet. These are listed with the
 * shipped features on purpose: a capability table that shows only what works
 * reads as a claim that everything else works too.
 */
export const NOT_ENABLED: { name: string; why: string }[] = [
  {
    name: 'Arbitrary community plugin execution',
    why: 'The bounded runner is for trusted system plugins. Running unreviewed third-party code against host capabilities is not a switch that is off — it is a design that is not finished.',
  },
  {
    name: 'Remote marketplace install',
    why: 'The plugin index is a read-only draft catalogue. Installing from it is a separate trust decision that still belongs to the operator, by hand.',
  },
]
