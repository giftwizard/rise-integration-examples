# Rise OAuth Demo

This project demonstrates how to implement OAuth authentication with Rise.ai for multi-merchant applications. **This demo shows two approaches: using plain HTTP calls and using the Rise TypeScript SDK.**

## Quick Start

**TL;DR**: Get OAuth credentials from Rise Partnerships → Set up `.env` with your credentials → Run `npm start` → Test the OAuth flow. Choose between [plain HTTP](#option-a-using-plain-http-fetch) or [SDK approach](#option-b-using-the-rise-typescript-sdk-recommended) for token exchange. See [How It Works](#how-it-works) for details.

- **[Prerequisites](#prerequisites)**: What you need before starting
- **[Setup](#setup)**: Installation and configuration steps
- **[Running the Demo](#running-the-demo)**: How to start and test the OAuth flow
- **[How It Works](#how-it-works)**: Detailed explanation of the OAuth flow and token exchange options
- **[Making API Calls](#making-api-calls-after-oauth)**: Examples for both HTTP and SDK approaches
- **[Important Notes](#important-notes)**: Security and best practices
- **[Troubleshooting](#troubleshooting)**: Common issues and solutions
- **[Next Steps](#next-steps)**: What to do after successful OAuth setup

## Project Structure

```
oauth-demo/
├── README.md           # This file
├── package.json        # Node.js dependencies and scripts
├── .env               # Environment variables (appId, appSecret, redirectUrl, useSdk)
├── server.js          # Express server handling OAuth flow (supports both approaches)
└── public/
    └── index.html     # Simple UI showing app credentials and connect button
```

## Overview

This demo implements the OAuth App flow described in the [Getting Started guide](../README.md#option-b-oauth-app-multi‑merchant). It shows:

1. **Installation Flow**: Redirecting merchants to the Rise installer page
2. **Callback Handling**: Receiving the `instanceId` from Rise
3. **Token Exchange**: Exchanging app credentials and `instanceId` for an access token
   - **Option A**: Using plain HTTP calls (fetch)
   - **Option B**: Using the [Rise TypeScript SDK](https://github.com/giftwizard/rise-typescript-sdk) (recommended)
4. **Token Display**: Showing the results to the user
5. **Example API Calls**: Demonstrating how to make API calls with both approaches

## Prerequisites

Before you begin, you'll need:

1. **Node.js >= 18.0.0** installed on your machine

2. **Contact the Rise Partnerships team** to get your OAuth app credentials:
   - Decide your `redirectUrl` - The URL where Rise will redirect merchants after they approve the installation. It must be HTTPS, and you should set `Cross-Origin-Opener-Policy` (COOP) to `unsafe-none` on this endpoint.
   - Contact the Rise Partnerships team and provide your `redirectUrl` (must be HTTPS). They will provide your `appId` and `appSecret`.
   - For local development: After you're redirected to your production `redirectUrl`, copy the full URL from your browser. Extract the `instanceId` parameter from that URL, and use it with a localhost URL in your `.env` file. For example, if you were redirected to `https://your-production-url.com/callback?code=abc123&instanceId=xyz789`, you would set `REDIRECT_URL=http://localhost:3000/oauth/callback` in your `.env` and use the `instanceId` (xyz789) when making API calls.

3. **A Rise account with a connected sales channel**:
   - You need a Rise account to test the OAuth installation flow
   - The account must have at least one connected sales channel (e.g., Shopify, WooCommerce, etc.)
   - **Note**: The Rise Partnerships team can help you set up a Rise account for testing if you don't have one yet

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Update `.env` with your values**:
   ```
   APP_ID=your_app_id_here
   APP_SECRET=your_app_secret_here
   REDIRECT_URL=http://localhost:3000/oauth/callback # For local development, use localhost. Extract instanceId from production redirect URL.
   USE_SDK=false # Set to 'true' to use the SDK, 'false' to use plain HTTP
   PORT=3000
   ```

**How local testing works:**
1. When a merchant installs your app, Rise redirects to the registered production `redirectUrl`
   (e.g., `https://myapp.com/oauth/callback`)
2. The redirect URL will contain `code` and `instanceId`
   ```
   https://myapp.com/oauth/callback?code=abc123&instanceId=xyz789
   ```
3. Copy these two values and use them locally to exchange for a token.

**Example workflow:**
- You start the demo locally on `http://localhost:3000`
- Click “Connect with Rise”
- You are redirected to a **production** callback URL:
  ```
  https://your-production-site.com/oauth/callback?code=A1B2C3&instanceId=MERCHANT-123
  ```
- Copy `code=A1B2C3` and `instanceId=MERCHANT-123`
- Paste them into the UI form on `http://localhost:3000` or trigger the token exchange locally
- The server exchanges them for an access token using your local credentials

✅ This allows you to test the OAuth token exchange locally even though the callback itself is HTTPS-only in production.

### Optional: Fully local HTTPS redirect
If you prefer a fully local loop (no copy/paste), you can run your local server over HTTPS using a tunneling service like **ngrok**:
```bash
ngrok http 3000
ngrok gives you an HTTPS URL (e.g., https://abcd1234.ngrok.io)
```

Use this as your REDIRECT_URL in .env:

```bash
REDIRECT_URL=https://abcd1234.ngrok.io/oauth/callback
```

Send this URL to the Rise Partnerships team to register

✅ Now the entire OAuth flow works automatically, end-to-end, on localhost.


   **Choose your approach:**
   - Set `USE_SDK=true` to use the Rise TypeScript SDK (recommended for better type safety and convenience)
   - Set `USE_SDK=false` to use plain HTTP calls (gives you full control)

## Running the Demo

1. **Start the server**:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to `http://localhost:3000`

3. **Test the OAuth flow**:
   - You'll see your app credentials displayed (for demo purposes)
   - Click the "Connect with Rise" button
   - You'll be redirected to Rise's installer page
   - After approval, you'll be redirected back with `code` and `instanceId`
   - The server will exchange these for an access token
   - The results will be displayed on the page

## How It Works

### 1. Installation Initiation
When the user clicks "Connect with Rise", the app redirects to:
```
https://platform.rise.ai/protected/app-installer/install?appId=<APP_ID>&redirectUrl=<ENCODED_REDIRECT_URL>
```

### 2. Callback Handling
After the merchant approves, Rise redirects to your `redirectUrl` with:
- `code`: Authorization code
- `instanceId`: Unique identifier for this merchant installation

### 3. Token Exchange

The demo supports **two approaches** for token exchange. You can choose which one to use by setting `USE_SDK=true` or `USE_SDK=false` in your `.env` file.

#### Option A: Using Plain HTTP (fetch)

This approach gives you full control but requires manual token management:

```javascript
// Exchange credentials for access token
const tokenResponse = await fetch('https://platform.rise.ai/oauth2/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: APP_ID,
    client_secret: APP_SECRET,
    instance_id: instanceId
  })
});

const tokenData = await tokenResponse.json();
// tokenData.access_token is valid for ~4 hours
```

**Pros:**
- No additional dependencies
- Full control over HTTP requests
- Lightweight

**Cons:**
- Manual token management (storage, refresh)
- No type safety
- More boilerplate code

#### Option B: Using the Rise TypeScript SDK (Recommended)

This approach provides better type safety, automatic token management, and convenience:

```javascript
import { RiseSDKClient } from '@rise/rise-typescript-sdk';

// Initialize SDK with OAuth credentials
const sdk = await RiseSDKClient.withOAuth({
  clientId: APP_ID,
  clientSecret: APP_SECRET,
  instanceId: instanceId
});

// The SDK automatically handles token exchange and storage
// You can immediately use the SDK to make API calls
const wallets = await sdk.wallets.queryWallets({
  query: { filter: '{}' }
});
```

**Pros:**
- Automatic token management and refresh
- Type safety with TypeScript
- Cleaner, more maintainable code
- Built-in error handling
- Full API coverage with IntelliSense support

**Cons:**
- Additional dependency (`@rise/rise-typescript-sdk`)
- Slightly larger bundle size

### 4. Response
The access token (valid for ~4 hours) is returned to the client and displayed. The method used (SDK or Plain HTTP) is also shown.

## Making API Calls After OAuth

After successfully obtaining an access token, you can make API calls to Rise. The demo includes example endpoints showing both approaches:

### Using Plain HTTP

```javascript
// POST /api/example-http-call
// Body: { instanceId: "...", accessToken: "..." }

const response = await fetch('https://platform.rise.ai/api/v1/wallets/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    query: {
      filter: '{}',
      limit: 10
    }
  })
});

const data = await response.json();
```

### Using the SDK

```javascript
// POST /api/example-sdk-call
// Body: { instanceId: "..." }

import { RiseSDKClient } from '@rise/rise-typescript-sdk';

const sdk = await RiseSDKClient.withOAuth({
  clientId: APP_ID,
  clientSecret: APP_SECRET,
  instanceId: instanceId
});

// Query wallets
const wallets = await sdk.wallets.queryWallets({
  query: {
    filter: '{}',
    limit: 10
  }
});

// Create a gift card
const giftCard = await sdk.giftCards.createGiftCard({
  giftCard: {
    initialValue: 10000, // $100.00 in cents
    currency: 'USD'
  }
});

// Get or create a wallet
const wallet = await sdk.wallets.getOrCreateWallet({
  customerReference: {
    email: 'customer@example.com'
  }
});
```

For more SDK examples, see the [Rise TypeScript SDK documentation](https://github.com/giftwizard/rise-typescript-sdk).

## Important Notes

- **HTTPS Required**: In production, your `redirectUrl` must be HTTPS
- **COOP Header**: Set `Cross-Origin-Opener-Policy: unsafe-none` on your redirect endpoint (implemented in `server.js`)
- **Token Storage**: In a real application, you should:
  - Store the `instanceId` associated with each merchant account
  - Cache the `access_token` (valid for ~4 hours) if using plain HTTP
  - Refresh tokens before expiration if using plain HTTP
  - **With SDK**: The SDK handles token storage and refresh automatically
  - Securely store `appId` and `appSecret` (never expose in client-side code)
- **SDK Recommendation**: We recommend using the SDK for better developer experience, type safety, and automatic token management

## Troubleshooting

- **"Invalid redirect URL"**: Ensure your `redirectUrl` matches exactly what you provided to Rise Partnerships
- **"Invalid credentials"**: Verify your `appId` and `appSecret` are correct
- **CORS issues**: Make sure COOP header is set to `unsafe-none` on the callback endpoint

## Next Steps

After successful OAuth setup, you can:

### If Using Plain HTTP:
- Use the `access_token` to call Rise APIs (see [Getting Started guide](../README.md))
- Store `instanceId` mappings in your database
- Implement token refresh logic (tokens expire after ~4 hours)
- Build your integration using Rise service endpoints

### If Using the SDK:
- Use the SDK instance to make API calls (no need to manage tokens manually)
- Store `instanceId` mappings in your database
- Re-initialize the SDK when needed (it handles token refresh automatically)
- Build your integration using the SDK's typed methods

### Recommended: Install and Use the SDK

The Rise TypeScript SDK provides:
- **Type Safety**: Full TypeScript support with IntelliSense
- **Automatic Token Management**: Handles token refresh automatically
- **Cleaner Code**: Less boilerplate, more maintainable
- **Better Error Handling**: Built-in error handling and retries
- **Full API Coverage**: Access to all Rise APIs with proper typing

To use the SDK:
1. Install it: `npm install @rise/rise-typescript-sdk`
2. Set `USE_SDK=true` in your `.env` file
3. Import and use: `import { RiseSDKClient } from '@rise/rise-typescript-sdk'`

See the [SDK documentation](https://github.com/giftwizard/rise-typescript-sdk) for more examples and API reference.

