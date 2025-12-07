import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { giftCardRouter } from './routes.js';
import { webhookRouter } from './webhooks.js';
import { uiRouter } from './ui.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Logging and JSON parsing
app.use(morgan('dev'));
app.use(bodyParser.json({ type: ['application/json', 'application/*+json'] }));

// UI route (must be before /api routes to avoid conflicts)
app.use('/', uiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Business routes (your POS/native gift card system)
app.use('/api', giftCardRouter);

// Rise webhooks receiver
app.use('/webhooks/rise', webhookRouter);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // This server mocks a native platform that both handles its own gift cards
  // and syncs with Rise.ai per the bidirectional sync approach.
  console.log(`Native gift card sync example listening on http://localhost:${port}`);
});


