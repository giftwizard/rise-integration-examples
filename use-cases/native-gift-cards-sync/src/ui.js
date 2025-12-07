import { Router } from 'express';
import { getConfig, updateConfig } from './config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uiRouter = Router();

// GET / - Serve the main UI
uiRouter.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET /api/config - Get current Rise configuration
uiRouter.get('/api/config', (_req, res) => {
  const config = getConfig();
  res.json({
    apiKey: config.apiKey ? maskApiKey(config.apiKey) : '',
    apiBase: config.apiBase,
    tenantId: config.tenantId,
    channelId: config.channelId
  });
});

// POST /api/config - Update Rise configuration
uiRouter.post('/api/config', (req, res) => {
  try {
    const { apiKey, apiBase, tenantId, channelId } = req.body || {};
    const updates = {};
    if (apiKey) updates.apiKey = apiKey;
    if (apiBase !== undefined) updates.apiBase = apiBase;
    if (tenantId !== undefined) updates.tenantId = tenantId;
    if (channelId !== undefined) updates.channelId = channelId;
    
    const updated = updateConfig(updates);
    res.json({
      success: true,
      config: {
        apiKey: updated.apiKey ? maskApiKey(updated.apiKey) : '',
        apiBase: updated.apiBase,
        tenantId: updated.tenantId,
        channelId: updated.channelId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function maskApiKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return key.slice(0, 4) + '••••' + key.slice(-4);
}

