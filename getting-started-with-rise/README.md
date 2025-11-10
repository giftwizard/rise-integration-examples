## Getting Started: Integrate Your App with Rise APIs

This guide helps you integrate with Rise quickly. Choose the path that fits your use case, then follow the copy‑pasteable steps.

### Choose your auth model
- **API Key (single merchant)**: Best if you are a shop owner building an integration for your own store. The API key belongs to your merchant account; each shop needs its own key.
- **OAuth App (multi‑merchant)**: Best if you are building an app for many shops. Examples: a POS platform that integrates with Rise, a Shopify app that merchants can install, or any multi-tenant application. Each merchant installs your app; your app authenticates via OAuth using your App ID/Secret and the merchant's `instanceId`.

If you build only for your own store → use API Key. If you build an app others can install → use OAuth App.

---

### Option A: API Key (single merchant)

1) Get your API Key
- You are the merchant. In your Rise dashboard, generate an API key under the Developer Tool page. Keep it secret.

2) Call Rise APIs with the API key
- We provide SDKs in several languages to simplify integration. See our [SDK documentation](../) for details.
- Alternatively, send requests directly with `Authorization: <API_KEY>`, `Content-Type: application/json` and `rise-account-id: <ACCOUNT_ID>` headers.

Example: Query wallets

```bash
curl -X POST \
  'https://platform.rise.ai/WalletService_/v1/rise/wallets/query' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: <API_KEY>' \
  -H 'rise-account-id: <ACCOUNT_ID>'
  --data-binary '{}'
```

You’re done. Build your flows using the relevant Rise service endpoints.

---

### Option B: OAuth App (multi‑merchant)

Use this if other merchants will install your app.

The process uses a `client_credentials` OAuth flow scoped by a unique `instanceId` for each merchant who installs your app.

1) Get app credentials
- Decide your `redirectUrl` - The URL where Rise will redirect merchants after they approve the installation. It must be HTTPS, and you should set `Cross-Origin-Opener-Policy` (COOP) to `unsafe-none` on this endpoint.
- Contact the Rise Partnerships team and provide your `redirectUrl` (must be HTTPS). They will provide your `appId` and `appSecret`.

2) Handle the Merchant Installation Flow
- This is the multi-step "dance" that happens when a new merchant installs your app. Start by referring the installer (the merhcant) to
```text
https://platform.rise.ai/protected/app-installer/install?appId=<APP_ID>&redirectUrl=<ENCODED_REDIRECT_URL>
```
- After the merchant approves, Rise redirects to your `redirectUrl` with `code` and `instanceId` query parameters.
- Save the `instanceId` — you'll use it along with your app credentials to generate access tokens for this merchant.
- Authenticate the user at your `redirectUrl` so you know which merchant account to associate with the `instanceId`.

3) Create access token (per merchant instance)
- Exchange your app credentials and the merchant's `instanceId` for an access token:

```bash
curl -X POST 'https://platform.rise.ai/oauth2/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "<APP_ID>",
    "client_secret": "<APP_SECRET>",
    "instance_id": "<INSTANCE_ID>"
  }'
```

- Store the `access_token` (valid for ~4 hours). Refresh it before expiration for each merchant `instanceId`.

4) Call Rise APIs with the access token
- We provide SDKs in several languages to simplify integration. See our [SDK documentation](../) for details.
- Alternatively, send requests directly with `Authorization: Bearer <ACCESS_TOKEN>` and `Content-Type: application/json` headers.

Example: Query wallets

```bash
curl -X POST \
  'https://platform.rise.ai/WalletService_/v1/rise/wallets/query' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ACCESS_TOKEN>' \
  --data-binary '{}'
```

You're done. Build your flows using the relevant Rise service endpoints. Repeat token creation for each merchant `instanceId` that installs your app.

---

### Best practices
- Store a mapping between Rise `instanceId` and your own account/user identifiers.
- Always use HTTPS endpoints.
- Set `Cross-Origin-Opener-Policy` (COOP) to `unsafe-none` for `appUrl` and `redirectUrl` to allow the installer window to close.
- API responses and endpoints may evolve; We recommend using our SDKs, or follow the docs.

---

### Minimal server checklist (OAuth App)
- Public HTTPS `redirectUrl`.
- Store `instanceId` per merchant.
- Securely store `appId` and `appSecret`.
- Short‑lived `access_token` cache (4 hours) per `instanceId`.

---

### Quick decision flow
- Building for your own store only? → Use API Key.
- Building an app for many stores? → Use OAuth App.


