import { systemState } from '../../front-end.js';
import { getZone } from '../zones/get-zone.js';

/**
 * Generate a unique ID for snapshots
 * @returns {string} A UUID v4 string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a consistent player ID from username
 * @param {string} username - The player's username
 * @returns {string} A consistent ID for the player
 */
export function generatePlayerID(username) {
  return `player_${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
}

/**
 * Capture all zones from the current game state
 * @returns {Object} Object containing all zones and their cards
 */
export function captureAllZones() {
  return {
    self: capturePlayerZones('self'),
    opponent: capturePlayerZones('opp'),
    neutral: captureNeutralZones()
  };
}

/**
 * Capture all zones for a specific player
 * @param {string} player - 'self' or 'opp'
 * @returns {Object} Object containing the player's zones and their cards
 */
function capturePlayerZones(player) {
  const zoneIds = ['deck', 'hand', 'discard', 'active', 'bench', 'prizes', 'lostZone', 'board'];
  const zones = {};
  
  zoneIds.forEach(zoneId => {
    const zone = getZone(player, zoneId);
    if (!zone) return;
    
    zones[zoneId] = {
      id: zoneId,
      cards: zone.array.map((card, index) => captureCardState(card, player, zoneId, index))
    };
  });
  
  return zones;
}

/**
 * Capture neutral zones (like stadium)
 * @returns {Object} Object containing neutral zones and their cards
 */
function captureNeutralZones() {
  const zones = {};
  const stadiumZone = getZone('neutral', 'stadium');
  
  if (stadiumZone) {
    zones.stadium = {
      id: 'stadium',
      cards: stadiumZone.array.map((card, index) => captureCardState(card, 'neutral', 'stadium', index))
    };
  }
  
  return zones;
}

/**
 * Capture the complete state of a card
 * @param {Object} card - The card object
 * @param {string} player - The player who owns the card
 * @param {string} zoneId - The zone the card is in
 * @param {number} index - The card's index in the zone
 * @returns {Object} A complete representation of the card's state
 */
function captureCardState(card, player, zoneId, index) {
  if (!card) return null;
  
  // Generate a stable card ID if one doesn't exist
  const cardId = card.id || `${player}_${zoneId}_${index}_${Date.now()}`;
  
  return {
    id: cardId,
    name: card.name || 'Unknown Card',
    type: card.type || 'Unknown',
    url: card.url || '',
    
    // Visual state
    visual: {
      rotation: card.image?.rotation || 0,
      faceDown: card.image?.faceDown || false,
      public: card.image?.public || false,
      position: {
        x: card.image?.x || 0,
        y: card.image?.y || 0,
        z: card.image?.z || 0
      }
    },
    
    // Game state
    gameState: {
      damageCounter: card.damageCounter || 0,
      abilityCounter: card.abilityCounter || false,
      specialCondition: card.specialCondition || null
    },
    
    // Location
    location: {
      player: player,
      zone: zoneId,
      index: index || 0
    }
  };
}

/**
 * Capture all card relationships (attachments, evolutions)
 * @returns {Object} Object containing all card relationships
 */
export function captureCardRelationships() {
  const relationships = {
    attachments: [],
    evolutions: []
  };
  
  // Process all zones to find attachments and evolutions
  ['self', 'opp'].forEach(player => {
    const zoneIds = ['active', 'bench', 'board'];
    
    zoneIds.forEach(zoneId => {
      const zone = getZone(player, zoneId);
      if (!zone) return;
      
      zone.array.forEach((card, index) => {
        if (!card || !card.image) return;
        
        // Capture attachments
        if (card.image.attachedCards && card.image.attachedCards.length > 0) {
          card.image.attachedCards.forEach(attachedCard => {
            if (!attachedCard) return;
            
            relationships.attachments.push({
              parentId: card.id || `${player}_${zoneId}_${index}`,
              childId: attachedCard.id || 'unknown',
              type: 'attachment'
            });
          });
        }
        
        // Capture evolutions
        if (card.image.attached && card.image.relative) {
          relationships.evolutions.push({
            parentId: card.image.relative.id || 'unknown',
            childId: card.id || `${player}_${zoneId}_${index}`,
            type: 'evolution'
          });
        }
      });
    });
  });
  
  return relationships;
}

/**
 * Capture the current visual state of the game
 * @returns {Object} Object containing the visual state
 */
export function captureVisualState() {
  return {
    boardFlipped: systemState.initiator === 'opp',
    activeTurn: systemState.turn,
    activePlayer: systemState.activePlayer || 'self',
    visibleZones: {
      self: getVisibleZones('self'),
      opponent: getVisibleZones('opp')
    }
  };
}

/**
 * Get zones that are currently visible to the player
 * @param {string} player - 'self' or 'opp'
 * @returns {Array} Array of visible zone IDs
 */
function getVisibleZones(player) {
  const visibleZones = [];
  
  // Add zones that are currently being viewed
  if (systemState.viewingZones && systemState.viewingZones[player]) {
    visibleZones.push(...systemState.viewingZones[player]);
  }
  
  return visibleZones;
}

/**
 * Create a complete game snapshot
 * @returns {Object} A complete snapshot of the current game state
 */
export function createGameSnapshot() {
  const snapshot = {
    // Metadata
    version: "1.6.0",
    timestamp: Date.now(),
    snapshotId: generateUUID(),
    roomId: systemState.roomId,
    
    // Player information
    players: {
      self: {
        id: generatePlayerID(systemState.p2SelfUsername),
        username: systemState.p2SelfUsername,
        deckData: systemState.selfDeckData,
        counters: {
          actionCounter: systemState.selfCounter
        }
      },
      opponent: {
        id: generatePlayerID(systemState.p2OppUsername),
        username: systemState.p2OppUsername,
        deckData: systemState.p2OppDeckData,
        counters: {
          actionCounter: systemState.oppCounter
        }
      }
    },
    
    // Game state
    gameState: {
      turn: systemState.turn,
      phase: systemState.phase || "main",
      lastAction: systemState.lastAction,
      timestamp: Date.now()
    },
    
    // Zones with cards
    zones: captureAllZones(),
    
    // Card relationships
    relationships: captureCardRelationships(),
    
    // Visual state
    visualState: captureVisualState(),
    
    // Action history (for backward compatibility and debugging)
    actionHistory: {
      self: systemState.selfActionData,
      opponent: systemState.oppActionData
    }
  };
  
  // Calculate checksum
  snapshot.checksum = calculateChecksum(snapshot);
  
  return snapshot;
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
 * Save the current game state as a snapshot
 */
export function saveGameSnapshot() {
  // Only save if we're in a two-player game
  if (!systemState.isTwoPlayer || !systemState.roomId) {
    return;
  }

  console.log('Auto-saving game snapshot...');
  
  try {
    // Create the snapshot
    const snapshot = createGameSnapshot();
    
    // Store the snapshot
    socket.emit('storeGameSnapshot', JSON.stringify(snapshot));
  } catch (error) {
    console.error('Error saving game snapshot:', error);
  }
}
