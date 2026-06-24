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

## Google (Google Cloud / Workspace)

Google is a standard OIDC provider. Configure it in **Google Cloud Console ->
APIs & Services -> Credentials -> Create credentials -> OAuth client ID**:

| Google Console field | Value |
| --- | --- |
| Application type | **Web application** |
| Authorized redirect URIs | `https://lattice.example.com/api/auth/oidc/callback` — exactly `LATTICE_PUBLIC_URL` + `/api/auth/oidc/callback`, including scheme/host, with no trailing slash |
| Authorized JavaScript origins | **Leave empty** (see callout below) |
| Name | Any label; only shown inside the Google console |

Then in Lattice set **Issuer** to `https://accounts.google.com` and paste the
Client ID and Client secret. Google may take a few minutes to apply changes.

> **Authorized JavaScript origins are not needed.** Lattice uses the server-side
> Authorization code + PKCE flow with a confidential client: the browser is
> redirected to Google and back to the server callback, and the server exchanges
> the code for tokens server-to-server. The browser never calls Google's token
> or userinfo endpoints directly, so the "Authorized JavaScript origins" field
> (only required for browser-side / implicit flows) is left blank. Only the
> **Authorized redirect URI** matters.

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

Use **Test connection** in the dialog to probe the issuer before saving. It
fetches `<issuer>/.well-known/openid-configuration` and reports the resolved
authorization and token endpoints. A green result means the Issuer is correct
and reachable; a red result means the URL is wrong or the provider is
unreachable. (It checks discovery only — not the client secret or redirect URI.)

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

Because there is no separate email field, the local user's **username must be
the verified IdP email** (for Google, the full Gmail/Workspace address). To let
an existing operator sign in via SSO, give that operator a local user whose
username equals their IdP email; the bootstrap `admin` account, whose username is
`admin`, will not match an email until you rename it or create a matching user.

## Verify

Three checks, quickest to most thorough:

1. **Test connection (dialog):** In **Settings -> Single Sign-On**, open the
   provider and click **Test connection**. Success confirms issuer discovery
   works and shows the resolved endpoints. It does not exercise the client
   secret or redirect URI — only that the Issuer is reachable.
2. **The start redirect:** confirm the login-start endpoint redirects (HTTP 302)
   to your IdP with the right `client_id` and `redirect_uri`:

   ```txt
   curl -sI 'https://lattice.example.com/api/auth/oidc/start?provider=<provider-id>'
   ```

   The `Location:` header should point at the IdP authorization URL (for Google,
   `https://accounts.google.com/o/oauth2/v2/auth?...`) and carry your `client_id`
   and `redirect_uri=https://lattice.example.com/api/auth/oidc/callback`. A
   `200`/HTML response means the provider is missing or disabled, or
   `LATTICE_PUBLIC_URL` is unset.
3. **A real login:** sign out, click the provider button on the login page, and
   complete the IdP flow. On failure the browser returns to the login page with
   `?sso_error=<code>` (below); the detailed cause is only in the server log —
   grep it for `oidc callback exchange` and `sso_error`.

## Common Failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Provider does not appear on the login page | `LATTICE_PUBLIC_URL` is unset, provider is disabled, or no provider is configured. | Set the public URL and enable the provider. |
| IdP says redirect URI mismatch | The IdP callback URL differs from Lattice's fixed callback path. | Register `https://lattice.example.com/api/auth/oidc/callback` exactly. |
| Login redirects back with `sso_error=denied` | IdP identity did not map to a pre-created local user or allowed domain failed. | Create the local user with the verified email as username, or adjust allowed domains. |
| Login redirects back with `sso_error=verify_failed` | Issuer, client secret, nonce, or token verification failed. | Re-check issuer URL, client ID, client secret, and IdP clock/time settings. |
| Login redirects back with `sso_error=csrf` | Browser lost the OIDC binding cookie during the redirect. | Keep the same hostname, avoid cross-site proxy rewrites, and keep secure cookies enabled behind HTTPS. |
| Login redirects back with `sso_error=expired` | The one-time login state (10 min TTL) elapsed before the callback returned. | Start the login again; don't leave the IdP consent screen open too long. |
| Login redirects back with `sso_error=ip_mismatch` | The client IP changed between starting login and the callback. | Common behind rotating-egress proxies/VPNs; use a stable egress, or front Lattice so the client IP is consistent. |
| Login redirects back with `sso_error=unavailable` | The provider was deleted or disabled mid-flow, or `LATTICE_PUBLIC_URL` became unset. | Re-enable the provider and keep the public URL set. |
| Login redirects back with `sso_error=provider_error` | The IdP returned an error (user denied consent, or admin consent is required). | Check the IdP app's consent/permissions, then retry. |
| Login redirects back with `sso_error=bad_request` | The callback arrived without the expected `state`/`code` (often a stale or hand-edited URL). | Start the login from the Lattice login page, not a saved callback URL. |

## Security Notes

SSO does not bypass local RBAC scopes, PAT restrictions, node allowlists, CSRF
protection, or TOTP. It only changes the first identity-proof step.
