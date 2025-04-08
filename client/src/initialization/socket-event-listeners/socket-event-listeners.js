import { flipBoard } from '../../actions/general/flip-board.js';
import { reset } from '../../actions/general/reset.js';
import {
  hideCards,
  hideShortcut,
  lookAtCards,
  lookShortcut,
  revealCards,
  revealShortcut,
  stopLookingAtCards,
  stopLookingShortcut,
} from '../../actions/general/reveal-and-hide.js';
import { socket, systemState } from '../../front-end.js';
import { appendMessage } from '../../setup/chatbox/append-message.js';
import { exchangeData } from '../../setup/deck-constructor/exchange-data.js';
import {
  bufferAction,
  clearActionBuffer,
  processBufferedActions,
} from '../../setup/general/action-buffer.js';
import { acceptAction } from '../../setup/general/accept-action.js';
import { catchUpActions } from '../../setup/general/catch-up-actions.js';
import { cleanActionData } from '../../setup/general/clean-action-data.js';
import { resyncActions } from '../../setup/general/resync-actions.js';
import { spectatorJoin } from '../../setup/spectator/spectator-join.js';
import { startKeybindsSleep } from '../../actions/keybinds/keybindSleep.js';
import { updateURL } from '../url-persistence/url-persistence.js';

let isImporting = false;
let syncCheckInterval;
let spectatorActionInterval;
let autoSaveInterval;

// Import snapshot functionality
import { saveGameSnapshot } from '../../setup/snapshots/snapshot-manager.js';
import { restoreGameFromSnapshot } from '../../setup/snapshots/snapshot-restoration.js';

/**
 * Saves the current game state to the server
 * @deprecated Use saveGameSnapshot instead
 */
const saveGameState = () => {
  // Only save if we're in a two-player game and have actions to save
  if (!systemState.isTwoPlayer || systemState.selfActionData.length === 0) {
    return;
  }

  console.log('Auto-saving game state (legacy method)...');
  
  // Create a game state object with all necessary data to restore the game
  const gameState = {
    roomId: systemState.roomId,
    selfUsername: systemState.p2SelfUsername,
    oppUsername: systemState.p2OppUsername,
    selfDeckData: systemState.selfDeckData,
    oppDeckData: systemState.p2OppDeckData,
    selfActionData: systemState.selfActionData,
    oppActionData: systemState.oppActionData,
    selfCounter: systemState.selfCounter,
    oppCounter: systemState.oppCounter,
    timestamp: Date.now()
  };
  
  // Store the game state on the server
  socket.emit('storeGameState', JSON.stringify(gameState));
  
  // Also save as a snapshot for future use
  saveGameSnapshot();
};

export const removeSyncIntervals = () => {
  clearInterval(syncCheckInterval);
  clearInterval(spectatorActionInterval);
  clearInterval(autoSaveInterval);
};
export const initializeSocketEventListeners = () => {
  socket.on('joinGame', (isReconnection = false) => {
    const connectedRoom = document.getElementById('connectedRoom');
    const lobby = document.getElementById('lobby');
    const roomHeaderText = document.getElementById('roomHeaderText');
    const chatbox = document.getElementById('chatbox');
    const p2ExplanationBox = document.getElementById('p2ExplanationBox');
    const flipBoardButton = document.getElementById('flipBoardButton');
    
    roomHeaderText.textContent = 'id: ' + systemState.roomId;
    chatbox.innerHTML = '';
    connectedRoom.style.display = 'flex';
    lobby.style.display = 'none';
    p2ExplanationBox.style.display = 'none';
    flipBoardButton.style.display = 'none';
    
    if (systemState.initiator === 'opp') {
      flipBoard();
    }
    
    systemState.isTwoPlayer = true;
    
    // Only clean action data and reset if this is NOT a reconnection
    if (!isReconnection) {
      console.log('New connection, initializing game state');
      cleanActionData('self');
      cleanActionData('opp');
      clearActionBuffer();
      systemState.isResyncing = false;
      systemState.lastFullSyncTime = Date.now();
      reset('opp', true, false, false, false);
      exchangeData(
        'self',
        systemState.p2SelfUsername,
        systemState.selfDeckData,
        systemState.cardBackSrc,
        document.getElementById('coachingModeCheckbox').checked
      );
    } else {
      // For reconnections, request a resync instead of resetting
      console.log('Reconnecting via URL parameters, requesting resync');
      systemState.isResyncing = true;
      systemState.lastFullSyncTime = Date.now();
      
      // Request a resync of the current game state
      const resyncData = {
        roomId: systemState.roomId,
        counter: systemState.oppCounter || 0
      };
      socket.emit('resyncActions', resyncData);
      
      // Still exchange data to ensure the server knows about this player
      exchangeData(
        'self',
        systemState.p2SelfUsername,
        systemState.selfDeckData,
        systemState.cardBackSrc,
        document.getElementById('coachingModeCheckbox').checked
      );
    }

    // Initialize sync UI if not already initialized
    if (typeof initializeSyncUI === 'function') {
      initializeSyncUI();
    }
    
    // Initialize connection quality tracking
    if (typeof initializeConnectionQuality === 'function') {
      initializeConnectionQuality();
    }
    
    // Initialize sync checker with more frequent checks (1.5 seconds instead of 3)
    syncCheckInterval = setInterval(() => {
      if (systemState.isTwoPlayer) {
        const data = {
          roomId: systemState.roomId,
          counter: systemState.selfCounter,
        };
        socket.emit('syncCheck', data);
      }
    }, 1500);

    spectatorActionInterval = setInterval(() => {
      if (systemState.isTwoPlayer) {
        const data = {
          selfUsername: systemState.p2SelfUsername,
          selfDeckData: systemState.selfDeckData,
          oppDeckData: systemState.p2OppDeckData,
          oppUsername: systemState.p2OppUsername,
          roomId: systemState.roomId,
          spectatorActionData: systemState.exportActionData,
          socketId: socket.id,
        };
        socket.emit('spectatorActionData', data);
      }
    }, 1000);
    
    // Initialize auto-save interval (every 30 seconds)
    autoSaveInterval = setInterval(() => {
      saveGameSnapshot();
    }, 30000);
  });
  socket.on('spectatorJoin', () => {
    spectatorJoin();
  });
  socket.on('roomReject', () => {
    let overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    let container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.textAlign = 'center';
    container.style.color = '#fff';

    let message = document.createElement('p');
    message.innerHTML =
      'Room is full.<br>Enable spectator mode to watch the game.';
    message.style.fontSize = '24px';

    container.appendChild(message);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  });
  socket.on('connect', () => {
    const notSpectator = !(
      document.getElementById('spectatorModeCheckbox').checked &&
      systemState.isTwoPlayer
    );
    
    // Only handle reconnection if we're already in a room
    if (systemState.isTwoPlayer) {
      // Check if this is a reconnection from URL parameters
      const isURLReconnection = window.location.search.includes('room=');
      
      // Add a timestamp to track reconnection attempts
      const now = Date.now();
      if (!systemState.lastReconnectTime || now - systemState.lastReconnectTime > 5000) {
        systemState.lastReconnectTime = now;
        
        const data = {
          roomId: systemState.roomId,
          username: systemState.p2SelfUsername,
          notSpectator: notSpectator,
          isURLReconnection: isURLReconnection
        };
        
        socket.emit('userReconnected', data);
        
        // Only show reconnection message if not from URL and not too frequent
        if (!notSpectator && !isURLReconnection) {
          appendMessage(
            '',
            systemState.spectatorUsername + ' reconnected!',
            'announcement',
            false
          );
        }
      } else {
        console.log('Suppressing reconnection message due to frequency limit');
      }
    }
  });
  socket.on('playerJoined', (data) => {
    // Handle notification when a new player joins (not a reconnection)
    appendMessage('', data.username + ' joined the room', 'announcement', false);
  });
  
  socket.on('userReconnected', (data) => {
    // Only show reconnection message if not from URL parameters
    if (!data.isURLReconnection) {
      appendMessage('', data.username + ' reconnected!', 'announcement', false);
    } else {
      console.log(`${data.username} reconnected via URL parameters`);
    }
  });
  
  socket.on('userDisconnected', (username) => {
    appendMessage('', username + ' disconnected', 'announcement', false);
  });
  socket.on('disconnect', () => {
    if (systemState.isTwoPlayer) {
      const isSpectator =
        systemState.isTwoPlayer &&
        document.getElementById('spectatorModeCheckbox').checked;
      const username = isSpectator
        ? systemState.spectatorUsername
        : systemState.p2SelfUsername;
      appendMessage('', username + ' disconnected', 'announcement', false);
    }
  });
  socket.on('leaveRoom', (data) => {
    if (!data.isSpectator) {
      cleanActionData('opp');
    }
    appendMessage('', data.username + ' left the room', 'announcement', false);
  });
  socket.on('appendMessage', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
    }
    appendMessage(data.user, data.message, data.type, data.emit);
  });
  socket.on('requestAction', (data) => {
    const notSpectator = !(
      document.getElementById('spectatorModeCheckbox').checked &&
      systemState.isTwoPlayer
    );
    if (
      (notSpectator && data.counter === systemState.selfCounter) ||
      isImporting
    ) {
      startKeybindsSleep();
      acceptAction('self', data.action, data.parameters);
    }
  });
  // reset counter when importing game state
  socket.on('initiateImport', () => {
    systemState.spectatorCounter = 0; //reset spectator counter to make sure it catches all of the actions
    isImporting = true;
    cleanActionData('self');
    cleanActionData('opp');
    clearActionBuffer();
    systemState.isResyncing = false;
    systemState.lastFullSyncTime = Date.now();
  });
  socket.on('endImport', () => {
    isImporting = false;
  });
  socket.on('pushAction', (data) => {
    const notSpectator = !(
      document.getElementById('spectatorModeCheckbox').checked &&
      systemState.isTwoPlayer
    );

    if (notSpectator) {
      if (data.action === 'exchangeData') {
        cleanActionData('opp');
      }

      // Use the action buffer system to handle the action
      const wasBuffered = bufferAction(data);

      // If the action wasn't buffered (it was processed immediately),
      // check if there are any buffered actions that can now be processed
      if (!wasBuffered) {
        processBufferedActions();
      }
    }
  });
  socket.on('resyncActions', () => {
    const notSpectator = !(
      document.getElementById('spectatorModeCheckbox').checked &&
      systemState.isTwoPlayer
    );
    if (notSpectator) {
      resyncActions();
    }
  });
  socket.on('catchUpActions', (data) => {
    const notSpectator = !(
      document.getElementById('spectatorModeCheckbox').checked &&
      systemState.isTwoPlayer
    );
    if (notSpectator) {
      catchUpActions(data.actionData);
    }
  });
  socket.on('syncCheck', (data) => {
    const notSpectator = !(
      document.getElementById('spectatorModeCheckbox').checked &&
      systemState.isTwoPlayer
    );

    if (!notSpectator) return;

    // Check if the other player is ahead of us
    if (data.counter > parseInt(systemState.oppCounter) + 1) {
      console.log(
        `Sync check detected gap: remote=${data.counter}, local=${systemState.oppCounter}`
      );

      // Only request a resync if we're not already resyncing and it's been at least 15 seconds since the last full sync
      // Reduced from 30 seconds to improve responsiveness
      const timeSinceLastSync = Date.now() - systemState.lastFullSyncTime;
      if (!systemState.isResyncing && timeSinceLastSync > 15000) {
        console.log('Requesting resync due to sync check');
        
        // Log for debugging
        if (systemState.debugMode) {
          logSyncEvent('synccheck-gap', { 
            remote: data.counter, 
            local: systemState.oppCounter,
            gap: data.counter - systemState.oppCounter
          });
        }
        
        const resyncData = {
          roomId: systemState.roomId,
          counter: systemState.oppCounter,
        };
        socket.emit('resyncActions', resyncData);
      }
    }

    // If we have buffered actions, try to process them
    if (systemState.actionBuffer.length > 0) {
      processBufferedActions();
    }
  });
  
  // Handle heartbeat response
  socket.on('heartbeatResponse', (data) => {
    if (typeof initializeConnectionQuality === 'function') {
      // This will be handled by the connection quality module
    } else {
      // Fallback if the module isn't loaded yet
      const roundTripTime = Date.now() - data.timestamp;
      console.log(`Heartbeat RTT: ${roundTripTime}ms`);
    }
  });
  
  // Handle snapshot-based sync
  socket.on('syncWithSnapshot', (data) => {
    const notSpectator = !(
      document.getElementById('spectatorModeCheckbox').checked &&
      systemState.isTwoPlayer
    );
    
    if (notSpectator) {
      console.log('Received snapshot for sync');
      
      // Import the function dynamically to avoid circular dependencies
      import('../../setup/general/catch-up-actions.js').then(module => {
        module.processSnapshotSync(data);
      }).catch(error => {
        console.error('Error importing processSnapshotSync:', error);
      });
    }
  });
  // socket.on('exchangeData', (data) => {
  //     exchangeData(data.user, data.username, data.deckData, data.emit);
  // });
  // socket.on('loadDeckData', (data) => {
  //     loadDeckData(data.user, data.deckData, data.emit);
  // });
  // socket.on('reset', (data) => {
  //     reset(data.user, data.clean, data.build, data.invalidMessage, data.emit);
  // });
  // socket.on('setup', (data) => {
  //     setup(data.user, data.indices, data.emit);
  // });
  // socket.on('takeTurn', (data) => {
  //     takeTurn(data.user, data.initiator, data.emit);
  // });
  // socket.on('draw', (data) => {
  //     draw(data.user, data.initiator, data.drawAmount, data.emit);
  // });
  // socket.on('moveCardBundle', (data) => {
  //     moveCardBundle(data.user, data.initiator, data.oZoneId, data.dZoneId, data.index, data.targetIndex, data.action, data.emit)
  // });
  // socket.on('shuffleIntoDeck', (data) => {
  //     shuffleIntoDeck(data.user, data.initiator, data.zoneId, data.index, data.indices, data.emit);
  // });
  // socket.on('moveToDeckTop', (data) => {
  //     moveToDeckTop(data.user, data.initiator, data.oZoneId, data.index, data.emit);
  // });
  // socket.on('switchWithDeckTop', (data) => {
  //     switchWithDeckTop(data.user, data.initiator, data.oZoneId, data.index, data.emit);
  // });
  // socket.on('viewDeck', (data) => {
  //     viewDeck(data.user, data.initiator, data.viewAmount, data.top, data.selectedDeckCount, data.targetIsOpp, data.emit);
  // });
  // socket.on('shuffleAll', (data) => {
  //     shuffleAll(data.user, data.initiator, data.zoneId, data.indices, data.emit);
  // });
  // socket.on('discardAll', (data) => {
  //     discardAll(data.user, data.initiator, data.zoneId, data.emit);
  // });
  // socket.on('lostZoneAll', (data) => {
  //     lostZoneAll(data.user, data.initiator, data.zoneId, data.emit);
  // });
  // socket.on('handAll', (data) => {
  //     handAll(data.user, data.initiator, data.zoneId, data.emit);
  // });
  // socket.on('leaveAll', (data) => {
  //     leaveAll(data.user, data.initiator, data.oZoneId, data.emit);
  // });
  // socket.on('discardAndDraw', (data) => {
  //     discardAndDraw(data.user, data.initiator, data.drawAmount, data.emit);
  // });
  // socket.on('shuffleAndDraw', (data) => {
  //     shuffleAndDraw(data.user, data.initiator, data.drawAmount, data.indices, data.emit);
  // });
  // socket.on('shuffleBottomAndDraw', (data) => {
  //     shuffleBottomAndDraw(data.user, data.initiator, data.drawAmount, data.indices, data.emit);
  // });
  // socket.on('shuffleZone', (data) => {
  //     shuffleZone(data.user, data.initiator, data.zoneId, data.indices, data.message, data.emit);
  // });
  // socket.on('useAbility', (data) => {
  //     useAbility(data.user, data.initiator, data.zoneId, data.index, data.emit);
  // });
  // socket.on('removeAbilityCounter', (data) => {
  //     removeAbilityCounter(data.user, data.zoneId, data.index, data.emit);
  // });
  // socket.on('addDamageCounter', (data) => {
  //     addDamageCounter(data.user, data.zoneId, data.index, data.damageAmount, data.emit);
  // });
  // socket.on('updateDamageCounter', (data) => {
  //     updateDamageCounter(data.user, data.zoneId, data.index, data.damageAmount, data.emit);
  // });
  // socket.on('removeDamageCounter', (data) => {
  //     removeDamageCounter(data.user, data.zoneId, data.index, data.emit);
  // });
  // socket.on('addSpecialCondition', (data) => {
  //     addSpecialCondition(data.user, data.zoneId, data.index, data.emit);
  // });
  // socket.on('updateSpecialCondition', (data) => {
  //     updateSpecialCondition(data.user, data.zoneId, data.index, data.textContent, data.emit);
  // });
  // socket.on('removeSpecialCondition', (data) => {
  //     removeSpecialCondition(data.user, data.zoneId, data.index, data.emit);
  // });
  // socket.on('discardBoard', (data) => {
  //     discardBoard(data.user, data.initiator, data.message, data.emit);
  // });
  // socket.on('handBoard', (data) => {
  //     handBoard(data.user, data.initiator, data.message, data.emit);
  // });
  // socket.on('shuffleBoard', (data) => {
  //     shuffleBoard(data.user, data.initiator, data.message, data.indices, data.emit);
  // });
  // socket.on('lostZoneBoard', (data) => {
  //     lostZoneBoard(data.user, data.initiator, data.message, data.emit);
  // });
  socket.on('lookAtCards', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
      data.initiator = data.initiator === 'self' ? 'opp' : 'self';
    }
    lookAtCards(
      data.user,
      data.initiator,
      data.zoneId,
      data.message,
      data.emit
    );
  });
  socket.on('stopLookingAtCards', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
      data.initiator = data.initiator === 'self' ? 'opp' : 'self';
    }
    stopLookingAtCards(
      data.user,
      data.initiator,
      data.zoneId,
      data.message,
      data.emit
    );
  });
  socket.on('revealCards', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
      data.initiator = data.initiator === 'self' ? 'opp' : 'self';
    }
    revealCards(data.user, data.initiator, data.zoneId, data.emit);
  });
  socket.on('hideCards', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
      data.initiator = data.initiator === 'self' ? 'opp' : 'self';
    }
    hideCards(data.user, data.initiator, data.zoneId, data.emit);
  });
  socket.on('revealShortcut', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
      data.initiator = data.initiator === 'self' ? 'opp' : 'self';
    }
    revealShortcut(
      data.user,
      data.initiator,
      data.zoneId,
      data.index,
      data.message,
      data.emit
    );
  });
  socket.on('hideShortcut', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
      data.initiator = data.initiator === 'self' ? 'opp' : 'self';
    }
    hideShortcut(
      data.user,
      data.initiator,
      data.zoneId,
      data.index,
      data.message,
      data.emit
    );
  });
  socket.on('lookShortcut', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
      data.initiator = data.initiator === 'self' ? 'opp' : 'self';
    }
    lookShortcut(data.user, data.initiator, data.zoneId, data.index, data.emit);
  });
  socket.on('stopLookingShortcut', (data) => {
    if (data.socketId === systemState.spectatorId) {
      data.user = data.user === 'self' ? 'opp' : 'self';
      data.initiator = data.initiator === 'self' ? 'opp' : 'self';
    }
    stopLookingShortcut(
      data.user,
      data.initiator,
      data.zoneId,
      data.index,
      data.emit
    );
  });
  // socket.on('playRandomCardFaceDown', (data) => {
  //     playRandomCardFaceDown(data.user, data.initiator, data.randomIndex, data.emit);
  // });
  // socket.on('rotateCard', (data) => {
  //     rotateCard(data.user, data.zoneId, data.index, data.single, data.emit);
  // });
  // socket.on('changeType', (data) => {
  //     changeType(data.user, data.initiator, data.zoneId, data.index, data.type, data.emit);
  // });
  // socket.on('attack', (data) => {
  //     attack(data.user, data.emit);
  // });
  // socket.on('pass', (data) => {
  //     pass(data.user, data.emit);
  // });
  // socket.on('VSTARGXFunction', (data) => {
  //     VSTARGXFunction(data.user, data.type, data.emit)
  // });
  // Handle loading a saved game state
  socket.on('loadSavedGameState', (gameState) => {
    console.log('Loading saved game state...');
    
    // Set up the UI
    const connectedRoom = document.getElementById('connectedRoom');
    const lobby = document.getElementById('lobby');
    const roomHeaderText = document.getElementById('roomHeaderText');
    const chatbox = document.getElementById('chatbox');
    const p2ExplanationBox = document.getElementById('p2ExplanationBox');
    const flipBoardButton = document.getElementById('flipBoardButton');
    
    roomHeaderText.textContent = 'id: ' + gameState.roomId;
    chatbox.innerHTML = '';
    connectedRoom.style.display = 'flex';
    lobby.style.display = 'none';
    p2ExplanationBox.style.display = 'none';
    flipBoardButton.style.display = 'none';
    
    // Set system state variables
    systemState.isTwoPlayer = true;
    systemState.roomId = gameState.roomId;
    systemState.p2SelfUsername = gameState.selfUsername;
    systemState.p2OppUsername = gameState.oppUsername;
    systemState.selfDeckData = gameState.selfDeckData;
    systemState.p2OppDeckData = gameState.oppDeckData;
    
    // Clean existing state
    cleanActionData('self');
    cleanActionData('opp');
    clearActionBuffer();
    
    // Restore action data and counters
    systemState.selfActionData = gameState.selfActionData;
    systemState.oppActionData = gameState.oppActionData;
    systemState.selfCounter = gameState.selfCounter;
    systemState.oppCounter = gameState.oppCounter;
    
    // Reset the board
    reset('self', true, true, false, false);
    reset('opp', true, true, false, false);
    
    // Replay all actions to restore the game state
    console.log(`Replaying ${systemState.selfActionData.length} self actions and ${systemState.oppActionData.length} opponent actions`);
    
    // First, apply deck data actions
    const selfDeckDataAction = systemState.selfActionData.find(a => a.action === 'loadDeckData' || a.action === 'exchangeData');
    if (selfDeckDataAction) {
      acceptAction('self', selfDeckDataAction.action, selfDeckDataAction.parameters);
    }
    
    const oppDeckDataAction = systemState.oppActionData.find(a => a.action === 'loadDeckData' || a.action === 'exchangeData');
    if (oppDeckDataAction) {
      acceptAction('opp', oppDeckDataAction.action, oppDeckDataAction.parameters);
    }
    
    // Then replay all other actions
    systemState.selfActionData.forEach(action => {
      if (action.action !== 'loadDeckData' && action.action !== 'exchangeData') {
        acceptAction('self', action.action, action.parameters);
      }
    });
    
    systemState.oppActionData.forEach(action => {
      if (action.action !== 'loadDeckData' && action.action !== 'exchangeData') {
        acceptAction('opp', action.action, action.parameters);
      }
    });
    
    // Set up intervals
    syncCheckInterval = setInterval(() => {
      if (systemState.isTwoPlayer) {
        const data = {
          roomId: systemState.roomId,
          counter: systemState.selfCounter,
        };
        socket.emit('syncCheck', data);
      }
    }, 3000);

    spectatorActionInterval = setInterval(() => {
      if (systemState.isTwoPlayer) {
        const data = {
          selfUsername: systemState.p2SelfUsername,
          selfDeckData: systemState.selfDeckData,
          oppDeckData: systemState.p2OppDeckData,
          oppUsername: systemState.p2OppUsername,
          roomId: systemState.roomId,
          spectatorActionData: systemState.exportActionData,
          socketId: socket.id,
        };
        socket.emit('spectatorActionData', data);
      }
    }, 1000);
    
    // Initialize auto-save interval
    autoSaveInterval = setInterval(() => {
      saveGameState();
    }, 30000);
    
    // Notify the user
    appendMessage('', 'Game state restored from saved data', 'announcement', false);
  });
  
  socket.on('exportGameStateSuccessful', (key) => {
    const url = `https://ptcgsim.online/import?key=${key}`;
    appendMessage('self', url, 'announcement', false);
  });
  
  socket.on('exportGameStateFailed', (message) => {
    appendMessage('self', message, 'announcement', false);
  });
  
  // Handle loading a game snapshot (new method)
  socket.on('loadGameSnapshot', (snapshot) => {
    console.log('Loading game from snapshot...');
    
    try {
      // Attempt to restore from snapshot
      const success = restoreGameFromSnapshot(snapshot);
      
      if (success) {
        console.log('Game state successfully restored from snapshot');
      } else {
        console.warn('Partial game state restoration from snapshot');
        
        // If we have action history in the snapshot, try to fall back to action replay
        if (snapshot.actionHistory && 
            snapshot.actionHistory.self && 
            snapshot.actionHistory.self.length > 0) {
          console.log('Falling back to action replay...');
          
          // Convert snapshot to action-based format
          const actionState = {
            roomId: snapshot.roomId,
            selfUsername: snapshot.players.self.username,
            oppUsername: snapshot.players.opponent.username,
            selfDeckData: snapshot.players.self.deckData,
            oppDeckData: snapshot.players.opponent.deckData,
            selfActionData: snapshot.actionHistory.self,
            oppActionData: snapshot.actionHistory.opponent,
            selfCounter: snapshot.players.self.counters.actionCounter,
            oppCounter: snapshot.players.opponent.counters.actionCounter
          };
          
          // Load using the legacy method
          socket.emit('loadSavedGameState', actionState);
        } else {
          // If all else fails, start a new game
          console.log('Could not restore game state, starting new game');
          socket.emit('joinGame', snapshot.roomId, snapshot.players.self.username, false, false);
          
          // Notify the user
          appendMessage('', 'Could not restore previous game state. Starting new game.', 'announcement', false);
        }
      }
    } catch (error) {
      console.error('Error restoring from snapshot:', error);
      
      // Fall back to a new game
      socket.emit('joinGame', snapshot.roomId, snapshot.players.self.username, false, false);
      
      // Notify the user
      appendMessage('', 'Error restoring game state. Starting new game.', 'announcement', false);
    }
  });
  
  // Handle snapshot storage success/failure
  socket.on('snapshotStoreSuccess', (data) => {
    console.log(`Snapshot ${data.snapshotId} stored successfully`);
  });
  
  socket.on('snapshotStoreFailed', (message) => {
    console.error(`Snapshot storage failed: ${message}`);
  });
};
