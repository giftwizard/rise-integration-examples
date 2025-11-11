import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import config from './config.js';

import indexRoutes from './routes/index.js';
import oauthRoutes from './routes/oauth.js';
import sdkExampleRoutes from './routes/sdkExamples.js';
import httpExampleRoutes from './routes/httpExamples.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = config.PORT;

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

// Routes
app.use('/', indexRoutes);
app.use('/oauth', oauthRoutes);
app.use('/api', sdkExampleRoutes);
app.use('/api', httpExampleRoutes);

// Server start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`Redirect URL set to: ${config.REDIRECT_URL}`);
});
