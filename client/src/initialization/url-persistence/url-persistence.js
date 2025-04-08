import { socket, systemState } from '../../front-end.js';

/**
 * Updates the URL with room and user information
 * @param {string} roomId - The room ID
 * @param {string} username - The username
 * @param {boolean} isSpectator - Whether the user is a spectator
 */
export const updateURL = (roomId, username, isSpectator) => {
  const params = new URLSearchParams();
  params.set('room', roomId);
  params.set('user', username);
  if (isSpectator) {
    params.set('spectator', 'true');
  }
  
  // Update URL without reloading the page
  window.history.pushState({}, '', `?${params.toString()}`);
};

/**
 * Checks URL parameters and automatically joins a room if parameters exist
 */
export const checkURLParams = () => {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('room');
  const username = params.get('user');
  const isSpectator = params.get('spectator') === 'true';
  
  if (roomId && username) {
    console.log(`Found room parameters in URL: room=${roomId}, user=${username}, spectator=${isSpectator}`);
    
    // Auto-fill the form fields
    document.getElementById('roomIdInput').value = roomId;
    document.getElementById('nameInput').value = username;
    
    if (isSpectator) {
      document.getElementById('spectatorModeCheckbox').checked = true;
    }
    
    // Set system state variables
    systemState.roomId = roomId;
    systemState.p2SelfUsername = username;
    
    // Wait a moment for the page to fully load before joining
    setTimeout(() => {
      // Check if there's a saved state for this room
      socket.emit('checkSavedState', roomId, (stateInfo) => {
        if (stateInfo.hasState) {
          console.log(`Found saved state for room ${roomId}, loading...`);
          
          // Prefer snapshot if available
          if (stateInfo.type === 'snapshot') {
            socket.emit('loadSavedSnapshot', roomId, username, isSpectator);
          } else {
            // Fall back to legacy state
            socket.emit('loadSavedState', roomId, username, isSpectator);
          }
        } else {
          console.log(`No saved state found for room ${roomId}, joining normally`);
          // Normal join with reconnection flag
          socket.emit(
            'joinGame',
            roomId,
            username,
            isSpectator,
            true // Add isReconnection flag
          );
        }
      });
    }, 500);
  }
};

/**
 * Initializes URL-based room persistence
 */
export const initializeURLPersistence = () => {
  // Check URL parameters on page load
  window.addEventListener('load', checkURLParams);
  
  // Handle browser navigation
  window.addEventListener('popstate', () => {
    // Re-check URL parameters when the user navigates
    checkURLParams();
  });
};
