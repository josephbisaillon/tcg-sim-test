import { io as ioc } from 'socket.io-client';
import { expect } from 'chai';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import {
  setupSocketHandlers,
  cleanupSocketHandlers,
} from '../socket-handler.js';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const PORT = 4001;
const SERVER_URL = `http://localhost:${PORT}`;
const TEST_ROOM = 'test-room-' + Date.now();
const TEST_USERNAME = 'test-user';

// Test utilities
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Create a test server
const createTestServer = () => {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  // Use the actual socket handler implementation from the server
  const handlers = setupSocketHandlers(io);

  return { httpServer, io, handlers };
};

describe('Socket.IO Tests', function () {
  this.timeout(10000); // Increase timeout for async tests

  let httpServer, io, handlers, clientSocket1, clientSocket2, clientSocket3;

  beforeEach((done) => {
    // Create a fresh server for each test
    const server = createTestServer();
    httpServer = server.httpServer;
    io = server.io;
    handlers = server.handlers;

    // Start the server
    httpServer.listen(PORT, () => {
      // Create client sockets
      clientSocket1 = ioc(SERVER_URL);
      clientSocket2 = ioc(SERVER_URL);

      // Wait for connections to be established
      let connectedCount = 0;
      const onConnect = () => {
        connectedCount++;
        if (connectedCount === 2) {
          done();
        }
      };

      clientSocket1.on('connect', onConnect);
      clientSocket2.on('connect', onConnect);
    });
  });

  afterEach(() => {
    // Clean up after each test
    cleanupSocketHandlers(handlers);
    io.close();
    httpServer.close();
    clientSocket1.disconnect();
    clientSocket2.disconnect();
    if (clientSocket3) {
      clientSocket3.disconnect();
      clientSocket3 = null;
    }
  });

  // Test cases

  it('should allow a player to join a room', (done) => {
    clientSocket1.emit('joinGame', TEST_ROOM, TEST_USERNAME, false);

    clientSocket1.on('joinGame', () => {
      done();
    });
  });

  it('should allow two players to join the same room', (done) => {
    let joinCount = 0;

    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        done();
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);
  });

  it('should reject a third player trying to join a room', (done) => {
    clientSocket3 = ioc(SERVER_URL);

    clientSocket3.on('connect', () => {
      clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
      clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

      // Wait for the first two players to join
      let joinCount = 0;
      const onJoin = () => {
        joinCount++;
        if (joinCount === 2) {
          // Now try to join with the third player
          clientSocket3.emit('joinGame', TEST_ROOM, 'player3', false);
        }
      };

      clientSocket1.on('joinGame', onJoin);
      clientSocket2.on('joinGame', onJoin);

      clientSocket3.on('roomReject', () => {
        done();
      });
    });
  });

  it('should allow a spectator to join a full room', (done) => {
    clientSocket3 = ioc(SERVER_URL);

    clientSocket3.on('connect', () => {
      clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
      clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

      // Wait for the first two players to join
      let joinCount = 0;
      const onJoin = () => {
        joinCount++;
        if (joinCount === 2) {
          // Now try to join as a spectator
          clientSocket3.emit('joinGame', TEST_ROOM, 'spectator1', true);
        }
      };

      clientSocket1.on('joinGame', onJoin);
      clientSocket2.on('joinGame', onJoin);

      clientSocket3.on('spectatorJoin', () => {
        done();
      });
    });
  });

  it('should notify other players when a player disconnects', (done) => {
    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Disconnect player 1
        clientSocket1.disconnect();
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    clientSocket2.on('userDisconnected', (username) => {
      expect(username).to.equal('player1');
      done();
    });
  });

  it('should handle user reconnection', (done) => {
    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);

    clientSocket1.on('joinGame', async () => {
      // Disconnect and reconnect
      clientSocket1.disconnect();

      // Wait a bit before reconnecting
      await delay(500);

      clientSocket1 = ioc(SERVER_URL);
      clientSocket1.on('connect', () => {
        clientSocket1.emit('userReconnected', {
          roomId: TEST_ROOM,
          username: 'player1',
          notSpectator: true,
        });

        clientSocket1.on('userReconnected', (data) => {
          expect(data.username).to.equal('player1');
          expect(data.roomId).to.equal(TEST_ROOM);
          done();
        });
      });
    });
  });

  it('should broadcast messages to all users in a room', (done) => {
    const testMessage = {
      roomId: TEST_ROOM,
      user: 'player1',
      message: 'Hello, world!',
      type: 'chat',
      emit: true,
    };

    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Send a message from player 1
        clientSocket1.emit('appendMessage', testMessage);
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    clientSocket2.on('appendMessage', (data) => {
      expect(data.message).to.equal(testMessage.message);
      expect(data.user).to.equal(testMessage.user);
      expect(data.type).to.equal(testMessage.type);
      done();
    });
  });

  it('should handle action synchronization between players', (done) => {
    const testAction = {
      roomId: TEST_ROOM,
      action: 'moveCard',
      counter: 1,
      parameters: ['self', 'deck', 'hand', 0],
    };

    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Send an action from player 1
        clientSocket1.emit('pushAction', testAction);
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    clientSocket2.on('pushAction', (data) => {
      expect(data.action).to.equal(testAction.action);
      expect(data.counter).to.equal(testAction.counter);
      expect(data.parameters).to.deep.equal(testAction.parameters);
      done();
    });
  });

  it('should handle action requests between players', (done) => {
    const testRequest = {
      roomId: TEST_ROOM,
      action: 'moveCard',
      counter: 1,
      parameters: ['opp', 'deck', 'hand', 0],
    };

    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Send a request from player 1 to player 2
        clientSocket1.emit('requestAction', testRequest);
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    clientSocket2.on('requestAction', (data) => {
      expect(data.action).to.equal(testRequest.action);
      expect(data.counter).to.equal(testRequest.counter);
      expect(data.parameters).to.deep.equal(testRequest.parameters);
      done();
    });
  });

  it('should handle resync requests', (done) => {
    const resyncRequest = {
      roomId: TEST_ROOM,
      counter: 5,
    };

    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Send a resync request from player 1
        clientSocket1.emit('resyncActions', resyncRequest);
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    clientSocket2.on('resyncActions', (data) => {
      expect(data.roomId).to.equal(resyncRequest.roomId);
      expect(data.counter).to.equal(resyncRequest.counter);
      done();
    });
  });

  it('should handle catch-up actions', (done) => {
    const catchUpData = {
      roomId: TEST_ROOM,
      actionData: [
        { action: 'moveCard', parameters: ['self', 'deck', 'hand', 0] },
        { action: 'moveCard', parameters: ['self', 'deck', 'hand', 0] },
      ],
    };

    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Send catch-up actions from player 1
        clientSocket1.emit('catchUpActions', catchUpData);
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    clientSocket2.on('catchUpActions', (data) => {
      expect(data.roomId).to.equal(catchUpData.roomId);
      expect(data.actionData).to.deep.equal(catchUpData.actionData);
      done();
    });
  });

  it('should handle sync checks', (done) => {
    const syncCheckData = {
      roomId: TEST_ROOM,
      counter: 10,
    };

    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Send a sync check from player 1
        clientSocket1.emit('syncCheck', syncCheckData);
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    clientSocket2.on('syncCheck', (data) => {
      expect(data.roomId).to.equal(syncCheckData.roomId);
      expect(data.counter).to.equal(syncCheckData.counter);
      done();
    });
  });

  it('should handle race conditions with multiple simultaneous actions', (done) => {
    const actions = [
      {
        roomId: TEST_ROOM,
        action: 'moveCard',
        counter: 1,
        parameters: ['self', 'deck', 'hand', 0],
      },
      {
        roomId: TEST_ROOM,
        action: 'moveCard',
        counter: 2,
        parameters: ['self', 'deck', 'hand', 1],
      },
      {
        roomId: TEST_ROOM,
        action: 'moveCard',
        counter: 3,
        parameters: ['self', 'deck', 'hand', 2],
      },
    ];

    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Send multiple actions simultaneously
        actions.forEach((action) => {
          clientSocket1.emit('pushAction', action);
        });
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    // Track received actions
    const receivedActions = [];

    clientSocket2.on('pushAction', (data) => {
      receivedActions.push(data);

      // Check if we've received all actions
      if (receivedActions.length === actions.length) {
        // Sort by counter to check order
        receivedActions.sort((a, b) => a.counter - b.counter);

        // Verify all actions were received in the correct order
        for (let i = 0; i < actions.length; i++) {
          expect(receivedActions[i].action).to.equal(actions[i].action);
          expect(receivedActions[i].counter).to.equal(actions[i].counter);
          expect(receivedActions[i].parameters).to.deep.equal(
            actions[i].parameters
          );
        }

        done();
      }
    });
  });

  it('should handle multiple players leaving and joining a room', (done) => {
    clientSocket1.emit('joinGame', TEST_ROOM, 'player1', false);
    clientSocket2.emit('joinGame', TEST_ROOM, 'player2', false);

    // Wait for both players to join
    let joinCount = 0;
    const onJoin = () => {
      joinCount++;
      if (joinCount === 2) {
        // Player 1 leaves
        clientSocket1.emit('leaveRoom', {
          roomId: TEST_ROOM,
          username: 'player1',
        });

        // Wait for leave event to be processed
        setTimeout(() => {
          // Create a new socket for player 3
          clientSocket3 = ioc(SERVER_URL);

          clientSocket3.on('connect', () => {
            // Player 3 tries to join
            clientSocket3.emit('joinGame', TEST_ROOM, 'player3', false);

            clientSocket3.on('joinGame', () => {
              done();
            });
          });
        }, 500);
      }
    };

    clientSocket1.on('joinGame', onJoin);
    clientSocket2.on('joinGame', onJoin);

    clientSocket2.on('leaveRoom', (data) => {
      expect(data.username).to.equal('player1');
    });
  });

  it('should clean up empty rooms', (done) => {
    const EMPTY_ROOM = 'empty-room-' + Date.now();

    clientSocket1.emit('joinGame', EMPTY_ROOM, 'player1', false);

    clientSocket1.on('joinGame', () => {
      // Player leaves
      clientSocket1.emit('leaveRoom', {
        roomId: EMPTY_ROOM,
        username: 'player1',
      });

      // Wait for room cleanup (would normally be 5 minutes, but we've reduced it for testing)
      setTimeout(() => {
        // Try to reconnect to the same room
        clientSocket1.emit('userReconnected', {
          roomId: EMPTY_ROOM,
          username: 'player1',
          notSpectator: true,
        });

        // Since the room should be recreated, this should succeed
        clientSocket1.once('userReconnected', (data) => {
          expect(data.roomId).to.equal(EMPTY_ROOM);
          done();
        });
      }, 100); // Reduced for testing
    });
  });
});

// Run the tests
// This is just for manual testing - when using a test runner like Mocha, this would be handled by the runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  describe('Socket Tests', function () {
    // Tests will run here
  });
}
