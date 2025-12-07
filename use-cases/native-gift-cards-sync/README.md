# Native Gift Cards – Bidirectional Sync with Rise.ai (Example)

## Overview
This example project mocks a native/platform gift card system and demonstrates how to implement the Bidirectional Synchronization approach with Rise.ai. It is designed as a learning/reference project that you can clone and adapt to integrate Rise.ai with your platform's existing gift card logic.

## What this project mocks
- A native gift card system implemented as a small Express server.
- Endpoints you would typically trigger from your POS/checkout/business flows.
- A webhook receiver to consume Rise events and keep the local store in sync.
- A simple in-memory "database". Replace with your real DB in production.

## Why bidirectional sync?
Per the Rise.ai guide, the sync approach allows you to keep your existing platform-native gift card features while using Rise's advanced capabilities. Both systems maintain gift card records and must stay synchronized.

**Documentation:** See the official Rise API docs at https://platform.rise.ai/docs

## Key flows in this example

### 1. Local gift card creation → call Rise Create Gift Card
**Endpoint:** `POST /api/gift-cards`

**Purpose:** Simulates when your system issues a new gift card after a successful payment.

**Handler actions:**
- Creates/updates the local record
- Calls Rise Create Gift Card API (with idempotency)
- Stores the returned Rise gift card ID for ongoing sync

### 2. Local balance change (redemption or reload) → call Rise Increase/Decrease Balance
**Endpoint:** `POST /api/gift-cards/:code/transactions`

**Purpose:** Simulates when your system processes a redemption or reload and must notify Rise.

**Handler actions:**
- Updates the local balance
- Calls Rise **Increase Balance** API (for reload) or **Decrease Balance** API (for redemption) with idempotency

### 3. Rise webhooks → update local records
**Endpoint:** `POST /webhooks/rise`

**Purpose:** Consumes Rise events (e.g., `GIFT_CARD_INITIALIZED`, `GIFT_CARD_TRANSACTION_ADDED`) and updates the local store.

**Important:** Webhooks are received as a JWT token and must be parsed twice:
1. First, verify and decode the JWT using the Rise webhook public key
2. Second, parse the `data` field from the decoded JWT (which contains another JSON string)
3. Finally, parse the inner `data` field to get the actual event payload

Duplicate deliveries should be harmless (basic idempotency handling is included).

## Project structure
- `src/server.js` – Express app bootstrap
- `src/routes.js` – Business endpoints (local actions that also call Rise)
- `src/webhooks.js` – Rise webhook receiver (handles JWT verification and double parsing)
- `src/riseClient.js` – Minimal Rise API client (axios)
- `src/localDb.js` – In-memory data store and idempotency tracking
- `src/config.js` – Configuration and environment variables
- `src/ui.js` – Simple web UI for testing

## Prerequisites
Before you begin, ensure you have a Rise.ai account and an API key. If you haven't already, please follow our [Getting Started with Rise.ai guide](../../getting-started-with-rise/README.md) to set up your account and obtain your credentials.

## Installation & running

### Requirements
Node.js >= 18

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables** (create a `.env` file):
   ```bash
   PORT=3001
   RISE_API_BASE=https://platform.rise.ai
   RISE_API_KEY=replace_with_sandbox_api_key
   SOURCE_TENANT_ID=merchant_123
   SOURCE_CHANNEL_ID=d0376a10-382a-4b0b-a2d8-f8ba42dc0e50
   RISE_WEBHOOK_PUBLIC_KEY=replace_with_public_key_if_applicable
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

## API Examples

### Create local gift card and sync to Rise
```http
POST http://localhost:3001/api/gift-cards
Content-Type: application/json

{
  "passcode": "GC-1001",
  "initial_value": 5000
}
```

### Trigger local balance change (redemption / reload) and sync to Rise

**Redemption:**
```http
POST http://localhost:3001/api/gift-cards/GC-1001/transactions
Content-Type: application/json

{
  "delta": -1500,
  "reason": "REDEEM"
}
```

**Reload:**
```http
POST http://localhost:3001/api/gift-cards/GC-1001/transactions
Content-Type: application/json

{
  "delta": 2000,
  "reason": "RELOAD"
}
```

### List local gift cards (demo)
```http
GET http://localhost:3001/api/gift-cards
```

### Receive Rise webhooks
**Configure Rise to call this URL:**
```http
POST http://localhost:3001/webhooks/rise
Content-Type: application/jwt

<JWT_TOKEN>
```

**Note:** The webhook payload is a JWT token that contains nested JSON data requiring double parsing (see webhooks.js for implementation details).

## Important notes for real implementations

- **Idempotency:** Use a stable, business-meaningful idempotency key per transaction (e.g., payment ID). This example uses simplistic keys for demonstration purposes.

- **Mapping:** Ensure a one-to-one mapping between your local gift card and Rise's gift card (by shared code, mapping table, or both).

- **Webhooks:** 
  - Verify JWT signatures using the Rise webhook public key
  - The webhook payload requires **double parsing**: decode the JWT, then parse the nested JSON data fields
  - Implement retries and dead-letter queues for production
  - Handle duplicate deliveries with proper idempotency checks

- **Error handling:** Expand the try/catch and branch logic based on Rise error responses and your platform rules.

- **Security:** Secure all endpoints with proper authentication/authorization and use HTTPS.

## How it aligns with the guideide
This project follows the bidirectional sync approach. Your system triggers endpoints at the exact moments native logic changes a card (e.g., redemption at checkout), and those endpoints call the corresponding Rise API. Conversely, Rise webhooks (delivered as JWT tokens with nested JSON) update local data when changes originate on the Rise side.

## References
- [Rise.ai API Documentation](https://dev.rise.ai/)


