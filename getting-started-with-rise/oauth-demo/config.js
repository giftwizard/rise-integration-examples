import dotenv from 'dotenv';
dotenv.config();

const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const USE_SDK = process.env.USE_SDK === 'true';
const PORT = process.env.PORT || 3000;

// Validate required envs
if (!APP_ID || !APP_SECRET || !REDIRECT_URL) {
  console.error('❌ Missing required environment variables: APP_ID, APP_SECRET, REDIRECT_URL');
  process.exit(1);
}

export default {
  APP_ID,
  APP_SECRET,
  REDIRECT_URL,
  USE_SDK,
  PORT
};
