import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Environment detection
const isDevelopment = process.env.NODE_ENV !== 'production';

const config = {
  // Server settings
  server: {
    port: parseInt(process.env.PORT || '4000'),
    host: process.env.HOST || 'localhost',
    clientDir: path.join(__dirname, '../client'),
  },

  // Database settings
  database: {
    path: process.env.DB_PATH || path.join(__dirname, 'database/db.sqlite'),
    maxSizeGB: parseFloat(process.env.DB_MAX_SIZE_GB || '15'),
    checkInterval: parseInt(process.env.DB_CHECK_INTERVAL || 60 * 60 * 1000), // Default: 1 hour
  },

  // Socket.IO settings
  socketIO: {
    cors: {
      origin: isDevelopment
        ? ['http://localhost:4000', 'https://admin.socket.io']
        : ['https://ptcgsim.online', 'https://admin.socket.io'],
      credentials: true,
    },
    adminUI: {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'defaultPassword',
    },
  },

  // Development settings
  development: {
    enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true' || isDevelopment,
    logSocketEvents: process.env.LOG_SOCKET_EVENTS === 'true' || isDevelopment,
  },
};

export default config;
