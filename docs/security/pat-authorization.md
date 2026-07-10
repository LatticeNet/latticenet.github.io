# PAT Authorization

Lattice personal access tokens (PATs) authorize API actions. They are not
publisher signing keys, node enrollment tokens, storage delivery tokens, or
browser session cookies.

## Credential types are not interchangeable

| Credential | Holder | Purpose | Must not be used for |
| --- | --- | --- | --- |
| Ed25519 signing seed/private key | Plugin publisher | Sign plugin manifests and artifact digests before release. | API login, lifecycle activation, or server runtime storage. |
| Ed25519 public key | Server operator and index readers | Verify a publisher signature. | Signing, authentication, or authorization. |
| Lattice PAT | Human operator or automation | Call scoped Lattice APIs with `Authorization: Bearer`. | Signing plugin releases or enrolling a node. |
| Node token | One node-agent | Authenticate that node to agent endpoints. | Dashboard administration or fleet-wide API access. |
| Storage token | A KV/static consumer or publisher | Access one storage surface according to its access mode. | General Lattice API authorization. |
| `lattice_session` cookie | An interactive browser session | Use the dashboard with CSRF protection and optional MFA policy. | Long-lived unattended automation. |

The signing seed proves **who published bytes**. A PAT proves **who may perform
an API action in this deployment**. A valid signature never grants operator
rights, and an administrator PAT cannot create a valid publisher signature.

## Least-privilege PATs

Create PATs under **Settings -> Access Tokens**. Prefer:

- one token per automation purpose;
- the smallest possible scope set;
- a short expiration for one-time operations;
- no node allowlist for a deliberately fleet-global control such as plugin
  lifecycle; and
- immediate revocation after temporary work is complete.

Do not use `*` when a narrow scope exists. Do not reuse a token created for
plugin activation for node tasks, network apply, storage, or audit export.

## Plugin administration

Plugin lifecycle is a fleet-wide administrative surface. The required scope is:

```txt
plugin:admin
```

It authorizes lifecycle listing and transitions through
`/api/plugins/lifecycle`. It does not grant `network:apply`, `task:run`,
`netguard:admin`, or any plugin-declared capability to the PAT holder.

Conversely, a token with `network:apply` or `task:run` cannot activate a plugin
unless it also has `plugin:admin`.

Node allowlists protect node-scoped endpoints. They should not be treated as a
way to subdivide fleet-global plugin lifecycle administration. Use a dedicated
PAT and scope instead.

## Safe non-interactive use

The plaintext token is shown once when created. Do not put it in source control,
manifest JSON, shell history, a compose file, or documentation.

A temporary local file can keep the token out of command history:

```sh
umask 077
read -s TOKEN
printf '%s' "$TOKEN" > /private/tmp/lattice-plugin-admin-token
unset TOKEN
```

Use the file without printing it:

```sh
TOKEN_FILE=/private/tmp/lattice-plugin-admin-token
curl -fsS \
  -H "Authorization: Bearer $(cat "$TOKEN_FILE")" \
  https://lattice.example.com/api/plugins/lifecycle
```

For a transition, send the exact plugin ID and next valid state:

```sh
curl -fsS \
  -H "Authorization: Bearer $(cat "$TOKEN_FILE")" \
  -H 'Content-Type: application/json' \
  --data '{"id":"latticenet.netguard","status":"installed"}' \
  https://lattice.example.com/api/plugins/lifecycle
```

Then make a separate reviewed request for `active`. Do not script a blind jump
or edit the state store directly.

After verification, revoke the PAT from **Settings -> Access Tokens**. Deleting
a local token file is not a substitute for server-side revocation.

## Browser sessions and PATs

Interactive dashboard mutations use the authenticated session plus CSRF token.
PAT bearer requests are non-interactive and do not use browser CSRF state. MFA
enrollment and passkey management remain interactive-session operations; a PAT
does not bypass those boundaries.

Use a browser session for attended operations and a PAT for narrow automation.
Do not export browser cookies to turn an interactive session into an automation
credential.

## Audit expectations

Plugin lifecycle changes produce principal-attributed audit events such as:

- `plugin.status` for persisted state changes; and
- `plugin.runtime` for runtime arm/stop outcomes.

The audit trail should identify the PAT or user principal without recording the
plaintext token. Treat a missing audit event, unexpected scope, or transition
that appears to skip the state machine as a release blocker.

Continue with [Plugin Lifecycle](/plugins/lifecycle) for the state machine and
[Plugin Trust](/security/plugin-trust) for publisher verification.
