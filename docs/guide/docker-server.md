# Docker Server

Use Docker for `lattice-server`. Use systemd for `lattice-node-agent`.

The public image is:

```txt
ghcr.io/latticenet/lattice-server
```

Use `:latest` for the current stable image, `:alpha` for the moving alpha test
channel, and a version tag or digest for unattended production deployments.
There is intentionally no `main` image channel.

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
reverse proxy in front of it.

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

After orange-clouding DNS, `dig lattice.example.com` should return Cloudflare
addresses rather than the origin IP. The functional check is still:

```sh
curl -fsS https://lattice.example.com/api/health
curl -I https://lattice.example.com/api/health | grep -iE 'cf-cache-status|server|location'
```

`/api/health` should not be a cache `HIT`.

## Required settings

```ini
LATTICE_ADMIN_PASSWORD=replace-with-a-long-random-password
LATTICE_PUBLIC_URL=https://lattice.example.com
LATTICE_SECURE_COOKIES=1
LATTICE_TRUST_PROXY=1
```

Use `LATTICE_TRUST_PROXY=1` only when the only public path is a trusted reverse
proxy that sets client IP headers correctly.

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
