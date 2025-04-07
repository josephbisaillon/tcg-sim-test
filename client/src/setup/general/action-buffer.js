import { socket, systemState } from '../../front-end.js';
import { acceptAction } from './accept-action.js';
import { startKeybindsSleep } from '../../actions/keybinds/keybindSleep.js';

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
    }
    return true;
  }

  // If this action is from the past, it's likely a duplicate or we've already processed it
  console.log(
    `Ignoring action #${data.counter} (already processed, current: #${systemState.oppCounter})`
  );
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
      requestResync();
    }
  }
};

/**
 * Requests a resync from the other player
 */
const requestResync = () => {
  if (systemState.isResyncing) return;

  systemState.isResyncing = true;
  console.log(`Requesting resync from counter ${systemState.oppCounter}`);

  const data = {
    roomId: systemState.roomId,
    counter: systemState.oppCounter,
  };

  socket.emit('resyncActions', data);

  // Set a timeout to reset the resyncing flag
  setTimeout(() => {
    systemState.isResyncing = false;
  }, 5000); // 5 second timeout
};

/**
 * Clears the action buffer
 */
export const clearActionBuffer = () => {
  systemState.actionBuffer = [];
};
