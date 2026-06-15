# Plugin Index Format

The marketplace index is a static JSON document. It should be easy to mirror,
cache, diff, and sign.

Minimal shape:

```json
{
  "schema": "lattice.plugin.index.v1",
  "generated_at": "2026-06-15T00:00:00Z",
  "publishers": [
    {
      "id": "latticenet",
      "name": "LatticeNet",
      "public_key_ed25519": "base64-public-key"
    }
  ],
  "plugins": [
    {
      "id": "latticenet.sing-box",
      "name": "sing-box Manager",
      "publisher": "latticenet",
      "type": "system",
      "latest": "0.1.0",
      "capabilities": ["network:plan", "network:apply", "node:read"],
      "releases": [
        {
          "version": "0.1.0",
          "manifest_url": "https://example.invalid/manifest.json",
          "artifact_url": "https://example.invalid/artifact",
          "artifact_sha256": "64-lowercase-hex",
          "signature_ed25519": "base64-signature"
        }
      ]
    }
  ]
}
```

The index itself should also be signed before the server supports remote
install. A plugin entry is not trusted until the artifact digest and manifest
signature verify against the operator's trusted publisher policy.
