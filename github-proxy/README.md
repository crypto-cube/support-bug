# GitHub API Proxy

Cloudflare Worker that proxies GitHub API requests, keeping the GitHub token server-side. The frontend authenticates with a separate proxy token.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/crypto-cube/support-bug/tree/master/github-proxy)

## Post-deployment setup

After deploying the worker, set the two required secrets:

```bash
# Your GitHub Personal Access Token (needs repo scope)
npx wrangler secret put GITHUB_TOKEN

# A random string the frontend uses to authenticate with the proxy
# Generate one with: openssl rand -hex 32
npx wrangler secret put PROXY_TOKEN
```

Then update `ticket.html` with your worker URL and proxy token:

```js
const REPO        = "owner/repo";
const PROXY_URL   = "https://github-proxy.<you>.workers.dev";
const PROXY_TOKEN = "<your-proxy-token>";
```

## Allowed routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/repos/{owner}/{repo}/issues` | List issues |
| `POST` | `/repos/{owner}/{repo}/issues` | Create issue |
| `PUT` | `/repos/{owner}/{repo}/contents/{path}` | Upload file |

All other routes return `403 Forbidden`.

## Development

```bash
npm install
npm run dev      # start local dev server on :8787
npm test         # run tests
```

## How it works

1. `OPTIONS` requests get a `204` with CORS headers (preflight)
2. All other requests must include `Authorization: Bearer <PROXY_TOKEN>`
3. The request path is checked against the allowlist above
4. Valid requests are forwarded to `https://api.github.com` with the real `GITHUB_TOKEN` injected
5. GitHub's response is returned with CORS headers added
