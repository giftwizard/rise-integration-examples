import { Router } from 'express';
import config from '../config.js';

const router = Router();

// OAuth callback handler (same logic as before)
router.get('/callback', async (req, res) => {
  try {
    const { code, instanceId } = req.query;

    if (!code || !instanceId) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Expected code and instanceId query parameters'
      });
    }

    let tokenData;
    let methodUsed;

    if (config.USE_SDK) {
      try {
        const { RiseSDKClient } = await import('rise-ai-sdk');
        const sdk = await RiseSDKClient.withOAuth({
          clientId: config.APP_ID,
          clientSecret: config.APP_SECRET,
          instanceId
        });

        methodUsed = 'SDK';
        try {
          await sdk.wallets.queryWallets({ query: { filter: '{}', limit: 1 } });
          tokenData = {
            access_token: 'SDK-managed internally',
            token_type: 'Bearer',
            expires_in: 14400,
            sdk_verified: true,
            test_call_success: true
          };
        } catch (err) {
          tokenData = {
            access_token: 'SDK-managed internally',
            sdk_verified: true,
            test_call_success: false,
            error: err.message
          };
        }
      } catch (sdkError) {
        console.error('SDK failed:', sdkError);
        return res.status(500).json({ error: 'SDK initialization failed', details: sdkError.message });
      }
    } else {
      const response = await fetch('https://platform.rise.ai/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: config.APP_ID,
          client_secret: config.APP_SECRET,
          instance_id: instanceId
        })
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ error: 'Token exchange failed', details: text });
      }

      tokenData = await response.json();
      methodUsed = 'Plain HTTP';
    }

    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.send(`
      <html><body>
      ✅ OAuth Success!<br><br>
      Instance ID:<pre>${instanceId}</pre>
      Method:<pre>${methodUsed}</pre>
      Token:<pre>${JSON.stringify(tokenData, null, 2)}</pre>
      <a href="/">Back Home</a>
      </body></html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
