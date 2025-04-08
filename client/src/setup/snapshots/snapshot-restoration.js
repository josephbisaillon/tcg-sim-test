import { systemState, socket } from '../../front-end.js';
import { getZone } from '../zones/get-zone.js';
import { reset } from '../../actions/general/reset.js';
import { appendMessage } from '../chatbox/append-message.js';
import { exchangeData } from '../deck-constructor/exchange-data.js';
import { removeImages } from '../image-logic/remove-images.js';
import { flipBoard } from '../../actions/general/flip-board.js';
import { rotateCard } from '../../actions/general/rotate-card.js';
import { updateDamageCounter } from '../../actions/counters/damage-counter.js';
import { useAbility } from '../../actions/counters/use-ability.js';
import { updateSpecialCondition } from '../../actions/counters/special-condition.js';
import { cleanActionData } from '../general/clean-action-data.js';
import { clearActionBuffer } from '../general/action-buffer.js';

/**
 * Restore game from snapshot
 * @param {Object} snapshot - The snapshot to restore from
 * @returns {boolean} True if restoration was successful
 */
export function restoreGameFromSnapshot(snapshot) {
  console.log('Restoring game from snapshot...');
  
  try {
    // Verify snapshot integrity
    if (!verifySnapshotIntegrity(snapshot)) {
      console.error('Snapshot integrity check failed');
      return false;
    }
    
    // Set up the UI
    setupUI(snapshot.roomId);
    
    // Set system state variables
    systemState.isTwoPlayer = true;
    systemState.roomId = snapshot.roomId;
    systemState.p2SelfUsername = snapshot.players.self.username;
    systemState.p2OppUsername = snapshot.players.opponent.username;
    systemState.selfDeckData = snapshot.players.self.deckData;
    systemState.p2OppDeckData = snapshot.players.opponent.deckData;
    systemState.turn = snapshot.gameState.turn;
    systemState.phase = snapshot.gameState.phase;
    systemState.lastAction = snapshot.gameState.lastAction;
    
    // Restore counters
    systemState.selfCounter = snapshot.players.self.counters.actionCounter;
    systemState.oppCounter = snapshot.players.opponent.counters.actionCounter;
    
    // Restore action history (for undo functionality and backward compatibility)
    if (snapshot.actionHistory) {
      systemState.selfActionData = snapshot.actionHistory.self || [];
      systemState.oppActionData = snapshot.actionHistory.opponent || [];
    } else {
      // Initialize empty action arrays if not present in snapshot
      cleanActionData('self');
      cleanActionData('opp');
    }
    
    // Clear action buffer
    clearActionBuffer();
    
    // Reset the board
    reset('self', true, false, false, false);
    reset('opp', true, false, false, false);
    
    // Load deck data
    exchangeData(
      'self',
      snapshot.players.self.username,
      snapshot.players.self.deckData,
      systemState.cardBackSrc,
      false
    );
    
    exchangeData(
      'opp',
      snapshot.players.opponent.username,
      snapshot.players.opponent.deckData,
      systemState.p2OppCardBackSrc,
      false
    );
    
    // Restore all zones and cards
    restoreZones('self', snapshot.zones.self);
    restoreZones('opp', snapshot.zones.opponent);
    if (snapshot.zones.neutral) {
      restoreZones('neutral', snapshot.zones.neutral);
    }
    
    // Restore card relationships
    if (snapshot.relationships) {
      restoreCardRelationships(snapshot.relationships);
    }
    
    // Restore visual state
    if (snapshot.visualState) {
      restoreVisualState(snapshot.visualState);
    }
    
    // Set up intervals
    setupIntervals();
    
    // Notify the user
    appendMessage('', 'Game state restored from snapshot', 'announcement', false);
    
    return true;
  } catch (error) {
    console.error('Error restoring from snapshot:', error);
    return false;
  }
}

/**
 * Verify the integrity of a snapshot
 * @param {Object} snapshot - The snapshot to verify
 * @returns {boolean} True if the snapshot is valid
 */
function verifySnapshotIntegrity(snapshot) {
  // Check for required fields
  if (!snapshot || !snapshot.roomId || !snapshot.players || !snapshot.zones) {
    console.error('Snapshot missing required fields');
    return false;
  }
  
  // Verify checksum if present
  if (snapshot.checksum) {
    const calculatedChecksum = calculateChecksum(snapshot);
    if (calculatedChecksum !== snapshot.checksum) {
      console.error('Snapshot checksum mismatch');
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate a checksum for data integrity
 * @param {Object} data - The data to calculate a checksum for
 * @returns {string} A hex string checksum
 */
function calculateChecksum(data) {
  // Create a copy without the checksum field
  const dataCopy = { ...data };
  delete dataCopy.checksum;
  
  // Simple implementation - in production use a proper hash function
  const str = JSON.stringify(dataCopy);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(16);
}

/**
 * Set up the UI for the restored game
 * @param {string} roomId - The room ID
 */
function setupUI(roomId) {
  const connectedRoom = document.getElementById('connectedRoom');
  const lobby = document.getElementById('lobby');
  const roomHeaderText = document.getElementById('roomHeaderText');
  const chatbox = document.getElementById('chatbox');
  const p2ExplanationBox = document.getElementById('p2ExplanationBox');
  const flipBoardButton = document.getElementById('flipBoardButton');
  
  roomHeaderText.textContent = 'id: ' + roomId;
  chatbox.innerHTML = '';
  connectedRoom.style.display = 'flex';
  lobby.style.display = 'none';
  p2ExplanationBox.style.display = 'none';
  flipBoardButton.style.display = 'none';
}

/**
 * Restore zones and cards from snapshot
 * @param {string} player - The player ('self', 'opp', or 'neutral')
 * @param {Object} zones - The zones to restore
 */
function restoreZones(player, zones) {
  if (!zones) return;
  
  Object.values(zones).forEach(zoneData => {
    const zone = getZone(player, zoneData.id);
    if (!zone) {
      console.warn(`Zone not found: ${player}.${zoneData.id}`);
      return;
    }
    
    // Clear the zone
    zone.array.length = 0;
    removeImages(zone.element);
    
    // Restore each card
    zoneData.cards.forEach(cardData => {
      if (!cardData) return;
      
      try {
        const card = createCardFromData(cardData);
        zone.array.push(card);
        
        // Add the card to the DOM
        const cardElement = createCardElement(card);
        zone.element.appendChild(cardElement);
        
        // Apply visual state
        if (cardData.visual) {
          applyCardVisualState(card, cardData.visual, player, zoneData.id);
        }
        
        // Apply game state
        if (cardData.gameState) {
          applyCardGameState(card, cardData.gameState, player, zoneData.id);
        }
      } catch (error) {
        console.error(`Error restoring card in ${player}.${zoneData.id}:`, error);
      }
    });
  });
}

/**
 * Create a card from snapshot data
 * @param {Object} cardData - The card data from the snapshot
 * @returns {Object} A card object
 */
function createCardFromData(cardData) {
  return {
    id: cardData.id,
    name: cardData.name || 'Unknown Card',
    type: cardData.type || 'Unknown',
    url: cardData.url || '',
    image: {
      rotation: cardData.visual?.rotation || 0,
      faceDown: cardData.visual?.faceDown || false,
      public: cardData.visual?.public || false,
      x: cardData.visual?.position?.x || 0,
      y: cardData.visual?.position?.y || 0,
      z: cardData.visual?.position?.z || 0,
      attachedCards: [],
      attached: false,
      relative: null
    },
    damageCounter: cardData.gameState?.damageCounter || 0,
    abilityCounter: cardData.gameState?.abilityCounter || false,
    specialCondition: cardData.gameState?.specialCondition || null,
    location: {
      player: cardData.location?.player || 'unknown',
      zone: cardData.location?.zone || 'unknown',
      index: cardData.location?.index || 0
    }
  };
}

/**
 * Create a DOM element for a card
 * @param {Object} card - The card object
 * @returns {HTMLElement} The card element
 */
function createCardElement(card) {
  const cardElement = document.createElement('img');
  cardElement.src = card.url || '';
  cardElement.alt = card.name;
  cardElement.className = 'card';
  cardElement.dataset.id = card.id;
  
  // Apply visual properties
  if (card.image) {
    if (card.image.rotation) {
      cardElement.style.transform = `rotate(${card.image.rotation}deg)`;
    }
    
    if (card.image.faceDown) {
      cardElement.dataset.faceDown = 'true';
    }
    
    if (card.image.position) {
      cardElement.style.left = `${card.image.position.x}px`;
      cardElement.style.top = `${card.image.position.y}px`;
      cardElement.style.zIndex = card.image.position.z;
    }
  }
  
  return cardElement;
}

/**
 * Apply visual state to a card
 * @param {Object} card - The card object
 * @param {Object} visualState - The visual state to apply
 * @param {string} player - The player who owns the card
 * @param {string} zoneId - The zone the card is in
 */
function applyCardVisualState(card, visualState, player, zoneId) {
  if (!card || !visualState) return;
  
  // Find the card's index in the zone
  const zone = getZone(player, zoneId);
  if (!zone) return;
  
  const index = zone.array.indexOf(card);
  if (index === -1) return;
  
  // Apply rotation
  if (visualState.rotation) {
    try {
      rotateCard(player, zoneId, index, true, false);
    } catch (error) {
      console.warn(`Error applying rotation to ${player}.${zoneId}[${index}]:`, error);
    }
  }
  
  // Apply face down state
  if (visualState.faceDown) {
    try {
      // Use the appropriate function to flip card face down
      // This depends on your implementation
      if (typeof flipCardFaceDown === 'function') {
        flipCardFaceDown(player, zoneId, index, false);
      }
    } catch (error) {
      console.warn(`Error applying face down state to ${player}.${zoneId}[${index}]:`, error);
    }
  }
  
  // Apply position
  if (visualState.position) {
    card.image.x = visualState.position.x;
    card.image.y = visualState.position.y;
    card.image.z = visualState.position.z;
  }
}

/**
 * Apply game state to a card
 * @param {Object} card - The card object
 * @param {Object} gameState - The game state to apply
 * @param {string} player - The player who owns the card
 * @param {string} zoneId - The zone the card is in
 */
function applyCardGameState(card, gameState, player, zoneId) {
  if (!card || !gameState) return;
  
  // Find the card's index in the zone
  const zone = getZone(player, zoneId);
  if (!zone) return;
  
  const index = zone.array.indexOf(card);
  if (index === -1) return;
  
  // Apply damage counter
  if (gameState.damageCounter > 0) {
    try {
      updateDamageCounter(player, zoneId, index, gameState.damageCounter, false);
    } catch (error) {
      console.warn(`Error applying damage counter to ${player}.${zoneId}[${index}]:`, error);
    }
  }
  
  // Apply ability counter
  if (gameState.abilityCounter) {
    try {
      useAbility(player, 'self', zoneId, index, false);
    } catch (error) {
      console.warn(`Error applying ability counter to ${player}.${zoneId}[${index}]:`, error);
    }
  }
  
  // Apply special condition
  if (gameState.specialCondition) {
    try {
      updateSpecialCondition(player, zoneId, index, gameState.specialCondition, false);
    } catch (error) {
      console.warn(`Error applying special condition to ${player}.${zoneId}[${index}]:`, error);
    }
  }
}

/**
 * Restore card relationships
 * @param {Object} relationships - The relationships to restore
 */
function restoreCardRelationships(relationships) {
  if (!relationships) return;
  
  // Process attachments
  if (relationships.attachments) {
    relationships.attachments.forEach(attachment => {
      try {
        const parentCard = findCardById(attachment.parentId);
        const childCard = findCardById(attachment.childId);
        
        if (parentCard && childCard) {
          attachCard(
            parentCard.player,
            childCard.zoneId,
            childCard.index,
            parentCard.zoneId,
            parentCard.index,
            false
          );
        }
      } catch (error) {
        console.warn(`Error restoring attachment relationship:`, error);
      }
    });
  }
  
  // Process evolutions
  if (relationships.evolutions) {
    relationships.evolutions.forEach(evolution => {
      try {
        const baseCard = findCardById(evolution.parentId);
        const evolutionCard = findCardById(evolution.childId);
        
        if (baseCard && evolutionCard) {
          evolveCard(
            baseCard.player,
            evolutionCard.zoneId,
            evolutionCard.index,
            baseCard.zoneId,
            baseCard.index,
            false
          );
        }
      } catch (error) {
        console.warn(`Error restoring evolution relationship:`, error);
      }
    });
  }
}

/**
 * Find a card by ID
 * @param {string} cardId - The ID of the card to find
 * @returns {Object|null} The card info or null if not found
 */
function findCardById(cardId) {
  let result = null;
  
  ['self', 'opp', 'neutral'].forEach(player => {
    const zoneIds = player === 'neutral' ? 
      ['stadium'] : 
      ['deck', 'hand', 'discard', 'active', 'bench', 'prizes', 'lostZone', 'board'];
    
    zoneIds.forEach(zoneId => {
      const zone = getZone(player, zoneId);
      if (!zone) return;
      
      zone.array.forEach((card, index) => {
        if (card && card.id === cardId) {
          result = {
            card,
            player,
            zoneId,
            index
          };
        }
      });
    });
  });
  
  return result;
}

/**
 * Restore visual state
 * @param {Object} visualState - The visual state to restore
 */
function restoreVisualState(visualState) {
  if (!visualState) return;
  
  // Restore board orientation
  if (visualState.boardFlipped !== (systemState.initiator === 'opp')) {
    try {
      flipBoard();
    } catch (error) {
      console.warn('Error restoring board orientation:', error);
    }
  }
  
  // Restore turn indicator
  if (visualState.activeTurn !== undefined) {
    systemState.turn = visualState.activeTurn;
    try {
      updateTurnIndicator();
    } catch (error) {
      console.warn('Error updating turn indicator:', error);
    }
  }
  
  // Restore visible zones
  if (visualState.visibleZones) {
    systemState.viewingZones = visualState.visibleZones;
    try {
      updateZoneVisibility();
    } catch (error) {
      console.warn('Error updating zone visibility:', error);
    }
  }
}

/**
 * Update the turn indicator
 */
function updateTurnIndicator() {
  const turnIndicator = document.getElementById('turnIndicator');
  if (!turnIndicator) return;
  
  turnIndicator.textContent = `Turn: ${systemState.turn}`;
}

/**
 * Update zone visibility based on systemState.viewingZones
 */
function updateZoneVisibility() {
  // Implementation depends on your specific UI
  // This is a placeholder
}

/**
 * Set up intervals for ongoing game
 */
function setupIntervals() {
  // Import required functions
  const { removeSyncIntervals } = require('../../initialization/socket-event-listeners/socket-event-listeners.js');
  const { saveGameSnapshot } = require('./snapshot-manager.js');
  
  // Clear any existing intervals
  removeSyncIntervals();
  
  // Set up sync check interval
  syncCheckInterval = setInterval(() => {
    if (systemState.isTwoPlayer) {
      const data = {
        roomId: systemState.roomId,
        counter: systemState.selfCounter,
      };
      socket.emit('syncCheck', data);
    }
  }, 3000);

  // Set up spectator action interval
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
  
  // Set up auto-save interval
  autoSaveInterval = setInterval(() => {
    saveGameSnapshot();
  }, 30000);
}
