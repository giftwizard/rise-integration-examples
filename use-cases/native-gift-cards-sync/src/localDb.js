// In-memory mock data store for local gift cards and processed idempotency keys.
// Replace with your real database in production.

const giftCardsByCode = new Map(); // code -> { id, code, balance, currency, status, riseGiftCardId? }
const idempotencyKeys = new Set(); // store processed idempotency keys for webhook and API actions

export function upsertLocalGiftCard(record) {
  if (!record || !record.code) throw new Error('Gift card record must include code');
  const existing = giftCardsByCode.get(record.code) || {};
  const next = { ...existing, ...record };
  giftCardsByCode.set(record.code, next);
  return next;
}

export function getLocalGiftCardByCode(code) {
  return giftCardsByCode.get(code) || null;
}

export function listLocalGiftCards() {
  return Array.from(giftCardsByCode.values());
}

export function markIdempotencyKeyProcessed(key) {
  idempotencyKeys.add(key);
}

export function hasProcessedIdempotencyKey(key) {
  return idempotencyKeys.has(key);
}


