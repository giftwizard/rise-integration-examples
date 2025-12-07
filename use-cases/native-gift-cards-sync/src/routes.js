import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upsertLocalGiftCard, getLocalGiftCardByCode, listLocalGiftCards, markIdempotencyKeyProcessed } from './localDb.js';
import { riseCreateGiftCard, riseIncreaseBalance, riseDecreaseBalance } from './riseClient.js';

export const giftCardRouter = Router();

// GET /api/gift-cards - list local gift cards (for demo)
giftCardRouter.get('/gift-cards', (_req, res) => {
  res.json({ giftCards: listLocalGiftCards() });
});

// POST /api/gift-cards
// Mock: This endpoint simulates when your native platform issues a new gift card after payment.
// It creates a local record, and then calls Rise Create Gift Card to sync.
giftCardRouter.post('/gift-cards', async (req, res) => {
  try {
    const { initial_value, passcode } = req.body || {};
    if (!passcode || typeof initial_value !== 'number') {
      return res.status(400).json({ error: 'passcode and numeric initial_value are required' });
    }

    // Create/update the local record first (native system of record for code mapping)
    const local = upsertLocalGiftCard({
      id: uuidv4(),
      code: passcode,
      balance: initial_value,
      currency: 'USD',
      status: 'active'
    });

    // Call Rise to create a corresponding gift card. Use idempotency key tied to your transaction.
    const idempotencyKey = `create-${passcode}`; // For demo purposes; in production use a payment/transaction id
    const riseResponse = await riseCreateGiftCard({
      initialValue: initial_value,
      currency: local.currency,
      idempotencyKey,
      passcode,
    });

    // Store Rise gift card id for syncing
    const riseGiftCardId = riseResponse?.giftCard?.id;
    const synced = upsertLocalGiftCard({ ...local, riseGiftCardId });
    markIdempotencyKeyProcessed(idempotencyKey);

    return res.status(201).json({ local: synced, rise: riseResponse });
  } catch (err) {
    console.error('Error creating gift card:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to create gift card', details: err?.response?.data || err.message });
  }
});

// POST /api/gift-cards/:code/balance-change
// Mock: This endpoint is triggered whenever there is a balance change in your native system
// (e.g., redemption at POS or reload). It must call Rise to keep both systems in sync.
giftCardRouter.post('/gift-cards/:code/balance-change', async (req, res) => {
  try {
    const { code } = req.params;
    const { delta, reason } = req.body || {};
    if (typeof delta !== 'number' || delta === 0) {
      return res.status(400).json({ error: 'numeric delta is required and cannot be 0' });
    }

    const local = getLocalGiftCardByCode(code);
    if (!local || !local.riseGiftCardId) {
      return res.status(404).json({ error: 'gift card not found or not synced with Rise' });
    }

    // Update local first to reflect the action (native source of truth for POS operation)
    const newBalance = (local.balance || 0) + delta;
    if (newBalance < 0) {
      return res.status(400).json({ error: 'insufficient balance locally' });
    }

    const idempotencyKey = `delta-${code}-${uuidv4()}`; // Use your transaction id for real idempotency

    // Call Rise to reflect the same change
    let riseResponse;
    if (delta > 0) {
      riseResponse = await riseIncreaseBalance({
        giftCardId: local.riseGiftCardId,
        amount: delta,
        idempotencyKey,
        reason: reason || 'MANUAL'
      });
    } else {
      riseResponse = await riseDecreaseBalance({
        giftCardId: local.riseGiftCardId,
        amount: Math.abs(delta),
        idempotencyKey,
        reason: reason || 'REDEEM'
      });
    }

    // Persist local balance update after Rise call succeeds
    const updated = upsertLocalGiftCard({ ...local, balance: newBalance });
    markIdempotencyKeyProcessed(idempotencyKey);

    return res.status(200).json({ local: updated, rise: riseResponse });
  } catch (err) {
    console.error('Error applying balance change:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to apply balance change', details: err?.response?.data || err.message });
  }
});




