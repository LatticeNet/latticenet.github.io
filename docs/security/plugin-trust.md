# Plugin Trust

Lattice plugin security has two independent authorities:

- a **publisher signature** proves which publisher signed a specific manifest,
  digest, capability set, and declarative UI contribution; and
- an **operator identity** authorizes lifecycle changes in one Lattice
  deployment.

Do not substitute one for the other. The publisher's Ed25519 seed is not a
Lattice API token, and a `plugin:admin` PAT is not a signing key.

## Key material

| Material | Where it belongs | Purpose |
| --- | --- | --- |
| Ed25519 seed/private key | Offline or tightly controlled publisher release environment | Sign release manifests. Never commit, upload to the server, or paste into an API request. |
| Ed25519 public key | Operator trust policy and signed index metadata | Verify signatures. Safe to distribute after its fingerprint is authenticated. |
| Artifact SHA-256 | Signed manifest and release metadata | Bind the signature to exact artifact bytes. |
| Lattice PAT | Operator/automation secret store | Authorize scoped API calls such as lifecycle transitions. |

A typical publisher directory may contain a `*.seed`, a `*.pub`, and a README.
Only the public key belongs in the server trust policy. Protect the seed with
`0600` permissions, an encrypted backup, and a documented rotation procedure.

## Trust policy

`LATTICE_PLUGIN_TRUST` is a path to the operator policy JSON file; it is not
inline JSON or key material. The file maps publisher IDs to base64 Ed25519
public keys:

```json
{
  "trusted_publishers": {
    "latticenet": "base64-encoded-32-byte-public-key"
  },
  "allow_unsigned_host_risk": false
}
```

Production should keep `allow_unsigned_host_risk` false. Enabling it opts out
of signature enforcement for host-risk plugins and is a local development
escape hatch, not an incident-recovery technique.

Publisher-key rotation is a coordinated release: authenticate the new public
key out of band, re-sign affected bundles, update the trust policy and bundles,
restart, and confirm zero loader rejections. Do not overwrite a public key while
leaving production bundles signed only by the old seed.

## Verification boundary

The loader verifies strict manifest structure, known capabilities, fixed
artifact path, SHA-256 digest, trusted publisher, and Ed25519 signature. Signed
data includes declarative UI and interface contracts, so tampering with plugin
navigation or exposed methods invalidates verification.

Current foundation:

- manifest validation;
- artifact SHA-256 digest pinning;
- Ed25519 publisher signatures for host-risk plugins;
- trusted publisher policy;
- startup loader from `LATTICE_PLUGIN_DIR`;
- validated lifecycle state in server storage;
- capability-scoped broker;
- a bounded Tier-2 runner for trusted `system` plugins; and
- audited host API calls.

The system runner stages a private executable copy, uses arg-vector execution
without a shell, strips the environment, applies deadlines and output limits,
and trips a circuit breaker after repeated failures. Worker and wasm execution
remain separate sandbox-maturity decisions.

A verified bundle is still inert until an operator moves it through
`verified -> installed -> active`. UI contributions are active-only. See
[Plugin Lifecycle](/plugins/lifecycle).

## Bundle Layout

```txt
plugins/
  example.plugin/
    manifest.json
    artifact
```

The manifest may not point the loader at arbitrary paths. The artifact filename
is fixed and digest-pinned.

## Marketplace Policy

The first marketplace should be a read-only signed index. Installation should
still require:

1. fetch manifest and artifact;
2. verify digest and publisher signature;
3. show capability risks;
4. approve install;
5. register lifecycle state.

Community host-risk plugins should remain blocked by default.

Marketplace install should remain separate from activation, and activation
should depend on runner sandbox maturity for the selected plugin tier. The
current trusted system runner does not make arbitrary community plugins safe.

## Operator authorization

Lifecycle endpoints require `plugin:admin`. Use an authenticated browser
session or a dedicated short-lived PAT. Never copy a signing seed into a token
field or onto the production server. See [PAT Authorization](/security/pat-authorization).
