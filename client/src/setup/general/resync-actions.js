import { socket, systemState } from '../../front-end.js';
import { clearActionBuffer } from './action-buffer.js';

/**
 * Requests a resync with the other player by sending all our actions
 * This is called when we detect that the other player is missing actions
 */
export const resyncActions = () => {
  // Mark that we're in a resyncing state
  systemState.isResyncing = true;

  // Clear any buffered actions since we're going to get a fresh state
  clearActionBuffer();

  // Log the resync attempt
  console.log(`Sending resync data from counter ${systemState.selfCounter}`);

  // Send all our actions to the other player
  const data = {
    roomId: systemState.roomId,
    actionData: systemState.selfActionData,
  };
  socket.emit('catchUpActions', data);

  // Set a timeout to reset the resyncing flag
  setTimeout(() => {
    systemState.isResyncing = false;
    systemState.lastFullSyncTime = Date.now();
  }, 5000); // 5 second timeout
};
