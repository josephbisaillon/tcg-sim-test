import { systemState } from '../../front-end.js';
import { acceptAction } from './accept-action.js';
import { clearActionBuffer } from './action-buffer.js';
import { logSyncEvent } from '../sync/sync-ui.js';
import { completeResync } from './resync-actions.js';

/**
 * Processes catch-up actions received from the other player during a resync
 * @param {Array} actionData - Array of actions from the other player
 */
export const catchUpActions = (actionData) => {
  // Clear any buffered actions since we're getting a fresh state
  clearActionBuffer();

  // Log the catch-up
  console.log(
    `Received ${actionData.length} actions, our counter: ${systemState.oppCounter}`
  );
  
  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('catchup-received', { 
      count: actionData.length,
      currentCounter: systemState.oppCounter
    });
  }

  // Only process actions we don't already have
  const missingData = actionData.slice(systemState.oppCounter);

  if (missingData.length === 0) {
    console.log('No missing actions to process');
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('catchup-no-missing', {});
    }
    
    // Complete the resync process
    completeResync();
    
    return;
  }

  console.log(`Processing ${missingData.length} missing actions`);
  
  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('catchup-processing', { 
      missingCount: missingData.length
    });
  }

  // First, update our internal state with all the missing actions
  missingData.forEach((entry) => {
    // Swap self/opp in parameters since these actions are from the other player's perspective
    if (entry.parameters && entry.parameters.length > 0) {
      if (entry.parameters[0] === 'self') {
        entry.parameters[0] = 'opp';
      } else if (entry.parameters[0] === 'opp') {
        entry.parameters[0] = 'self';
      }
    }

    // Add to export data for spectators
    if (entry.action !== 'exchangeData' && entry.action !== 'loadDeckData') {
      systemState.exportActionData.push({
        user: 'opp',
        emit: true,
        action: entry.action,
        parameters: entry.parameters,
      });
    }
  });

  // Find critical actions that require special handling
  const mostRecentDeckDataIndex = [...missingData]
    .reverse()
    .findIndex(
      (entry) =>
        entry.action === 'exchangeData' || entry.action === 'loadDeckData'
    );

  const mostRecentResetEntryIndex = [...missingData]
    .reverse()
    .findIndex((entry) => entry.action === 'reset' || entry.action === 'setup');

  // Determine which actions to apply based on critical actions
  let actionsToApply = [];

  if (
    mostRecentResetEntryIndex !== -1 &&
    (mostRecentDeckDataIndex === -1 ||
      mostRecentResetEntryIndex < mostRecentDeckDataIndex)
  ) {
    // If there's a reset/setup after the most recent deck data, apply from that point
    actionsToApply = missingData.slice(
      missingData.length - mostRecentResetEntryIndex - 1
    );
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('catchup-reset-found', { 
        index: mostRecentResetEntryIndex,
        actionsToApply: actionsToApply.length
      });
    }
  } else if (mostRecentDeckDataIndex !== -1) {
    // If there's deck data, apply it first, then all actions after it
    const deckDataEntry =
      missingData[missingData.length - mostRecentDeckDataIndex - 1];
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('catchup-deckdata-found', { 
        index: mostRecentDeckDataIndex,
        action: deckDataEntry.action
      });
    }
    
    acceptAction('opp', deckDataEntry.action, deckDataEntry.parameters);

    // Then apply all actions after the deck data
    actionsToApply = missingData.slice(
      missingData.length - mostRecentDeckDataIndex
    );
  } else {
    // Otherwise, apply all missing actions
    actionsToApply = missingData;
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('catchup-all-actions', { 
        count: actionsToApply.length
      });
    }
  }

  // Apply the actions in sequence
  actionsToApply.forEach((data, index) => {
    // Update our counter as we process each action
    systemState.oppCounter = systemState.oppCounter + 1;

    // Skip deck data if we already processed it above
    if (
      mostRecentDeckDataIndex !== -1 &&
      index === 0 &&
      (data.action === 'exchangeData' || data.action === 'loadDeckData')
    ) {
      return;
    }

    acceptAction('opp', data.action, data.parameters);
  });

  // Update the last sync time
  systemState.lastFullSyncTime = Date.now();
  console.log(`Catch-up complete, new counter: ${systemState.oppCounter}`);
  
  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('catchup-complete', { 
      newCounter: systemState.oppCounter,
      actionsApplied: actionsToApply.length
    });
  }
  
  // Complete the resync process
  completeResync();
};

/**
 * Process a snapshot received during a sync
 * @param {Object} data - The snapshot data
 */
export const processSnapshotSync = (data) => {
  try {
    // Import the snapshot restoration function
    const { restoreGameFromSnapshot } = require('../snapshots/snapshot-restoration.js');
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('sync-with-snapshot', { 
        snapshotSize: JSON.stringify(data.snapshot).length
      });
    }
    
    console.log('Restoring game state from sync snapshot');
    
    // Restore from the snapshot
    const success = restoreGameFromSnapshot(data.snapshot);
    
    if (success) {
      console.log('Successfully restored game state from snapshot');
      
      // Log for debugging
      if (systemState.debugMode) {
        logSyncEvent('snapshot-restore-success', {});
      }
      
      // Complete the resync process
      completeResync();
    } else {
      console.error('Failed to restore game state from snapshot');
      
      // Log for debugging
      if (systemState.debugMode) {
        logSyncEvent('snapshot-restore-failed', {});
      }
      
      // Request a traditional resync as fallback
      requestFallbackResync();
    }
  } catch (error) {
    console.error('Error processing snapshot sync:', error);
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('snapshot-restore-error', { 
        error: error.message
      });
    }
    
    // Request a traditional resync as fallback
    requestFallbackResync();
  }
};

/**
 * Request a fallback resync using the traditional action-based method
 */
function requestFallbackResync() {
  // Request a traditional resync
  const data = {
    roomId: systemState.roomId,
    counter: systemState.oppCounter,
    fallback: true
  };
  
  console.log('Requesting fallback action-based resync');
  socket.emit('resyncActions', data);
}
