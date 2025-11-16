import { Router } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from '../config.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public', 'index.html'));
});

router.get('/api/config', (req, res) => {
  res.json({
    appId: config.APP_ID,
    redirectUrl: config.REDIRECT_URL,
    hasSecret: !!config.APP_SECRET,
    useSdk: config.USE_SDK
  });
});

export default router;
