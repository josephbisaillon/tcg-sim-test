import database from './database.js';
import config from './config.js';

/**
 * Generates a random key of specified length
 * @param {number} length - The length of the key to generate
 * @returns {string} The generated key
 */
export function generateRandomKey(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters.charAt(randomIndex);
  }
  return key;
}

/**
 * Sets up Socket.IO event handlers
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 * @returns {Map<string, any>} The roomInfo map for testing purposes
 */
export function setupSocketHandlers(io) {
  // Room management
  const roomInfo = new Map();

  // Function to periodically clean up empty rooms
  const cleanUpEmptyRooms = () => {
    let roomsRemoved = 0;
    roomInfo.forEach((room, roomId) => {
      if (room.players.size === 0 && room.spectators.size === 0) {
        roomInfo.delete(roomId);
        roomsRemoved++;
      }
    });

    if (roomsRemoved > 0 && config.development.enableDebugLogs) {
      console.log(
        `Cleaned up ${roomsRemoved} empty rooms. Remaining: ${roomInfo.size}`
      );
    }
  };

  // Set up a timer to clean up empty rooms every 5 minutes
  const cleanupInterval = setInterval(cleanUpEmptyRooms, 5 * 60 * 1000);

  // Socket.IO Connection Handling
  io.on('connection', async (socket) => {
    // Function to handle disconnections (unintended)
    const disconnectHandler = (roomId, username) => {
      if (!socket.data.leaveRoom) {
        socket.to(roomId).emit('userDisconnected', username);
      }

      // Remove the disconnected user from the roomInfo map
      if (roomInfo.has(roomId)) {
        const room = roomInfo.get(roomId);

        if (room.players.has(username)) {
          room.players.delete(username);
        } else if (room.spectators.has(username)) {
          room.spectators.delete(username);
        }

        // If both players and spectators are empty, remove the roomInfo entry
        if (room.players.size === 0 && room.spectators.size === 0) {
          roomInfo.delete(roomId);
        }
      }
    };

    // Function to handle event emission
    const emitToRoom = (eventName, data) => {
      socket.broadcast.to(data.roomId).emit(eventName, data);
      if (eventName === 'leaveRoom') {
        socket.leave(data.roomId);
        if (socket.data.disconnectListener) {
          socket.data.leaveRoom = true;
          socket.data.disconnectListener();
          socket.removeListener('disconnect', socket.data.disconnectListener);
          socket.data.leaveRoom = false;
        }
      }
    };

    // Handle game state storage
    socket.on('storeGameState', async (exportData) => {
      if (database.isDatabaseCapacityReached) {
        socket.emit(
          'exportGameStateFailed',
          'Database capacity reached. Cannot store more game states.'
        );
      } else {
        const key = generateRandomKey(4);
        try {
          await database.run(
            'INSERT OR REPLACE INTO KeyValuePairs (key, value) VALUES (?, ?)',
            [key, exportData]
          );
          socket.emit('exportGameStateSuccessful', key);
        } catch (error) {
          console.error('Error storing game state:', error);
          socket.emit(
            'exportGameStateFailed',
            'Error exporting game! Please try again or save as a file.'
          );
        }
      }
    });

    // Handle joining a game
    socket.on('joinGame', (roomId, username, isSpectator) => {
      if (!roomInfo.has(roomId)) {
        roomInfo.set(roomId, { players: new Set(), spectators: new Set() });
      }
      const room = roomInfo.get(roomId);

      if (room.players.size < 2 || isSpectator) {
        socket.join(roomId);
        // Check if the user is a spectator or there are fewer than 2 players
        if (isSpectator) {
          room.spectators.add(username);
          socket.emit('spectatorJoin');
        } else {
          room.players.add(username);
          socket.emit('joinGame');
          socket.data.disconnectListener = () =>
            disconnectHandler(roomId, username);
          socket.on('disconnect', socket.data.disconnectListener);
        }
      } else {
        socket.emit('roomReject');
      }
    });

    // Handle user reconnection
    socket.on('userReconnected', (data) => {
      if (!roomInfo.has(data.roomId)) {
        roomInfo.set(data.roomId, {
          players: new Set(),
          spectators: new Set(),
        });
      }
      const room = roomInfo.get(data.roomId);
      socket.join(data.roomId);
      if (!data.notSpectator) {
        room.spectators.add(data.username);
      } else {
        room.players.add(data.username);
        socket.data.disconnectListener = () =>
          disconnectHandler(data.roomId, data.username);
        socket.on('disconnect', socket.data.disconnectListener);
        io.to(data.roomId).emit('userReconnected', data);
      }
    });

    // List of socket events
    const events = [
      'leaveRoom',
      'requestAction',
      'pushAction',
      'resyncActions',
      'catchUpActions',
      'syncCheck',
      'appendMessage',
      'spectatorActionData',
      'initiateImport',
      'endImport',
      'lookAtCards',
      'stopLookingAtCards',
      'revealCards',
      'hideCards',
      'revealShortcut',
      'hideShortcut',
      'lookShortcut',
      'stopLookingShortcut',
    ];

    // Register event listeners using the common function
    for (const event of events) {
      socket.on(event, (data) => {
        emitToRoom(event, data);
      });
    }
  });

  // Return the roomInfo map and cleanup interval for testing purposes
  return { roomInfo, cleanupInterval };
}

/**
 * Cleans up socket handlers (useful for tests)
 * @param {object} handlers - The handlers object returned by setupSocketHandlers
 */
export function cleanupSocketHandlers(handlers) {
  if (handlers && handlers.cleanupInterval) {
    clearInterval(handlers.cleanupInterval);
  }
}
