import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { upsertLocalGiftCard, getLocalGiftCardByCode, markIdempotencyKeyProcessed, hasProcessedIdempotencyKey } from './localDb.js';
import { getRiseWebhookPublicKey } from './config.js';

export const webhookRouter = Router();

// Verify webhook signature using the public key from Rise
function verifyRiseSignature(req) {
  const publicKey = getRiseWebhookPublicKey();
  if (!publicKey) {
    console.warn('Webhook signature verification is skipped. Set RISE_WEBHOOK_PUBLIC_KEY to enable it.');
    // In a production environment, you should return false or throw an error.
    return true;
  }

  try {
    // req.body should be the raw JWT string. Ensure body-parser is not parsing it as JSON beforehand for this endpoint.
    // If express.json() is used globally, you might need to get the raw body.
    jwt.verify(req.body, publicKey, { algorithms: ['RS256'] });
    return true;
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return false;
  }
}

// POST /webhooks/rise
// Subscribe to events like:
// - GIFT_CARD_INITIALIZED
// - GIFT_CARD_UPDATED
// - GIFT_CARD_DISABLED
// - GIFT_CARD_TRANSACTION_ADDED
webhookRouter.post('/', (req, res) => {
  try {
    if (!verifyRiseSignature(req)) {
      return res.status(401).json({ error: 'invalid signature' });
    }

    const decoded = jwt.decode(req.body);
    const data = JSON.parse(decoded.data);
    const event = JSON.parse(data.data);

    const eventType = data.eventType;
    const idempotencyKey = event.id;

    if (idempotencyKey && hasProcessedIdempotencyKey(idempotencyKey)) {
      return res.status(200).json({ ok: true, deduped: true });
    }

    // Basic handlers for demo purposes. In a real system, apply more robust logic and schema parsing.
    if (eventType === 'wix.rise.v1.gift_card_initialized') {
      const gc = event.actionEvent.body.giftCard;
      if (gc?.code) {
        upsertLocalGiftCard({
          id: gc.id,
          code: gc.code,
          balance: gc.balance,
          currency: gc.currency || 'USD',
          status: 'active',
          riseGiftCardId: gc.id
        });
      }
    } else if (eventType === 'wix.rise.v1.gift_card_transaction_added') {
      const gc = event.actionEvent.body.giftCard;
      if (gc?.code) {
        const local = getLocalGiftCardByCode(gc.code);
        if (local) {
          const newBalance = typeof gc.balance === 'number' ? gc.balance : local.balance;
          upsertLocalGiftCard({ ...local, balance: newBalance });
        }
      }
    } else if (eventType === 'wix.rise.v1.gift_card_updated') {
      const gc = event.actionEvent.body.giftCard;
      if (gc?.code) {
        const local = getLocalGiftCardByCode(gc.code) || {};
        upsertLocalGiftCard({ ...local, code: gc.code, riseGiftCardId: gc.id });
      }
    } else if (eventType === 'wix.rise.v1.gift_card_disabled') {
      const gc = event.actionEvent.body.giftCard;
      if (gc?.code) {
        const local = getLocalGiftCardByCode(gc.code) || {};
        upsertLocalGiftCard({ ...local, code: gc.code, status: 'disabled', riseGiftCardId: gc.id });
      }
    }

    if (idempotencyKey) markIdempotencyKeyProcessed(idempotencyKey);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    return res.status(500).json({ error: 'webhook processing failed' });
  }
});


