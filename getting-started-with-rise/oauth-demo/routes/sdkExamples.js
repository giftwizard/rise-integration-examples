import { Router } from 'express';
import config from '../config.js';

const router = Router();

router.post('/example-sdk-call', async (req, res) => {
  try {
    const { instanceId } = req.body;

    if (!instanceId) {
      return res.status(400).json({ error: 'Missing instanceId' });
    }

    if (!config.USE_SDK) {
      return res.status(400).json({
        error: 'SDK not enabled',
        message: 'Set USE_SDK=true in .env'
      });
    }

    const { RiseSDKClient } = await import('rise-ai-sdk');

    const sdk = await RiseSDKClient.withOAuth({
      clientId: config.APP_ID,
      clientSecret: config.APP_SECRET,
      instanceId
    });

    const wallets = await sdk.wallets.queryWallets({ query: { filter: '{}', limit: 10 } });

    res.json({
      success: true,
      method: 'SDK',
      data: wallets.data
    });
  } catch (err) {
    console.error('SDK call error:', err);
    res.status(500).json({ error: 'SDK call failed', message: err.message });
  }
});

export default router;
