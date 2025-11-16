import { Router } from 'express';

const router = Router();

router.post('/example-http-call', async (req, res) => {
  try {
    const { instanceId, accessToken } = req.body;

    if (!instanceId || !accessToken) {
      return res.status(400).json({ error: 'Missing instanceId or accessToken' });
    }

    const response = await fetch('https://platform.rise.ai/api/v1/wallets/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query: { filter: '{}', limit: 10 } })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'API call failed', details: text });
    }

    const data = await response.json();
    res.json({ success: true, method: 'Plain HTTP', data });
  } catch (err) {
    console.error('HTTP call error:', err);
    res.status(500).json({ error: 'HTTP call failed', message: err.message });
  }
});

export default router;
