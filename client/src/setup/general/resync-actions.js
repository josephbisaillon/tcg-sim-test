import { socket, systemState } from '../../front-end.js';
import { clearActionBuffer } from './action-buffer.js';
import { logSyncEvent, showSyncNotification } from '../sync/sync-ui.js';
import { saveGameSnapshot } from '../snapshots/snapshot-manager.js';

/**
 * Requests a resync with the other player by sending all our actions
 * This is called when we detect that the other player is missing actions
 */
export const resyncActions = () => {
  // If already resyncing, don't start another resync
  if (systemState.isResyncing) return;
  
  // Trigger sync start event if defined
  if (typeof systemState.onSyncStart === 'function') {
    systemState.onSyncStart();
  }

  // Mark that we're in a resyncing state
  systemState.isResyncing = true;
  systemState.resyncStartTime = Date.now();

  // Clear any buffered actions since we're going to get a fresh state
  clearActionBuffer();

  // Log the resync attempt
  console.log(`Sending resync data from counter ${systemState.selfCounter}`);
  
  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('resync-start', { 
      counter: systemState.selfCounter,
      actionsCount: systemState.selfActionData.length
    });
  }

  // For large action histories, consider sending a snapshot instead
  if (systemState.selfActionData.length > 50) {
    // Create and send a snapshot
    try {
      const snapshot = saveGameSnapshot(true); // true = return snapshot without sending
      
      if (snapshot) {
        console.log('Sending snapshot for resync (large action history)');
        socket.emit('syncWithSnapshot', {
          roomId: systemState.roomId,
          snapshot: snapshot
        });
        
        // Log for debugging
        if (systemState.debugMode) {
          logSyncEvent('resync-with-snapshot', { 
            snapshotSize: JSON.stringify(snapshot).length
          });
        }
      } else {
        // Fall back to action-based resync
        sendActionResync();
      }
    } catch (error) {
      console.error('Error creating snapshot for resync:', error);
      // Fall back to action-based resync
      sendActionResync();
    }
  } else {
    // Use normal action-based resync for smaller histories
    sendActionResync();
  }

  // Set a timeout to reset the resyncing flag
  const resyncTimeout = setTimeout(() => {
    if (systemState.isResyncing) {
      systemState.isResyncing = false;
      systemState.lastFullSyncTime = Date.now();
      
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
      
      console.log('Resync timed out');
    }
  }, 10000); // 10 second timeout (increased from 5s)
  
  // Store the timeout ID so we can clear it if resync completes
  systemState.resyncTimeout = resyncTimeout;
};

/**
 * Send a resync using the action-based method
 */
function sendActionResync() {
  // Send all our actions to the other player
  const data = {
    roomId: systemState.roomId,
    actionData: systemState.selfActionData,
  };
  socket.emit('catchUpActions', data);
  
  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('resync-with-actions', { 
      actionsCount: systemState.selfActionData.length
    });
  }
}

/**
 * Called when a resync is complete
 */
export function completeResync() {
  // Clear the resync timeout
  if (systemState.resyncTimeout) {
    clearTimeout(systemState.resyncTimeout);
    systemState.resyncTimeout = null;
  }
  
  // Update state
  systemState.isResyncing = false;
  systemState.lastFullSyncTime = Date.now();
  
  // Trigger sync complete event if defined
  if (typeof systemState.onSyncComplete === 'function') {
    systemState.onSyncComplete();
  }
  
  // Log for debugging
  if (systemState.debugMode) {
    logSyncEvent('resync-complete', { 
      duration: Date.now() - (systemState.resyncStartTime || Date.now())
    });
  }
  
  console.log('Resync completed successfully');
}
