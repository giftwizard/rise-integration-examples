import axios from 'axios';
import { getApiKey, getApiBase, getTenantId, getChannelId, getRiseAccountId } from './config.js';

function authHeaders(extra = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('RISE_API_KEY is not set');
  }
  return {
    
    Authorization: `${apiKey}`,
    'rise-account-id': getRiseAccountId(),
    'Content-Type': 'application/json',
    ...extra
  };
}

export async function riseCreateGiftCard({ initialValue, currency, idempotencyKey, passcode }) {
  const url = `${getApiBase()}/v1/rise/gift-cards`;
  const payload = {
    giftCard: {
      initialValue: `${initialValue}`,
      currency: currency || 'USD',
      code: passcode,
      sourceInfo: {
        type: 'ORDER',
        orderOptions: {
          orderId: `native-gc-${passcode}`,
        },
        sourceTenantId: getTenantId(),
        sourceChannelId: getChannelId()

      },
      idempotencyKey: idempotencyKey
    },
  };
  try {
    const { data } = await axios.post(url, payload, { headers: authHeaders() });
    return data;
  } catch (err) {
    const jsonError = err?.response?.data || err.message;
    console.error('Rise Create Gift Card error:', JSON.stringify(jsonError, null, 2));
    throw err;
  }
}

export async function riseIncreaseBalance({ giftCardId, amount, idempotencyKey, reason = 'MANUAL' }) {
  const url = `${getApiBase()}/v1/rise/gift-cards/${giftCardId}/increase`;
  const payload = {
    transaction: {
      giftCardId: giftCardId,
      amount: `${amount}`,
      // mind that in a real world senario the change might not be manual, and that the 
      // manualOptions is a one-of that should only be set when the reason is MANUAL
      // other types might require other options, see more info at the API docs - dev.rise.ai
      type: reason,
      idempotencyKey: idempotencyKey.substring(0, 50), // Rise API limit
      manualOptions: {},
      sourceInfo: {
        sourceTenantId: getTenantId(),
        sourceChannelId: getChannelId()
      }
    }
  };
  try {
    const { data } = await axios.post(url, payload, { headers: authHeaders() });
    return data;
  } catch (err) {
    const jsonError = err?.response?.data || err.message;
    console.error('Rise Increase Balance error:', JSON.stringify(jsonError, null, 2));
    throw err;
  }
}

export async function riseDecreaseBalance({ giftCardId, amount, idempotencyKey, reason = 'REDEEM' }) {
  const url = `${getApiBase()}/v1/rise/gift-cards/${giftCardId}/decrease`;
  const payload = {
    transaction: {
      giftCardId: giftCardId,
      amount: `${amount}`,
      type: reason,
      idempotencyKey: idempotencyKey,
      redeemOptions: {},
      sourceInfo: {
        sourceTenantId: getTenantId(),
        sourceChannelId: getChannelId()
      }
    }
  };
  try {
    const { data } = await axios.post(url, payload, { headers: authHeaders() });
    return data;
  } catch (err) {
    const jsonError = err?.response?.data || err.message;
    console.error('Rise Decrease Balance error:', JSON.stringify(jsonError, null, 2));
    throw err;
  }
}

export async function riseGetGiftCard({ giftCardId }) {
  const url = `${getApiBase()}/v1/rise/gift-cards/${giftCardId}`;
  const { data } = await axios.get(url, { headers: authHeaders() });
  return data;
}


