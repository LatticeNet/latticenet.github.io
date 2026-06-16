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

Current authoring target: a verifiable local bundle. Remote marketplace install
and runtime activation are separate future workflows.

## Author Checklist

- Keep the capability list minimal.
- Prefer read-only capabilities first.
- Never embed credentials in the manifest.
- Publish SHA-256 digest and signature for each artifact.
- Document rollback and failure behavior.
- Use plan/review/apply for host mutation.
- Treat the marketplace index as metadata until install and runner gates are
  implemented.

## Good First Official Plugins

- sing-box profile manager.
- xray profile manager.
- Sub-Store supervisor and reverse proxy.
- notification channel adapters.
- read-only dashboard cards.

Avoid community host mutation plugins until runner sandboxing, limits, audit,
and rollback behavior have matured.
