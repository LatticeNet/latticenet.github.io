# Docker Server

Use Docker for `lattice-server`. Use systemd for `lattice-node-agent`.

The public image is:

```txt
ghcr.io/latticenet/lattice-server
```

Use `:latest` for the current stable image, published by the moving `latest`
git tag. Use `:alpha` for the moving alpha test channel, and a version tag or
digest for unattended production deployments that must not move. There is
intentionally no `main` image channel.

## Compose

```sh
git clone https://github.com/LatticeNet/lattice.git
cd lattice/compose
cp .env.example .env
$EDITOR .env
mkdir -p data plugins
docker compose up -d
```

The compose file binds the server to `127.0.0.1:8088`. Put a trusted HTTPS
reverse proxy in front of it — see [HTTPS reverse proxy](#https-reverse-proxy)
and [Cloudflare](#cloudflare) below.

The first boot creates `data/master.key` automatically. Do not set
`LATTICE_MASTER_KEY_FILE` unless you are mounting an existing key from a restore
or secret manager; pointing it at a missing file makes startup fail closed.

The image entrypoint fixes ownership of the mounted data directory before
dropping privileges to the `lattice` user, so a root-created `./data` directory
from the quickstart works without running the server process as root.

Verify the local container before adding public DNS:

```sh
docker compose ps
curl -fsS http://127.0.0.1:8088/api/health
```

The health endpoint should return:

```json
{"status":"ok"}
```

The version endpoint returns build metadata used by the dashboard About page:

```sh
curl -fsS http://127.0.0.1:8088/api/version
```

## HTTPS reverse proxy

Keep the container bound to localhost and publish HTTPS through NGINX, Caddy, a
Cloudflare Tunnel, or another trusted edge. With NGINX on Debian:

```sh
apt update
apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/lattice.conf`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name lattice.example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    server_name lattice.example.com;

    ssl_certificate /etc/letsencrypt/live/lattice.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lattice.example.com/privkey.pem;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

Enable the site and issue the certificate:

```sh
ln -sf /etc/nginx/sites-available/lattice.conf /etc/nginx/sites-enabled/lattice.conf
nginx -t
certbot --nginx -d lattice.example.com
systemctl reload nginx
```

If Certbot writes the same `server_name` into
`/etc/nginx/sites-enabled/default`, NGINX will log `conflicting server name` and
may ignore the Lattice reverse proxy. Check and remove duplicate enabled sites:

```sh
grep -R "server_name lattice.example.com" -n /etc/nginx/sites-enabled /etc/nginx/sites-available
unlink /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

Validate the proxy locally and publicly:

```sh
curl -fsS --resolve lattice.example.com:443:127.0.0.1 https://lattice.example.com/api/health
curl -fsS https://lattice.example.com/api/health
```

## Cloudflare

For a proxied `lattice.example.com` record:

- DNS -> Records: create or edit `A lattice <origin-ip>` and set Proxy status to
  `Proxied`.
- SSL/TLS -> Overview: set encryption mode to `Full (strict)`. Do not use
  `Flexible` when the origin already has a valid certificate.
- SSL/TLS -> Edge Certificates: `Always Use HTTPS` can be on.
- SSL/TLS -> Edge Certificates: `Automatic HTTPS Rewrites` can be on.
- Caching -> Cache Rules: create a bypass rule for the API path:

```txt
(http.host eq "lattice.example.com" and starts_with(http.request.uri.path, "/api/"))
```

Set the rule action to `Bypass cache`. Do not add `Cache Everything` for the
dashboard until every authenticated and API path has an explicit bypass.

The server sends explicit dashboard cache headers:

| Path | Cache behavior |
| --- | --- |
| `/`, `/login`, and other SPA fallback routes | `Cache-Control: no-cache` so the browser and edge revalidate the current app shell after each deploy. |
| `/theme-init.js` | `Cache-Control: no-cache` because it is a boot-time behavior file, not a hashed chunk. |
| `/assets/*` | `Cache-Control: public, max-age=31536000, immutable` because Vite emits content-hashed files. |

Keep Cloudflare on the default behavior that respects origin cache headers. If a
previous rule cached the whole dashboard, purge the hostname once after deploying
the fixed server so stale `index.html` does not point at old chunk names.

After orange-clouding DNS, `dig lattice.example.com` should return Cloudflare
addresses rather than the origin IP. The functional check is still:

```sh
curl -fsS https://lattice.example.com/api/health
curl -I https://lattice.example.com/api/health | grep -iE 'cf-cache-status|server|location'
```

`/api/health` should not be a cache `HIT`.

For dashboard deploy checks:

```sh
curl -I https://lattice.example.com/ | grep -i '^cache-control:'
curl -I https://lattice.example.com/login | grep -i '^cache-control:'
```

Both should report `no-cache`. Hashed files under `/assets/` should be immutable.

If you use Platform -> KV Store or Platform -> Static host bindings, route those
hostnames or IPs to the same origin and keep `proxy_set_header Host $host;` in
the reverse proxy. See [Storage Hosting](/guide/storage-hosting) for bucket,
binding, and access-token semantics.

### Restore the real client IP

With the Cloudflare proxy on, NGINX sees a Cloudflare **edge** IP in
`$remote_addr`, not the visitor. Rate limiting, the audit log, and session
security all rely on the real client address — otherwise every visitor looks
identical and blocking one Cloudflare IP blocks everyone behind it.

Generate `/etc/nginx/conf.d/cloudflare-realip.conf` from Cloudflare's published
ranges so it stays current:

```sh
{
  curl -fsS https://www.cloudflare.com/ips-v4 | sed 's/^/set_real_ip_from /; s/$/;/'
  curl -fsS https://www.cloudflare.com/ips-v6 | sed 's/^/set_real_ip_from /; s/$/;/'
  echo 'real_ip_header CF-Connecting-IP;'
} | sudo tee /etc/nginx/conf.d/cloudflare-realip.conf
sudo nginx -t && sudo systemctl reload nginx
```

`set_real_ip_from`/`real_ip_header` must live in the `http {}` context, which is
where `conf.d/*.conf` is included. Also set `LATTICE_TRUST_PROXY=1` (see
[Required settings](#required-settings)) so the server trusts `CF-Connecting-IP`.

### Lock the origin to Cloudflare

Restoring the real IP does not stop someone from hitting the origin IP directly
and bypassing Cloudflare. Reject any request whose TCP peer is not a Cloudflare
edge.

The subtlety: once `real_ip_header` is active, `$remote_addr` is the visitor, so
an `allow`/`deny` on it would block real users. Gate on **`$realip_remote_addr`**
instead — that keeps the original TCP peer (the Cloudflare edge for proxied
traffic, the attacker for a direct hit). Append a `geo` map built from the same
ranges to `conf.d/cloudflare-realip.conf`:

```nginx
# 1 = the request's TCP peer is Cloudflare (or loopback); 0 = direct/bypass.
geo $realip_remote_addr $lattice_cf_ok {
    default 0;
    127.0.0.1 1;
    ::1 1;
    # ...every Cloudflare v4 and v6 range, e.g.:
    173.245.48.0/20 1;
    2400:cb00::/32 1;
}
```

Then add the guard inside the **443** server block (leave port 80 open so ACME
renewals keep working):

```nginx
    if ($lattice_cf_ok = 0) { return 403; }
```

Verify after `nginx -t && systemctl reload nginx`:

```sh
# Through Cloudflare -> expect 200:
curl -s -o /dev/null -w '%{http_code}\n' https://lattice.example.com/api/health
# Straight to the origin IP, bypassing Cloudflare -> expect 403:
curl -s -o /dev/null -w '%{http_code}\n' \
  --resolve lattice.example.com:443:<ORIGIN_IP> https://lattice.example.com/api/health
```

For an even stronger lock, enable Cloudflare **Authenticated Origin Pulls** or
restrict port 443 at the host firewall to Cloudflare's ranges.

### Disable Cloudflare features that break the dashboard CSP

The dashboard ships a strict Content-Security-Policy (no inline scripts, no
`eval`). Several Cloudflare features inject inline scripts or rewrite the page
and are blocked by that CSP — disable them for this hostname:

| Feature | Cloudflare dashboard path | Why |
| --- | --- | --- |
| Rocket Loader | Speed -> Optimization -> Content Optimization | Injects an inline loader script |
| Auto Minify (JS) | Speed -> Optimization -> Content Optimization | Rewrites bundled JS (removed on newer accounts) |
| Email Obfuscation | Scrape Shield | Injects an inline email-decode script |
| Mirage | Speed -> Optimization -> Image Optimization | Rewrites image loading |
| Web Analytics beacon | Analytics & Logs -> Web Analytics | Injects inline `beacon.min.js` — the `CF-beacon` CSP error |

The automatic Web Analytics beacon is the usual source of a
`Refused to load ... beacon.min.js` console error. Turn off automatic injection,
or, to keep the analytics, add `https://static.cloudflareinsights.com` to
`script-src` and `https://cloudflareinsights.com` to `connect-src` in the CSP.

## Required settings

```ini
LATTICE_ADMIN_USERNAME=admin
LATTICE_ADMIN_PASSWORD=replace-with-a-long-random-password
LATTICE_PUBLIC_URL=https://lattice.example.com
LATTICE_SECURE_COOKIES=1
LATTICE_TRUST_PROXY=1
```

`LATTICE_ADMIN_USERNAME` and `LATTICE_ADMIN_PASSWORD` are first-boot bootstrap
settings. Once the state file contains a user, changing either variable does not
rename the current account or rotate its password. Rotate the password from
Settings -> Security, or call authenticated `POST /api/auth/password`.

Use `LATTICE_TRUST_PROXY=1` only when the only public path is a trusted reverse
proxy that sets client IP headers correctly.

Fleet Map IP lookup is enabled by default with the no-token
`https://ipwho.is/{ip}` HTTPS JSON API, so you do not need to create an IPInfo
token for auto-location. To disable external lookup:

```ini
LATTICE_GEOIP_LOOKUP_URL=off
```

To use a self-hosted or internal provider instead, set
`LATTICE_GEOIP_LOOKUP_URL` to an HTTPS URL template containing `{ip}`. Manual
coordinates do not require external lookup.

### Request logging

The server logs HTTP requests with method, path, status, response size,
latency, client IP, and request id. It is quiet by default: only requests
slower than the threshold (or `5xx`) are logged, so it is safe to leave on.

```ini
# Log every request, not just slow ones (verbose).
LATTICE_ACCESS_LOG=1
# Slow-request threshold in milliseconds (default 1000).
LATTICE_SLOW_REQUEST_MS=1000
```

Slow entries are tagged `SLOW request` in the container logs
(`docker compose logs -f lattice-server`). The dashboard mirrors this in the
browser: every API call is timed in the console (`debug` level; slow calls are
promoted to `warn`), and the last slow calls are kept on `window.__latticePerf`.

## Persistent data

Back up these together:

```txt
state.json
state.json.audit-wal
logs.db
master.key
```

Losing `master.key` makes encrypted secrets unrecoverable.

## Plugin directory

Marketplace entries are metadata until install and runner workflows mature.
Local plugin bundles live under `LATTICE_PLUGIN_DIR`. The recommended server
mount is read-only:

```txt
./plugins -> /plugins:ro
```

## Agent boundary

Do not deploy `lattice-node-agent` as the primary Docker path. The agent applies
host-local operations such as nft rules, service restarts, binary replacement,
and log tailing. Run it as a host binary managed by systemd.

## Detailed source

The compose files and longer tutorial live in the umbrella repo:

```txt
https://github.com/LatticeNet/lattice/tree/main/compose
https://github.com/LatticeNet/lattice/blob/main/docs/tutorials/docker-server.md
```
