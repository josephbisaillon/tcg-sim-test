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

    // Handle legacy game state storage (for backward compatibility)
    socket.on('storeGameState', async (exportData) => {
      if (database.isDatabaseCapacityReached) {
        socket.emit(
          'exportGameStateFailed',
          'Database capacity reached. Cannot store more game states.'
        );
      } else {
        try {
          // Parse the data to get the room ID
          const gameState = JSON.parse(exportData);
          const roomId = gameState.roomId;
          
          // Use the room ID as the key for auto-saved states
          const key = `autosave_${roomId}`;
          
          // Add a timestamp to the game state
          gameState.savedAt = Date.now();
          gameState.version = '1.6.0';
          gameState.stateType = 'legacy';
          
          // Store the game state in the database
          await database.run(
            'INSERT OR REPLACE INTO KeyValuePairs (key, value) VALUES (?, ?)',
            [key, JSON.stringify(gameState)]
          );
          
          // Also store as a snapshot for future use
          try {
            await database.saveSnapshot(roomId, gameState);
          } catch (snapshotError) {
            console.error('Error storing as snapshot:', snapshotError);
            // Continue even if snapshot storage fails
          }
          
          console.log(`Auto-saved game state for room ${roomId}`);
        } catch (error) {
          console.error('Error storing game state:', error);
        }
      }
    });
    
    // Handle snapshot storage
    socket.on('storeGameSnapshot', async (snapshotData) => {
      if (database.isDatabaseCapacityReached) {
        socket.emit(
          'snapshotStoreFailed',
          'Database capacity reached. Cannot store more snapshots.'
        );
      } else {
        try {
          // Parse the data to get the room ID
          const snapshot = JSON.parse(snapshotData);
          const roomId = snapshot.roomId;
          
          // Save the snapshot
          const snapshotId = await database.saveSnapshot(roomId, snapshot);
          
          console.log(`Snapshot ${snapshotId} saved for room ${roomId}`);
          socket.emit('snapshotStoreSuccess', { snapshotId });
        } catch (error) {
          console.error('Error storing snapshot:', error);
          socket.emit('snapshotStoreFailed', error.message);
        }
      }
    });
    
    // Check if a saved state exists for a room
    socket.on('checkSavedState', async (roomId, callback) => {
      try {
        // Check for both types of saved states
        const stateInfo = await database.checkSavedState(roomId);
        
        callback(stateInfo);
      } catch (error) {
        console.error('Error checking saved state:', error);
        callback({ hasState: false, error: error.message });
      }
    });
    
    // Load a saved game state (legacy method)
    socket.on('loadSavedState', async (roomId, username, isSpectator) => {
      try {
        const key = `autosave_${roomId}`;
        const row = await database.get(
          'SELECT value FROM KeyValuePairs WHERE key = ?',
          [key]
        );
        
        if (row) {
          // Parse the saved game state
          const gameState = JSON.parse(row.value);
          
          // Join the room
          if (!roomInfo.has(roomId)) {
            roomInfo.set(roomId, { players: new Set(), spectators: new Set() });
          }
          const room = roomInfo.get(roomId);
          
          if (room.players.size < 2 || isSpectator) {
            socket.join(roomId);
            
            if (isSpectator) {
              room.spectators.add(username);
              socket.emit('spectatorJoin');
            } else {
              room.players.add(username);
              
              // Send the saved game state to the client
              socket.emit('loadSavedGameState', gameState);
              
              socket.data.disconnectListener = () =>
                disconnectHandler(roomId, username);
              socket.on('disconnect', socket.data.disconnectListener);
            }
          } else {
            socket.emit('roomReject');
          }
        } else {
          // If no saved state is found, fall back to normal join
          socket.emit(
            'joinGame',
            roomId,
            username,
            isSpectator,
            true // isReconnection
          );
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        // Fall back to normal join on error
        socket.emit(
          'joinGame',
          roomId,
          username,
          isSpectator,
          true // isReconnection
        );
      }
    });
    
    // Load a saved snapshot
    socket.on('loadSavedSnapshot', async (roomId, username, isSpectator) => {
      try {
        // Get the latest snapshot for this room
        const snapshot = await database.getLatestSnapshot(roomId);
        
        if (!snapshot) {
          // Fall back to legacy state if no snapshot exists
          socket.emit('loadSavedState', roomId, username, isSpectator);
          return;
        }
        
        // Join the room
        if (!roomInfo.has(roomId)) {
          roomInfo.set(roomId, { players: new Set(), spectators: new Set() });
        }
        const room = roomInfo.get(roomId);
        
        if (room.players.size < 2 || isSpectator) {
          socket.join(roomId);
          
          if (isSpectator) {
            room.spectators.add(username);
            socket.emit('spectatorJoin');
          } else {
            room.players.add(username);
            
            // Send the snapshot to the client
            socket.emit('loadGameSnapshot', snapshot.data);
            
            socket.data.disconnectListener = () =>
              disconnectHandler(roomId, username);
            socket.on('disconnect', socket.data.disconnectListener);
          }
        } else {
          socket.emit('roomReject');
        }
      } catch (error) {
        console.error('Error loading snapshot:', error);
        
        // Fall back to legacy state on error
        socket.emit('loadSavedState', roomId, username, isSpectator);
      }
    });

    // Handle joining a game
    socket.on('joinGame', (roomId, username, isSpectator, isReconnection = false) => {
      if (!roomInfo.has(roomId)) {
        roomInfo.set(roomId, { players: new Set(), spectators: new Set() });
      }
      const room = roomInfo.get(roomId);

      if (room.players.size < 2 || isSpectator || isReconnection) {
        socket.join(roomId);
        // Check if the user is a spectator or there are fewer than 2 players
        if (isSpectator) {
          room.spectators.add(username);
          socket.emit('spectatorJoin');
        } else {
          room.players.add(username);
          
          // Pass the isReconnection flag to the client
          socket.emit('joinGame', isReconnection);
          
          // Only broadcast to other players if this is NOT a reconnection
          if (!isReconnection) {
            // Broadcast to other players in the room that a new player has joined
            socket.to(roomId).emit('playerJoined', { username });
          }
          
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

    // Handle heartbeat for connection quality monitoring
    socket.on('heartbeat', (data) => {
      // Simply echo back the timestamp for round-trip time calculation
      socket.emit('heartbeatResponse', data);
    });
    
    // Handle snapshot-based sync
    socket.on('syncWithSnapshot', (data) => {
      // Forward the snapshot to other players in the room
      socket.to(data.roomId).emit('syncWithSnapshot', data);
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
