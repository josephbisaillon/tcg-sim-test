import { socket, systemState } from '../../front-end.js';
import { acceptAction } from './accept-action.js';
import { startKeybindsSleep } from '../../actions/keybinds/keybindSleep.js';
import { logSyncEvent } from '../sync/sync-ui.js';

// Default timeout for processing buffered actions with gaps
const DEFAULT_BUFFER_TIMEOUT = 500; // ms

/**
 * Adds an action to the buffer if it's not the next expected action
 * @param {Object} data - The action data
 * @returns {boolean} - True if the action was buffered, false if it was processed immediately
 */
export const bufferAction = (data) => {
  const expectedCounter = parseInt(systemState.oppCounter) + 1;

  // If this is the next expected action, process it immediately
  if (data.counter === expectedCounter) {
    processAction(data);
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('process-action', { 
        counter: data.counter, 
        action: data.action 
      });
    }
    
    return false;
  }

  // If this action is from the future, buffer it
  if (data.counter > expectedCounter) {
    // Check if action is already in buffer to avoid duplicates
    const existingIndex = systemState.actionBuffer.findIndex(
      (action) => action.counter === data.counter
    );

    if (existingIndex === -1) {
      // Add to buffer, sorted by counter
      systemState.actionBuffer.push(data);
      systemState.actionBuffer.sort((a, b) => a.counter - b.counter);
      console.log(
        `Buffered action #${data.counter} (waiting for #${expectedCounter})`
      );
      
      // Log for debugging
      if (systemState.debugMode) {
        logSyncEvent('buffer-action', { 
          counter: data.counter, 
          action: data.action,
          expectedCounter
        });
      }
      
      // Schedule processing of buffered actions with small gaps
      scheduleProcessBufferedActions();
    }
    return true;
  }

  // If this action is from the past, it's likely a duplicate or we've already processed it
  console.log(
    `Ignoring action #${data.counter} (already processed, current: #${systemState.oppCounter})`
  );
  
  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('ignore-action', { 
      counter: data.counter, 
      action: data.action,
      currentCounter: systemState.oppCounter
    });
  }
  
  return false;
};

/**
 * Processes a single action
 * @param {Object} data - The action data
 */
const processAction = (data) => {
  const notSpectator = !(
    document.getElementById('spectatorModeCheckbox').checked &&
    systemState.isTwoPlayer
  );

  if (notSpectator) {
    if (data.action === 'exchangeData') {
      // Handle special case for exchangeData which resets opponent state
      systemState.oppActionData = [];
    }

    // Update counter and store action
    systemState.oppCounter = data.counter;

    // Add to action history
    if (data.action !== 'exchangeData' && data.action !== 'loadDeckData') {
      systemState.exportActionData.push({
        user: 'opp',
        emit: true,
        action: data.action,
        parameters: data.parameters,
      });
    }

    // Store in opponent action data
    systemState.oppActionData.push({
      user: 'opp',
      emit: true,
      action: data.action,
      parameters: data.parameters,
    });

    // Execute the action
    startKeybindsSleep();
    acceptAction('opp', data.action, data.parameters);
  }
};

/**
 * Schedule processing of buffered actions after a short delay
 * This helps handle small gaps in the action sequence
 */
const scheduleProcessBufferedActions = () => {
  // Clear any existing timeout
  if (systemState.bufferProcessTimeout) {
    clearTimeout(systemState.bufferProcessTimeout);
  }
  
  // Set a new timeout
  const timeout = systemState.actionBufferTimeout || DEFAULT_BUFFER_TIMEOUT;
  systemState.bufferProcessTimeout = setTimeout(() => {
    processBufferedActionsWithGaps();
  }, timeout);
};

/**
 * Processes buffered actions even if there are small gaps
 * This helps prevent the system from getting stuck waiting for missing actions
 */
const processBufferedActionsWithGaps = () => {
  if (systemState.actionBuffer.length === 0) return;
  
  const expectedCounter = parseInt(systemState.oppCounter) + 1;
  const nextBufferedCounter = systemState.actionBuffer[0].counter;
  const gap = nextBufferedCounter - expectedCounter;
  
  // If the gap is small (1-3 actions), process the next action anyway
  // This helps prevent getting stuck due to lost packets
  if (gap > 0 && gap <= 3 && !systemState.isResyncing) {
    console.log(`Processing action #${nextBufferedCounter} despite gap of ${gap} actions`);
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('process-with-gap', { 
        counter: nextBufferedCounter, 
        gap,
        expectedCounter
      });
    }
    
    const nextAction = systemState.actionBuffer.shift();
    processAction(nextAction);
    
    // Request a resync to fill in the missing actions
    requestResync();
    
    // Continue processing any actions that are now ready
    processBufferedActions();
  } else if (gap > 3 && !systemState.isResyncing) {
    // For larger gaps, request a resync
    requestResync();
  }
};

/**
 * Processes any buffered actions that are now ready
 */
export const processBufferedActions = () => {
  if (systemState.actionBuffer.length === 0) return;

  let actionsProcessed = 0;
  let expectedCounter = parseInt(systemState.oppCounter) + 1;

  // Process actions in order as long as they form a continuous sequence
  while (
    systemState.actionBuffer.length > 0 &&
    systemState.actionBuffer[0].counter === expectedCounter
  ) {
    const nextAction = systemState.actionBuffer.shift();
    processAction(nextAction);
    actionsProcessed++;

    // Update expected counter for next iteration
    expectedCounter = parseInt(systemState.oppCounter) + 1;
  }

  if (actionsProcessed > 0) {
    console.log(`Processed ${actionsProcessed} buffered actions`);
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('processed-buffered', { 
        count: actionsProcessed,
        remainingBuffered: systemState.actionBuffer.length
      });
    }
  }

  // If we still have buffered actions but can't process them,
  // there might be missing actions in the sequence
  if (systemState.actionBuffer.length > 0) {
    const nextBufferedCounter = systemState.actionBuffer[0].counter;
    const gap = nextBufferedCounter - expectedCounter;

    if (gap > 0 && !systemState.isResyncing) {
      console.log(
        `Action sequence gap detected: missing ${gap} action(s) before #${nextBufferedCounter}`
      );
      
      // Schedule processing with gaps after a short delay
      scheduleProcessBufferedActions();
      
      // If the gap is large, request a resync immediately
      if (gap > 3) {
        requestResync();
      }
    }
  }
};

/**
 * Requests a resync from the other player
 */
const requestResync = () => {
  if (systemState.isResyncing) return;

  // Trigger sync start event if defined
  if (typeof systemState.onSyncStart === 'function') {
    systemState.onSyncStart();
  }

  systemState.isResyncing = true;
  systemState.resyncStartTime = Date.now();
  console.log(`Requesting resync from counter ${systemState.oppCounter}`);

  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('request-resync', { 
      counter: systemState.oppCounter,
      bufferSize: systemState.actionBuffer.length
    });
  }

  const data = {
    roomId: systemState.roomId,
    counter: systemState.oppCounter,
  };

  socket.emit('resyncActions', data);

  // Set a timeout to reset the resyncing flag
  setTimeout(() => {
    systemState.isResyncing = false;
    
    // Trigger sync failed event if defined
    if (typeof systemState.onSyncFailed === 'function') {
      systemState.onSyncFailed('Timeout');
    }
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('resync-timeout', { 
        duration: Date.now() - systemState.resyncStartTime
      });
    }
  }, 10000); // 10 second timeout (increased from 5s)
};

/**
 * Clears the action buffer
 */
export const clearActionBuffer = () => {
  // Clear any scheduled processing
  if (systemState.bufferProcessTimeout) {
    clearTimeout(systemState.bufferProcessTimeout);
    systemState.bufferProcessTimeout = null;
  }
  
  systemState.actionBuffer = [];
  
  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('clear-buffer', {});
  }
};
