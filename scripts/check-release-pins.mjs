// check-release-pins — asserts that versions a reader PASTES match their source
// of truth, rather than matching a constant someone typed here.
//
// The distinction this exists for (rules/04, ruled 2026-07-28): prose explaining
// a mechanism should assert the SHAPE of the explanation, because values drift
// and mechanisms do not. But a command a reader copies must be concrete AND
// correct, so the only honest guard compares its value to the release it claims
// to be. Genericising such a page makes it unusable; dating it does nothing for
// someone who pastes it a month later.
//
// Failing at the right moment is the point: the day a new stable release lands
// and the docs have not caught up, this goes red — which is exactly when
// rules/04 already requires the doc update to ride the change.
//
// Network: this check reads the public releases API. It never skips silently.
// If you are offline, set SKIP_RELEASE_PIN_CHECK=1 and it will say so loudly and
// exit non-zero-free, so an intentional skip is visible in the log rather than
// indistinguishable from a pass.

import { readFileSync } from "node:fs";

const PINS = [
  {
    file: "docs/guide/node-agent.md",
    repo: "LatticeNet/lattice-node-agent",
    // The install guide must point at the latest STABLE release: prereleases
    // exist for this repo and are deliberately not what an operator installs.
    pattern: /VERSION=(v\d+\.\d+\.\d+)\b/,
    label: "node-agent install VERSION",
  },
  // The site renders versions from one data file rather than repeating them in
  // prose. That removes the drift-in-three-places problem but creates a new
  // one: the single source can itself go stale silently. These pins close it.
  //
  // Only the entries marked `verify: 'latest-stable'` in versions.ts are
  // checked here. Prerelease lanes deliberately are not: an image tag like
  // alpha-0.2.2a6 is not a GitHub release and has no API to compare against,
  // and asserting it would mean asserting a constant against itself.
  {
    file: "docs/.vitepress/data/versions.ts",
    repo: "LatticeNet/lattice-node-agent",
    pattern: /repo:\s*'LatticeNet\/lattice-node-agent',\s*\n\s*version:\s*'(v\d+\.\d+\.\d+)'/,
    label: "versions.ts lattice-agent",
  },
  {
    file: "docs/.vitepress/data/versions.ts",
    repo: "LatticeNet/lattice-sdk",
    pattern: /repo:\s*'LatticeNet\/lattice-sdk',\s*\n\s*version:\s*'(v\d+\.\d+\.\d+)'/,
    label: "versions.ts lattice-sdk",
    // The SDK is consumed as a Go module, where `go get …@vX.Y.Z` resolves the
    // TAG. A GitHub Release is presentation; the tag is the artifact. Checking
    // this one against the releases API reported v0.2.18 as wrong when it is
    // exactly what a consumer gets — the repo simply has a tag with no release
    // attached. Compare against the thing that actually determines the version.
    source: "tags",
  },
];

if (process.env.SKIP_RELEASE_PIN_CHECK === "1") {
  console.log("check-release-pins: SKIPPED by SKIP_RELEASE_PIN_CHECK=1 — pinned versions were NOT verified");
  process.exit(0);
}

async function latestStable(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
    headers: {
      accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`releases API for ${repo}: HTTP ${res.status}`);
  const releases = await res.json();
  const stable = releases.filter((r) => !r.draft && !r.prerelease && /^v\d+\.\d+\.\d+$/.test(r.tag_name));
  if (stable.length === 0) throw new Error(`no stable release found for ${repo}`);
  // The API returns newest first by creation; compare numerically to be sure.
  stable.sort((a, b) => cmpVersion(b.tag_name, a.tag_name));
  return stable[0].tag_name;
}

async function latestStableTag(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}/tags?per_page=100`, {
    headers: {
      accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`tags API for ${repo}: HTTP ${res.status}`);
  const tags = await res.json();
  const stable = tags.filter((t) => /^v\d+\.\d+\.\d+$/.test(t.name));
  if (stable.length === 0) throw new Error(`no stable tag found for ${repo}`);
  stable.sort((a, b) => cmpVersion(b.name, a.name));
  return stable[0].name;
}

function cmpVersion(a, b) {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

let failed = 0;
for (const pin of PINS) {
  const contents = readFileSync(pin.file, "utf8");
  const found = contents.match(pin.pattern);
  if (!found) {
    console.error(`check-release-pins: ${pin.label} — pattern ${pin.pattern} not found in ${pin.file}`);
    failed += 1;
    continue;
  }
  const documented = found[1];
  const usingTags = pin.source === "tags";
  const actual = usingTags ? await latestStableTag(pin.repo) : await latestStable(pin.repo);
  const what = usingTags ? "latest stable tag" : "latest stable release";
  if (documented === actual) {
    console.log(`check-release-pins: ${pin.label} = ${documented}, matches ${what} of ${pin.repo}`);
  } else {
    console.error(
      `check-release-pins: ${pin.label} is ${documented} but ${pin.repo}'s ${what} is ${actual} — ` +
        `a reader pasting this installs the wrong version (rules/04: the doc update rides the release)`,
    );
    failed += 1;
  }
}

console.log(`check-release-pins: ${PINS.length - failed}/${PINS.length} pinned version(s) verified against their source`);
process.exit(failed === 0 ? 0 : 1);
