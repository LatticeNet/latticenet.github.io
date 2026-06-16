import { readFileSync } from "node:fs";

const checks = [
  {
    file: "docs/index.md",
    patterns: [
      "Docker server first",
      "systemd node-agent",
      "GHCR image",
      "GitHub Release binaries",
      "Signed plugin index",
    ],
  },
  {
    file: "docs/guide/node-agent.md",
    patterns: [
      "lattice-agent-linux-amd64",
      "lattice-agent-linux-arm64",
      "SHA256SUMS",
      "lattice-agent.service",
      "`node-token` is a per-node bearer token",
      "The dashboard install script downloads the matching Linux release artifact",
    ],
  },
  {
    file: "docs/security/agent-updates.md",
    patterns: [
      "candidate's `-version` output must equal `target_version`",
      "SHA256SUMS",
      "auto-plan never auto-approves",
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
      "SDK contract: `github.com/LatticeNet/lattice-sdk v0.2.0`",
      "release tag order",
      "runner sandbox maturity",
    ],
  },
  {
    file: "docs/guide/docker-server.md",
    patterns: [
      "`:latest` is published only as a compatibility alias",
      "The first boot creates `data/master.key` automatically",
      "pointing it at a missing file makes startup fail closed",
      "fixes ownership of the mounted data directory",
      "conflicting server name",
      "Full (strict)",
      "Bypass cache",
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

if (failed) {
  process.exit(1);
}
