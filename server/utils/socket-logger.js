import config from '../config.js';

export const setupSocketLogger = (io) => {
  if (!config.development.logSocketEvents) return;

  // Log all incoming socket connections
  io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] Socket connected: ${socket.id}`);

    // Log all events received from clients
    const originalOnEvent = socket.onevent;
    socket.onevent = function (packet) {
      const args = packet.data || [];
      if (args[0] !== 'ping') {
        // Ignore ping events to reduce noise
        console.log(
          `[${new Date().toISOString()}] SOCKET IN (${socket.id}): ${args[0]}`,
          args.length > 1 ? JSON.stringify(args.slice(1)) : ''
        );
      }
      originalOnEvent.call(this, packet);
    };

    // Log disconnections
    socket.on('disconnect', (reason) => {
      console.log(
        `[${new Date().toISOString()}] Socket disconnected: ${socket.id}, Reason: ${reason}`
      );
    });
  });

  // Log all outgoing events (more complex, requires middleware)
  io.use((socket, next) => {
    const originalEmit = socket.emit;
    socket.emit = function (event, ...args) {
      if (event !== 'ping') {
        // Ignore ping events
        console.log(
          `[${new Date().toISOString()}] SOCKET OUT (${socket.id}): ${event}`,
          args.length > 0 ? JSON.stringify(args) : ''
        );
      }
      return originalEmit.apply(this, [event, ...args]);
    };
    next();
  });
};
