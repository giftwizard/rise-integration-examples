/**
 * Rise.ai API integration utilities for gift card operations
 * 
 * This module provides functions for querying, decreasing, and increasing
 * gift card balances through the Rise.ai API.
 * Platform-agnostic implementation.
 */

const RISE_API_BASE_URL = 'https://platform.rise.ai/v1/rise/gift-cards';
const RISE_API_VERSION = '2020-07-16'; // Default API version

/**
 * Query a gift card by code to get its details
 * @param {string} code - The gift card code
 * @param {RiseApiConfig} config - API configuration
 * @returns {Promise<RiseGiftCardQueryResponse>}
 */
export async function queryGiftCardByCode(code, config) {
  const {apiToken, accountId} = config;

  if (!apiToken || !accountId) {
    throw new Error('Rise.ai API token and account ID are required');
  }

  const response = await fetch(`${RISE_API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Rise-API-Version': config.apiVersion || RISE_API_VERSION,
      'rise-account-id': accountId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        filter: {code},
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle Rise.ai error response format
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const errorMessages = errorData.errors.map(err => err.message || err.code).join(', ');
      throw new Error(errorMessages || `API request failed with status ${response.status}`);
    }
    
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Decrease gift card balance (redeem)
 * @param {DecreaseGiftCardParams} params - Parameters for decreasing balance
 * @param {RiseApiConfig} config - API configuration
 * @returns {Promise<RiseTransactionResponse>}
 */
export async function decreaseGiftCardBalance(params, config) {
  const {giftCardId, amount, idempotencyKey, sourceInfo, redeemOptions} = params;
  const {apiToken, accountId} = config;

  if (!apiToken || !accountId) {
    throw new Error('Rise.ai API token and account ID are required');
  }

  if (!idempotencyKey) {
    throw new Error('Idempotency key is required to prevent duplicate transactions');
  }

  const response = await fetch(`${RISE_API_BASE_URL}/${giftCardId}/decrease`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Rise-API-Version': config.apiVersion || RISE_API_VERSION,
      'rise-account-id': accountId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: {
        type: 'REDEEM',
        giftCardId,
        amount: String(amount),
        idempotencyKey,
        sourceInfo,
        redeemOptions,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle Rise.ai error response format
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const errorMessages = errorData.errors.map(err => err.message || err.code).join(', ');
      throw new Error(errorMessages || `Failed to decrease balance: ${response.status}`);
    }
    
    throw new Error(errorData.message || `Failed to decrease balance: ${response.status}`);
  }

  return response.json();
}

/**
 * Increase gift card balance (void transaction)
 * @param {IncreaseGiftCardParams} params - Parameters for increasing balance
 * @param {RiseApiConfig} config - API configuration
 * @returns {Promise<RiseTransactionResponse>}
 */
export async function increaseGiftCardBalance(params, config) {
  const {giftCardId, amount, idempotencyKey, sourceInfo, voidOptions} = params;
  const {apiToken, accountId} = config;

  if (!apiToken || !accountId) {
    throw new Error('Rise.ai API token and account ID are required');
  }

  if (!idempotencyKey) {
    throw new Error('Idempotency key is required to prevent duplicate transactions');
  }

  if (!voidOptions?.transactionId) {
    throw new Error('Transaction ID is required for void operations');
  }

  const response = await fetch(`${RISE_API_BASE_URL}/${giftCardId}/increase`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Rise-API-Version': config.apiVersion || RISE_API_VERSION,
      'rise-account-id': accountId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: {
        type: 'VOID',
        giftCardId,
        amount: String(amount),
        idempotencyKey,
        sourceInfo,
        voidOptions,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle Rise.ai error response format
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const errorMessages = errorData.errors.map(err => err.message || err.code).join(', ');
      throw new Error(errorMessages || `Failed to increase balance: ${response.status}`);
    }
    
    throw new Error(errorData.message || `Failed to increase balance: ${response.status}`);
  }

  return response.json();
}

/**
 * Generate a unique idempotency key for transactions
 * @returns {string}
 */
export function generateIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * @typedef {{
 *   apiToken: string;
 *   accountId: string;
 *   apiVersion?: string;
 * }} RiseApiConfig
 */

/**
 * @typedef {{
 *   code: string;
 *   balance: string;
 *   sourceInfo?: {
 *     sourceTenantId?: string;
 *     sourceChannelId?: string;
 *     sourceLocationId?: string;
 *   };
 * }} RiseGiftCardQueryResponse
 */

/**
 * @typedef {{
 *   giftCardId: string;
 *   amount: number | string;
 *   idempotencyKey: string;
 *   sourceInfo: {
 *     sourceTenantId: string;
 *     sourceChannelId: string;
 *     sourceLocationId?: string;
 *   };
 *   redeemOptions: {
 *     orderId: string;
 *     liability?: boolean;
 *     totalPrice: string;
 *     orderNumber?: string;
 *   };
 * }} DecreaseGiftCardParams
 */

/**
 * @typedef {{
 *   giftCardId: string;
 *   amount: number | string;
 *   idempotencyKey: string;
 *   sourceInfo: {
 *     sourceTenantId: string;
 *     sourceChannelId: string;
 *     sourceLocationId?: string;
 *   };
 *   voidOptions: {
 *     transactionId: string;
 *   };
 * }} IncreaseGiftCardParams
 */

/**
 * @typedef {{
 *   transactionId: string;
 *   success: boolean;
 * }} RiseTransactionResponse
 */

