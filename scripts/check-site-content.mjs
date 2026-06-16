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
