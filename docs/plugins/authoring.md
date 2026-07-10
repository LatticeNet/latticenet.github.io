# Plugin Authoring

Start with:

```txt
https://github.com/LatticeNet/lattice-plugin-template
```

Plugin types:

- `system`: trusted first-party or operator-audited host operations.
- `worker`: narrow static/route/KV extension.
- `wasm`: future sandboxed third-party extension tier.

Every plugin declares capabilities. Unknown capabilities are rejected. Host-risk
capabilities require trusted publisher signatures unless the operator explicitly
opts into local development risk.

Current authoring target: a verifiable local bundle with the minimum capability
set and a documented runtime contract. Remote marketplace install remains a
future workflow. Trusted local system plugins may use the bounded system runner
only after explicit lifecycle activation.

## Author Checklist

- Keep the capability list minimal.
- Prefer read-only capabilities first.
- Never embed credentials in the manifest.
- Publish SHA-256 digest and signature for each artifact.
- Document rollback and failure behavior.
- Use plan/review/apply for host mutation.
- Treat the marketplace index as metadata until install and runner gates are
  implemented.
- Treat signing and activation as separate ceremonies: the publisher signs;
  an operator with `plugin:admin` activates.

## Good First Official Plugins

- sing-box profile manager.
- xray profile manager.
- Sub-Store supervisor and reverse proxy.
- notification channel adapters.
- read-only dashboard cards.

Avoid community host mutation plugins until runner sandboxing, limits, audit,
and rollback behavior have matured.

See [Plugin Lifecycle](/plugins/lifecycle) and
[Plugin Trust](/security/plugin-trust) before publishing a host-risk bundle.
