import { systemState, socket } from '../../front-end.js';
import { clearActionBuffer } from '../general/action-buffer.js';
import { resyncActions } from '../general/resync-actions.js';

// Initialize UI elements
export function initializeSyncUI() {
  // Create UI elements if they don't exist
  createUIElements();
  
  // Set up update intervals
  setInterval(updateConnectionStatus, 1000);
  setInterval(updateActionCounters, 500);
  
  // Set up event listeners
  setupEventListeners();
}

// Create UI elements
function createUIElements() {
  // Connection status indicator
  const connectionStatus = document.createElement('div');
  connectionStatus.id = 'connectionStatus';
  connectionStatus.className = 'status-indicator status-connected';
  connectionStatus.innerHTML = `
    <span class="status-dot"></span>
    <span class="status-text">Connected</span>
    <div class="status-details">
      <div>Latency: <span id="connectionLatency">--</span></div>
      <div>Last sync: <span id="lastSyncTime">--</span></div>
      <div>Action counter: <span id="actionCounter">--</span></div>
    </div>
  `;
  document.body.appendChild(connectionStatus);
  
  // Sync progress indicator
  const syncProgress = document.createElement('div');
  syncProgress.id = 'syncProgress';
  syncProgress.className = 'sync-progress';
  syncProgress.innerHTML = `
    <div class="sync-progress-bar"></div>
    <div class="sync-progress-text">Synchronizing game state...</div>
  `;
  document.body.appendChild(syncProgress);
  
  // Action counters (only visible in debug mode)
  if (systemState.debugMode) {
    const actionCounters = document.createElement('div');
    actionCounters.id = 'actionCounters';
    actionCounters.className = 'action-counters';
    actionCounters.innerHTML = `
      <div class="counter-item">
        <span class="counter-label">Your actions:</span>
        <span id="selfCounter" class="counter-value">0</span>
      </div>
      <div class="counter-item">
        <span class="counter-label">Opponent actions:</span>
        <span id="oppCounter" class="counter-value">0</span>
      </div>
    `;
    document.body.appendChild(actionCounters);
  }
  
  // Sync notifications container
  const syncNotifications = document.createElement('div');
  syncNotifications.id = 'syncNotifications';
  syncNotifications.className = 'sync-notifications';
  document.body.appendChild(syncNotifications);
  
  // Debug panel (only in debug mode)
  if (systemState.debugMode) {
    createDebugPanel();
  }
  
  // Add CSS
  addStyles();
}

// Update connection status
function updateConnectionStatus() {
  if (!systemState.isTwoPlayer) return;
  
  const statusElement = document.getElementById('connectionStatus');
  if (!statusElement) return;
  
  const statusTextElement = statusElement.querySelector('.status-text');
  const latencyElement = document.getElementById('connectionLatency');
  const lastSyncElement = document.getElementById('lastSyncTime');
  const actionCounterElement = document.getElementById('actionCounter');
  
  // Update connection status
  if (!socket.connected) {
    statusElement.className = 'status-indicator status-disconnected';
    statusTextElement.textContent = 'Disconnected';
  } else if (systemState.isResyncing) {
    statusElement.className = 'status-indicator status-syncing';
    statusTextElement.textContent = 'Syncing...';
  } else if (Math.abs(systemState.selfCounter - systemState.oppCounter) > 5) {
    statusElement.className = 'status-indicator status-out-of-sync';
    statusTextElement.textContent = 'Out of Sync';
  } else {
    statusElement.className = 'status-indicator status-connected';
    statusTextElement.textContent = 'Connected';
  }
  
  // Update details
  if (systemState.connectionQuality) {
    latencyElement.textContent = `${systemState.connectionQuality.latency}ms`;
  }
  
  const timeSinceLastSync = Date.now() - systemState.lastFullSyncTime;
  lastSyncElement.textContent = formatTimeAgo(timeSinceLastSync);
  
  actionCounterElement.textContent = systemState.selfCounter;
  
  // Update sync progress if resyncing
  updateSyncProgress();
}

// Update action counters
function updateActionCounters() {
  if (!systemState.debugMode || !systemState.isTwoPlayer) return;
  
  const selfCounterElement = document.getElementById('selfCounter');
  const oppCounterElement = document.getElementById('oppCounter');
  
  if (selfCounterElement && oppCounterElement) {
    selfCounterElement.textContent = systemState.selfCounter;
    oppCounterElement.textContent = systemState.oppCounter;
    
    // Highlight mismatch
    const counterDiff = Math.abs(systemState.selfCounter - systemState.oppCounter);
    const counterItems = document.querySelectorAll('.counter-item');
    
    counterItems.forEach(item => {
      if (counterDiff > 1) {
        item.classList.add('counter-mismatch');
      } else {
        item.classList.remove('counter-mismatch');
      }
    });
  }
  
  // Update debug panel if active
  updateDebugPanel();
}

// Update sync progress indicator
function updateSyncProgress() {
  const syncProgressElement = document.getElementById('syncProgress');
  
  if (!syncProgressElement) return;
  
  if (systemState.isResyncing) {
    syncProgressElement.classList.add('active');
    
    // Simulate progress based on time since resync started
    const timeSinceResyncStarted = Date.now() - (systemState.resyncStartTime || Date.now());
    const estimatedDuration = 5000; // Assume 5 seconds for a full resync
    const progress = Math.min(95, (timeSinceResyncStarted / estimatedDuration) * 100);
    
    const progressBar = syncProgressElement.querySelector('.sync-progress-bar');
    progressBar.style.width = `${progress}%`;
  } else {
    syncProgressElement.classList.remove('active');
  }
}

// Show a sync notification
export function showSyncNotification(message, type = 'info') {
  const notificationsContainer = document.getElementById('syncNotifications');
  
  if (!notificationsContainer) return;
  
  const notification = document.createElement('div');
  notification.className = `sync-notification ${type}`;
  notification.textContent = message;
  
  notificationsContainer.appendChild(notification);
  
  // Remove after animation completes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5500); // Animation duration + display time
}

// Format time ago
function formatTimeAgo(ms) {
  const seconds = Math.floor(ms / 1000);
  
  if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  } else {
    return `${Math.floor(seconds / 3600)}h ago`;
  }
}

// Set up event listeners
function setupEventListeners() {
  // Listen for sync events
  systemState.onSyncStart = () => {
    systemState.resyncStartTime = Date.now();
    showSyncNotification('Synchronizing game state...', 'info');
  };
  
  systemState.onSyncComplete = () => {
    showSyncNotification('Synchronization complete', 'success');
  };
  
  systemState.onSyncFailed = (error) => {
    showSyncNotification(`Sync failed: ${error}`, 'error');
  };
  
  // Debug panel buttons
  if (systemState.debugMode) {
    const forceResyncButton = document.getElementById('debugForceResync');
    if (forceResyncButton) {
      forceResyncButton.addEventListener('click', () => {
        resyncActions();
        logSyncEvent('manual-resync', { counter: systemState.oppCounter });
      });
    }
    
    const clearBufferButton = document.getElementById('debugClearBuffer');
    if (clearBufferButton) {
      clearBufferButton.addEventListener('click', () => {
        clearActionBuffer();
        logSyncEvent('clear-buffer', {});
      });
    }
  }
}

// Create debug panel
function createDebugPanel() {
  const debugPanel = document.createElement('div');
  debugPanel.id = 'syncDebugPanel';
  debugPanel.className = 'sync-debug-panel';
  debugPanel.innerHTML = `
    <div class="debug-header">
      <h3>Sync Debug</h3>
      <button id="closeSyncDebug">×</button>
    </div>
    <div class="debug-content">
      <div class="debug-section">
        <h4>Connection</h4>
        <div>Status: <span id="debugConnectionStatus">Connected</span></div>
        <div>Latency: <span id="debugLatency">--</span></div>
        <div>Socket ID: <span id="debugSocketId">--</span></div>
      </div>
      <div class="debug-section">
        <h4>Sync Status</h4>
        <div>Self Counter: <span id="debugSelfCounter">0</span></div>
        <div>Opp Counter: <span id="debugOppCounter">0</span></div>
        <div>Buffered Actions: <span id="debugBufferedActions">0</span></div>
        <div>Last Sync: <span id="debugLastSync">--</span></div>
        <div>Resyncing: <span id="debugIsResyncing">No</span></div>
      </div>
      <div class="debug-section">
        <h4>Recent Events</h4>
        <div id="debugEventLog" class="debug-log"></div>
      </div>
      <div class="debug-actions">
        <button id="debugForceResync">Force Resync</button>
        <button id="debugClearBuffer">Clear Buffer</button>
      </div>
    </div>
  `;
  document.body.appendChild(debugPanel);
  
  // Add toggle button to connection status
  const connectionStatus = document.getElementById('connectionStatus');
  if (connectionStatus) {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Debug';
    toggleButton.className = 'debug-toggle';
    toggleButton.addEventListener('click', () => {
      debugPanel.classList.toggle('active');
    });
    connectionStatus.appendChild(toggleButton);
  }
  
  // Close button
  const closeButton = document.getElementById('closeSyncDebug');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      debugPanel.classList.remove('active');
    });
  }
}

// Update debug panel
function updateDebugPanel() {
  if (!systemState.debugMode) return;
  
  const panel = document.getElementById('syncDebugPanel');
  if (!panel || !panel.classList.contains('active')) return;
  
  // Update connection section
  const debugConnectionStatus = document.getElementById('debugConnectionStatus');
  if (debugConnectionStatus) {
    debugConnectionStatus.textContent = socket.connected ? 'Connected' : 'Disconnected';
  }
  
  const debugLatency = document.getElementById('debugLatency');
  if (debugLatency && systemState.connectionQuality) {
    debugLatency.textContent = `${systemState.connectionQuality.latency}ms`;
  }
  
  const debugSocketId = document.getElementById('debugSocketId');
  if (debugSocketId) {
    debugSocketId.textContent = socket.id || '--';
  }
  
  // Update sync status section
  const debugSelfCounter = document.getElementById('debugSelfCounter');
  if (debugSelfCounter) {
    debugSelfCounter.textContent = systemState.selfCounter;
  }
  
  const debugOppCounter = document.getElementById('debugOppCounter');
  if (debugOppCounter) {
    debugOppCounter.textContent = systemState.oppCounter;
  }
  
  const debugBufferedActions = document.getElementById('debugBufferedActions');
  if (debugBufferedActions) {
    debugBufferedActions.textContent = systemState.actionBuffer ? systemState.actionBuffer.length : 0;
  }
  
  const debugLastSync = document.getElementById('debugLastSync');
  if (debugLastSync) {
    debugLastSync.textContent = formatTimeAgo(Date.now() - systemState.lastFullSyncTime);
  }
  
  const debugIsResyncing = document.getElementById('debugIsResyncing');
  if (debugIsResyncing) {
    debugIsResyncing.textContent = systemState.isResyncing ? 'Yes' : 'No';
  }
}

// Log sync event to debug panel
export function logSyncEvent(type, details) {
  if (!systemState.debugMode) return;
  
  const logElement = document.getElementById('debugEventLog');
  if (!logElement) return;
  
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.innerHTML = `<span class="log-time">${timestamp}</span> <span class="log-type">${type}</span>: ${JSON.stringify(details)}`;
  
  logElement.appendChild(logEntry);
  
  // Scroll to bottom
  logElement.scrollTop = logElement.scrollHeight;
  
  // Limit entries
  while (logElement.children.length > 50) {
    logElement.removeChild(logElement.firstChild);
  }
}

// Add CSS styles
function addStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Connection Status Indicator */
    .status-indicator {
      position: fixed;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 12px;
      background-color: rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
    }
    
    .status-connected .status-dot { background-color: #4CAF50; }
    .status-syncing .status-dot { background-color: #FFC107; }
    .status-disconnected .status-dot { background-color: #F44336; }
    .status-out-of-sync .status-dot { background-color: #FF9800; }
    
    .status-details {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px;
      width: 180px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      margin-top: 5px;
    }
    
    .status-indicator:hover .status-details {
      display: block;
    }
    
    /* Sync Progress */
    .sync-progress {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: rgba(0, 0, 0, 0.1);
      z-index: 1001;
      display: none;
    }
    
    .sync-progress-bar {
      height: 100%;
      background-color: #2196F3;
      width: 0%;
      transition: width 0.3s ease;
    }
    
    .sync-progress-text {
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(33, 150, 243, 0.9);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
    
    .sync-progress.active {
      display: block;
    }
    
    /* Action Counters */
    .action-counters {
      position: fixed;
      bottom: 10px;
      right: 10px;
      background-color: rgba(255, 255, 255, 0.8);
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px;
      font-size: 12px;
      z-index: 1000;
    }
    
    .counter-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    
    .counter-value {
      font-weight: bold;
      margin-left: 8px;
    }
    
    .counter-mismatch .counter-value {
      color: #F44336;
    }
    
    /* Sync Notifications */
    .sync-notifications {
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 1002;
    }
    
    .sync-notification {
      background-color: white;
      border-left: 4px solid #2196F3;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      padding: 12px 16px;
      margin-top: 8px;
      border-radius: 4px;
      max-width: 300px;
      animation: fadeIn 0.3s, fadeOut 0.3s 5s forwards;
    }
    
    .sync-notification.error {
      border-left-color: #F44336;
    }
    
    .sync-notification.warning {
      border-left-color: #FF9800;
    }
    
    .sync-notification.success {
      border-left-color: #4CAF50;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
    
    /* Debug Panel */
    .sync-debug-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1003;
      display: none;
    }
    
    .sync-debug-panel.active {
      display: block;
    }
    
    .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid #ddd;
      background-color: #f5f5f5;
    }
    
    .debug-header h3 {
      margin: 0;
      font-size: 14px;
    }
    
    .debug-content {
      padding: 12px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .debug-section {
      margin-bottom: 16px;
    }
    
    .debug-section h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #555;
    }
    
    .debug-log {
      height: 100px;
      overflow-y: auto;
      background-color: #f5f5f5;
      padding: 8px;
      font-family: monospace;
      font-size: 11px;
      border-radius: 2px;
    }
    
    .debug-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
    }
    
    .debug-actions button {
      padding: 4px 8px;
      font-size: 12px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 3px;
      cursor: pointer;
    }
    
    .debug-actions button:hover {
      background-color: #e5e5e5;
    }
    
    .debug-toggle {
      margin-left: 8px;
      padding: 2px 6px;
      font-size: 10px;
      background-color: rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 3px;
      cursor: pointer;
    }
    
    .log-entry {
      margin-bottom: 2px;
      word-break: break-all;
    }
    
    .log-time {
      color: #777;
    }
    
    .log-type {
      font-weight: bold;
    }
  `;
  document.head.appendChild(styleElement);
}

// Initialize connection quality tracking
export function initializeConnectionQuality() {
  systemState.connectionQuality = {
    latency: 0,
    packetLoss: 0,
    lastHeartbeat: Date.now()
  };
  
  // Send heartbeats
  setInterval(() => {
    if (systemState.isTwoPlayer && socket.connected) {
      const timestamp = Date.now();
      socket.emit('heartbeat', { timestamp });
    }
  }, 2000);
  
  // Handle heartbeat responses
  socket.on('heartbeatResponse', (data) => {
    const roundTripTime = Date.now() - data.timestamp;
    systemState.connectionQuality.latency = roundTripTime;
    systemState.connectionQuality.lastHeartbeat = Date.now();
    
    // Update sync strategies based on connection quality
    if (roundTripTime > 200) {
      // High latency - use more aggressive buffering
      systemState.actionBufferTimeout = 1000;
    } else {
      // Low latency - use more responsive settings
      systemState.actionBufferTimeout = 300;
    }
    
    // Log for debugging
    if (systemState.debugMode) {
      logSyncEvent('heartbeat', { latency: roundTripTime });
    }
  });
}
