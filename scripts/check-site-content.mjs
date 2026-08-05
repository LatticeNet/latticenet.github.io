import { readFileSync } from "node:fs";

const SDK_BASELINE = "v0.2.18";
const NEXT_AGENT_EXAMPLE_VERSION = "v0.2.10-alpha.1";

// The agent version a reader pastes is asserted by SHAPE here and by VALUE in
// check-release-pins.mjs, which compares it against the actual latest stable
// release. Pinning the literal in this file instead produced the failure mode
// rules/04 names: the guard stayed green while the sentence went stale, because
// it was only ever checking that someone had typed the same constant twice.
const AGENT_VERSION_SHAPE = /VERSION=v\d+\.\d+\.\d+\b/;
const AGENT_TARGET_VERSION_SHAPE = /target version: \d+\.\d+\.\d+\b/;
const AGENT_DOWNLOAD_URL_SHAPE = /releases\/download\/v\d+\.\d+\.\d+\/lattice-agent-linux-amd64/;
const AGENT_TARGET_LATEST_SHAPE = /target version: latest or \d+\.\d+\.\d+\b/;

const checks = [
  {
    file: "docs/index.md",
    patterns: [
      "Docker server first",
      "systemd node-agent",
      "GHCR image",
      "GitHub Release binaries",
      "Draft plugin index",
    ],
  },
  {
    file: "docs/guide/node-agent.md",
    patterns: [
      "lattice-agent-linux-amd64",
      "lattice-agent-linux-arm64",
      "SHA256SUMS",
      AGENT_VERSION_SHAPE,
      "curl -fsSL --proto '=https' --tlsv1.2 -O",
      "lattice-agent.service",
      "`node-token` is a per-node bearer token",
      "curl -fsSL --proto '=https' --tlsv1.2 'https://raw.githubusercontent.com/LatticeNet/lattice-node-agent/main/scripts/install.sh'",
      "The install script downloads the selected Linux release artifact",
      "Create fresh plan",
      "Force fresh plan",
      "does not approve or apply",
      "Script mode is high-trust host code",
      "LATTICE_AGENT_DEBUG=1",
      "EnvironmentFile=/opt/lattice/lattice-agent.env",
      "sudo chmod 0600 /opt/lattice/lattice-agent.env",
      "Current Lattice node-agent topology is hub-and-spoke",
      AGENT_TARGET_VERSION_SHAPE,
      AGENT_DOWNLOAD_URL_SHAPE,
    ],
  },
  {
    file: "docs/security/agent-updates.md",
    patterns: [
      "candidate's `-version` output must equal `target_version`",
      "SHA256SUMS",
      "auto-plan never auto-approves",
      "agent_update_noop",
      "Create fresh plan",
      "Force fresh plan",
      "Force plan",
    ],
  },
  {
    file: "docs/security/index.md",
    patterns: [
      "The password login endpoint receives username and password as JSON over HTTPS",
      "front-end encryption cannot replace TLS",
      "LATTICE_SECURE_COOKIES=1",
      "agent_update_noop",
      "reject a pending approval to close it without",
    ],
  },
  {
    file: "docs/plugins/index.md",
    patterns: [
      "read-only signed index",
      "does not install or execute remote community bundles automatically",
      "verified -> installed -> active",
      "bounded system runner",
    ],
  },
  {
    file: "docs/plugins/lifecycle.md",
    patterns: [
      "Publish",
      "Verify",
      "Activate",
      "Apply",
      "verified -> installed -> active",
      "Activation is not host apply",
      "scope: plugin:admin",
      "Active-only UI contributions",
    ],
  },
  {
    file: "docs/security/plugin-trust.md",
    patterns: [
      "publisher signature",
      "operator identity",
      "allow_unsigned_host_risk",
      "LATTICE_PLUGIN_TRUST",
      "Ed25519 seed/private key",
    ],
  },
  {
    file: "docs/security/pat-authorization.md",
    patterns: [
      "Credential types are not interchangeable",
      "plugin:admin",
      "Authorization: Bearer",
      "Settings -> Access Tokens",
      "server-side revocation",
    ],
  },
  {
    file: "docs/developers/index.md",
    patterns: [
      `Latest published SDK tag: \`github.com/LatticeNet/lattice-sdk ${SDK_BASELINE}\``,
      // The consumption sentence used to assert that both binaries consume the
      // published tag. They do not - both pin a pseudo-version - and pinning the
      // false sentence here made correcting the page fail this check. Pin the
      // shape of the honest explanation instead of a value it never had.
      "pseudo-version",
      "`go.mod` is authoritative",
      "[`Astra`](https://github.com/LatticeNet/Astra)",
      "release tag order",
      "runner sandbox maturity",
    ],
  },
  {
    file: "docs/developers/releases.md",
    patterns: [
      `NEXT_AGENT=${NEXT_AGENT_EXAMPLE_VERSION}`,
      `NEXT_SDK=${SDK_BASELINE}`,
      "releases/download/${NEXT_AGENT}/SHA256SUMS",
      AGENT_TARGET_LATEST_SHAPE,
    ],
  },
  {
    file: "docs/guide/docker-server.md",
    patterns: [
      "`:latest` for the current stable image",
      "`:alpha` for the moving alpha test",
      "no `main` image channel",
      "The first boot creates `data/master.key` automatically",
      "pointing it at a missing file makes startup fail closed",
      "fixes ownership of the mounted data directory",
      "conflicting server name",
      "Full (strict)",
      "Bypass cache",
      "WebSocket upgrade locations",
      "Cache-Control: no-cache",
      "Cache-Control: public, max-age=31536000, immutable",
    ],
  },
  {
    file: "docs/guide/index.md",
    patterns: [
      "OIDC/SSO is optional",
      "pre-creates local users",
      "verified IdP email",
      "Lattice still issues its own `lattice_session` cookie",
    ],
  },
  {
    file: "docs/guide/operations.md",
    patterns: [
      "Pending approvals can also be rejected",
      "without queuing an agent task",
      "Stale node-agent update approvals are closed as `rejected`",
    ],
  },
  {
    file: "docs/guide/sso.md",
    patterns: [
      "https://lattice.example.com/api/auth/oidc/callback",
      "Authorization code",
      "PKCE",
      "Client secret",
      "Allowed domains",
      "Lattice intentionally does not auto-create operator users from SSO",
    ],
  },
  {
    file: "docs/ecosystem/roadmap.md",
    patterns: [
      "KV Store v2",
      "Static hosting v2",
      "Browser Terminal MVP",
      "Astra iOS companion v2 source publication",
      "Optional group-leader / relay topology",
      "authorization, audit events",
    ],
  },
  {
    file: "docs/developers/release-0.2.0.md",
    patterns: [
      "lattice-server v0.2.0",
      "lattice-dashboard v0.2.0",
      "lattice-node-agent v0.3.0",
      "server-side node-token auth cache",
      "outbound control WebSocket",
      "native passkeys",
      "Cloudflare-inspired sidebar",
      "sing-box",
    ],
  },
  {
    file: "docs/developers/release-0.2.1.md",
    patterns: [
      "lattice-server v0.2.1",
      "lattice-dashboard v0.2.1",
      "lattice-node-agent v0.2.9",
      "lattice-sdk v0.2.17",
      "lattice-plugin-index v0.2.0",
      "lattice-plugin-template v0.2.0",
      "Activation is not host apply",
    ],
  },
  {
    file: "docs/ecosystem/sing-box.md",
    patterns: [
      "lr00rl/sing-box",
      "b4707b2e02ff54dfaf0ea4dbf70f29c7ab381c4a",
      "structured user mutation errors",
      "sb --json",
      "third-party dependency",
    ],
  },
];

const forbidden = [
  {
    file: "docs/guide/node-agent.md",
    patterns: [
      "LATTICE_SERVER_URL",
      "curl -fsSLO \"https://github.com/LatticeNet/lattice-node-agent",
      "curl -fsSL https://raw.githubusercontent.com/LatticeNet/lattice-node-agent",
    ],
  },
];

let failed = false;

// A pattern is either a literal string (assert this exact text is present) or a
// RegExp (assert the shape is present, whatever the current value happens to be).
function present(text, pattern) {
  return pattern instanceof RegExp ? pattern.test(text) : text.includes(pattern);
}

for (const check of checks) {
  let text = "";
  try {
    text = readFileSync(check.file, "utf8");
  } catch (error) {
    console.error(`missing ${check.file}: ${error.message}`);
    failed = true;
    continue;
  }

  for (const pattern of check.patterns) {
    if (!present(text, pattern)) {
      console.error(`${check.file} missing required content: ${pattern}`);
      failed = true;
    }
  }
}

for (const check of forbidden) {
  let text = "";
  try {
    text = readFileSync(check.file, "utf8");
  } catch (error) {
    console.error(`missing ${check.file}: ${error.message}`);
    failed = true;
    continue;
  }

  for (const pattern of check.patterns) {
    if (present(text, pattern)) {
      console.error(`${check.file} contains forbidden content: ${pattern}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}
