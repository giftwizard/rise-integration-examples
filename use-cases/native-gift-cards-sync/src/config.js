// Runtime configuration store for Rise.ai settings
// Falls back to environment variables if not set in runtime

let runtimeConfig = {
  apiKey: process.env.RISE_API_KEY || '',
  apiBase: process.env.RISE_API_BASE || 'https://platform.rise.ai',
  tenantId: process.env.SOURCE_TENANT_ID || 'merchant_123',
  channelId: process.env.SOURCE_CHANNEL_ID || 'd0376a10-382a-4b0b-a2d8-f8ba42dc0e50',
  riseAccountId: process.env.RISE_ACCOUNT_ID || '',
  // Public key for verifying Rise.ai webhook signatures. Provided by the Rise team.
  riseWebhookPublicKey: process.env.RISE_WEBHOOK_PUBLIC_KEY || '',
};

export function getConfig() {
  return { ...runtimeConfig };
}

export function updateConfig(updates) {
  runtimeConfig = { ...runtimeConfig, ...updates };
  return getConfig();
}

export function getApiKey() {
  return runtimeConfig.apiKey || process.env.RISE_API_KEY || '';
}

export function getApiBase() {
  return runtimeConfig.apiBase || process.env.RISE_API_BASE || 'https://platform.rise.ai';
}

export function getTenantId() {
  return runtimeConfig.tenantId || process.env.SOURCE_TENANT_ID || 'merchant_123';
}

export function getChannelId() {
  return runtimeConfig.channelId || process.env.SOURCE_CHANNEL_ID || 'd0376a10-382a-4b0b-a2d8-f8ba42dc0e50';
}

export function getRiseAccountId() {
  return runtimeConfig.riseAccountId || process.env.RISE_ACCOUNT_ID || '';
}

export function getRiseWebhookPublicKey() {
  return runtimeConfig.riseWebhookPublicKey || process.env.RISE_WEBHOOK_PUBLIC_KEY || '';
}

