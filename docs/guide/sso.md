# Single Sign-On

Lattice supports OIDC single sign-on for operator login. SSO is an additional
login path, not a replacement for Lattice-local authorization:

- the IdP proves the operator identity;
- Lattice maps that identity to a pre-created local user;
- Lattice still issues its own `lattice_session` cookie;
- Lattice-local TOTP is still required when enabled on that user.

## Prerequisites

Set the public URL on the server so callback URLs are stable:

```ini
LATTICE_PUBLIC_URL=https://lattice.example.com
LATTICE_SECURE_COOKIES=1
```

The redirect URI to register in your identity provider is:

```txt
https://lattice.example.com/api/auth/oidc/callback
```

The path is shared by all OIDC providers. Lattice recovers the selected provider
from the stored login state.

## IdP Application

Create a confidential web application in your identity provider:

| IdP field | Value |
| --- | --- |
| Application type | Web application / server-side app / confidential client |
| Redirect URI / callback URL | `https://lattice.example.com/api/auth/oidc/callback` |
| Grant type | Authorization code |
| PKCE | Enabled or allowed |
| Client authentication | Client secret |
| Scopes | `openid profile email` |

Copy the generated Client ID and Client Secret into Lattice.

## Lattice Fields

Open **Settings -> Single Sign-On -> New provider**.

The dialog shows the redirect URI for the current dashboard origin. If the
dashboard is served at `https://lattice.example.com`, the value is:

```txt
https://lattice.example.com/api/auth/oidc/callback
```

Copy that exact value into the IdP application before saving the Lattice
provider. Behind a reverse proxy, the origin must match `LATTICE_PUBLIC_URL`.

| Lattice field | What it means | What to enter |
| --- | --- | --- |
| Display name | Human label shown on the login button. | `Google Workspace`, `Authelia`, `Keycloak`, or any operator-friendly name. |
| Issuer | OIDC discovery base URL. Lattice reads `/.well-known/openid-configuration` from this URL. | The issuer exactly as published by your IdP, for example `https://accounts.google.com` or `https://idp.example.com/realms/lattice`. |
| Client ID | Public identifier of the IdP application. | The Client ID from the IdP app. |
| Client secret | Confidential secret for the IdP application. | The Client Secret from the IdP app. It is write-only in Lattice and is not returned by the API. |
| Scopes | OIDC scopes requested during login. | Start with `openid, profile, email`. Keep `openid` and `email` unless your IdP maps email differently. |
| Allowed domains | Email-domain gate after the IdP verifies the user. | `example.com, corp.example.com`, or leave empty to allow any verified email that maps to a local user. |
| Enabled | Whether this provider appears on the login screen. | Enable after the IdP app and local user mapping are ready. |

The dashboard form includes the same field guide inline, so an operator can
configure a new provider without keeping this page open.

## User Mapping

Lattice intentionally does not auto-create operator users from SSO. Before the
first SSO login, create a local user whose username matches the verified IdP
email address.

On first successful login, Lattice binds:

```txt
provider id + provider subject -> local user id
```

After binding, future logins use the stable provider subject. If the user changes
email at the IdP, the existing subject binding still points at the same local
user.

## Common Failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Provider does not appear on the login page | `LATTICE_PUBLIC_URL` is unset, provider is disabled, or no provider is configured. | Set the public URL and enable the provider. |
| IdP says redirect URI mismatch | The IdP callback URL differs from Lattice's fixed callback path. | Register `https://lattice.example.com/api/auth/oidc/callback` exactly. |
| Login redirects back with `sso_error=denied` | IdP identity did not map to a pre-created local user or allowed domain failed. | Create the local user with the verified email as username, or adjust allowed domains. |
| Login redirects back with `sso_error=verify_failed` | Issuer, client secret, nonce, or token verification failed. | Re-check issuer URL, client ID, client secret, and IdP clock/time settings. |
| Login redirects back with `sso_error=csrf` | Browser lost the OIDC binding cookie during the redirect. | Keep the same hostname, avoid cross-site proxy rewrites, and keep secure cookies enabled behind HTTPS. |

## Security Notes

SSO does not bypass local RBAC scopes, PAT restrictions, node allowlists, CSRF
protection, or TOTP. It only changes the first identity-proof step.
