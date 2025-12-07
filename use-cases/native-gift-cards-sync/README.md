Native Gift Cards – Bidirectional Sync with Rise.ai (Example)

Overview
This example project mocks a native/platform gift card system and demonstrates how to implement the Bidirectional Synchronization approach with Rise.ai. It is designed as a learning/reference project that you can clone and adapt to integrate Rise.ai with your platform’s existing gift card logic.

What this project mocks
- A native gift card system implemented as a small Express server.
- Endpoints you would typically trigger from your POS/checkout/business flows.
- A webhook receiver to consume Rise events and keep the local store in sync.
- A simple in-memory “database”. Replace with your real DB in production.

Why bidirectional sync?
Per the Rise.ai guide, the sync approach allows you to keep your existing platform-native gift card features while using Rise’s advanced capabilities. Both systems maintain gift card records and must stay synchronized.

Docs: See the official Rise API docs at https://platform.rise.ai/docs

Key flows in this example
1) Local gift card creation -> call Rise Create Gift Card
- Endpoint: POST /api/gift-cards
- Meaning: Simulates when your system issues a new gift card after a successful payment. The handler:
  - Creates/updates the local record
  - Calls Rise Create Gift Card (with idempotency)
  - Stores the returned Rise gift card id for ongoing sync

2) Local balance change (redemption or reload) -> call Rise Increase/Decrease Balance
- Endpoint: POST /api/gift-cards/:code/balance-change
- Meaning: Simulates when your system processes a redemption or reload and must notify Rise. The handler:
  - Updates the local balance
  - Calls Rise Increase Balance (for reload) or Decrease Balance (for redemption) with idempotency

3) Rise webhooks -> update local records
- Endpoint: POST /webhooks/rise
- Meaning: Consumes Rise events (e.g., GIFT_CARD_INITIALIZED, GIFT_CARD_TRANSACTION_ADDED) and updates the local store. Duplicate deliveries should be harmless (basic idempotency handling is included).

Project structure
- src/server.js – Express app bootstrap
- src/routes.js – Business endpoints (local actions that also call Rise)
- src/webhooks.js – Rise webhook receiver
- src/riseClient.js – Minimal Rise API client (axios)
- src/localDb.js – In-memory data store and idempotency tracking

Prerequisites
Before you begin, ensure you have a Rise.ai account and an API key. If you haven't already, please follow our [Getting Started with Rise.ai guide](../../getting-started-with-rise/README.md) to set up your account and obtain your credentials.

Installation & running
1) Requirements: Node.js >= 18
2) Install deps:
   npm install
3) Set environment variables (create a .env file):
   PORT=3001
   RISE_API_BASE=https://platform.rise.ai
   RISE_API_KEY=replace_with_sandbox_api_key
   SOURCE_TENANT_ID=merchant_123
   SOURCE_CHANNEL_ID=d0376a10-382a-4b0b-a2d8-f8ba42dc0e50
   RISE_WEBHOOK_PUBLIC_KEY=replace_with_public_key_if_applicable
4) Start the app:
   npm run dev

HTTP examples
Create local gift card and sync to Rise
POST http://localhost:3001/api/gift-cards
{
  "code": "GC-1001",
  "amount": 5000,
  "currency": "USD"
}

Trigger local balance change (redemption / reload) and sync to Rise
POST http://localhost:3001/api/gift-cards/GC-1001/balance-change
{
  "delta": -1500,
  "reason": "REDEEM"
}
Use a positive delta for reloads:
{
  "delta": 2000,
  "reason": "RELOAD"
}

List local gift cards (demo)
GET http://localhost:3001/api/gift-cards

Receive Rise webhooks (configure Rise to call this URL)
POST http://localhost:3001/webhooks/rise

Important notes for real implementations
- Idempotency: Use a stable, business-meaningful idempotency key per transaction (e.g., payment id). This example uses simplistic keys.
- Mapping: Ensure a one-to-one mapping between your local gift card and Rise’s gift card (by shared code, mapping table, or both).
- Webhooks: Verify signatures and implement retries/dead-letter queues. This example includes a verification stub to be replaced.
- Error handling: Expand the try/catch and branch logic based on Rise error responses and your platform rules.
- Security: Secure all endpoints (authN/Z) and use HTTPS.

How it aligns with the guide
This project follows the Celerant-style sync approach described in the brief. Your system triggers endpoints at the exact moments native logic changes a card (e.g., redemption at checkout), and those endpoints call the corresponding Rise API. Conversely, Rise webhooks update local data when changes originate on the Rise side.

References
- Rise.ai API Documentation: https://platform.rise.ai/docs


