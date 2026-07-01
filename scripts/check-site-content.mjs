import { readFileSync } from "node:fs";

const SDK_BASELINE = "v0.2.14";
const AGENT_EXAMPLE_VERSION = "v0.2.8";
const AGENT_EXAMPLE_TARGET_VERSION = AGENT_EXAMPLE_VERSION.replace(/^v/, "");
const NEXT_AGENT_EXAMPLE_VERSION = "v0.2.9";

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
      `VERSION=${AGENT_EXAMPLE_VERSION}`,
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
      `target version: ${AGENT_EXAMPLE_TARGET_VERSION}`,
      `releases/download/${AGENT_EXAMPLE_VERSION}/lattice-agent-linux-amd64`,
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
      "Plugin artifact execution is still disabled by default",
    ],
  },
  {
    file: "docs/developers/index.md",
    patterns: [
      `Latest published SDK tag: \`github.com/LatticeNet/lattice-sdk ${SDK_BASELINE}\``,
      `\`lattice-server\` currently consumes \`${SDK_BASELINE}\``,
      "`lattice-node-agent` currently",
      `consumes \`${SDK_BASELINE}\``,
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
      `target version: latest or ${AGENT_EXAMPLE_TARGET_VERSION}`,
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
    if (!text.includes(pattern)) {
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
    if (text.includes(pattern)) {
      console.error(`${check.file} contains forbidden content: ${pattern}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}
