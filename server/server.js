import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import bcrypt from 'bcryptjs';
import config from './config.js';
import database from './database.js';
import { setupSocketLogger } from './utils/socket-logger.js';
import { setupSocketHandlers } from './socket-handler.js';

async function main() {
  try {
    // Initialize database
    await database.initialize();

    // Express app setup
    const app = express();
    const server = http.createServer(app);

    // Socket.IO setup
    const io = new Server(server, {
      connectionStateRecovery: {},
      cors: config.socketIO.cors,
    });

    // Socket.IO Admin UI
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(
      config.socketIO.adminUI.password,
      saltRounds
    );

    instrument(io, {
      auth: {
        type: 'basic',
        username: config.socketIO.adminUI.username,
        password: hashedPassword,
      },
      mode: config.development.enableDebugLogs ? 'development' : 'production',
    });

    // Setup socket event logging in development
    if (config.development.logSocketEvents) {
      setupSocketLogger(io);
    }

    // Express middleware
    app.set('view engine', 'ejs');
    app.set('views', config.server.clientDir);
    app.use(cors());
    app.use(express.static(config.server.clientDir));

    // Routes
    app.get('/', (_, res) => {
      res.render('index', { importDataJSON: null });
    });

    app.get('/import', async (req, res) => {
      const key = req.query.key;
      if (!key) {
        return res.status(400).json({ error: 'Key parameter is missing' });
      }

      try {
        const row = await database.get(
          'SELECT value FROM KeyValuePairs WHERE key = ?',
          [key]
        );

        if (row) {
          res.render('index', { importDataJSON: row.value });
        } else {
          res.status(404).json({ error: 'Key not found' });
        }
      } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Setup Socket.IO event handlers
    const socketHandlers = setupSocketHandlers(io);

    // Start the server
    const { port, host } = config.server;
    server.listen(port, host, () => {
      console.log(`Server is running at http://${host}:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${config.database.path}`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');

      // Close the server
      server.close(() => {
        console.log('HTTP server closed');
      });

      // Close database connection
      try {
        await database.close();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database:', error);
      }

      process.exit(0);
    };

    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
}

main();
