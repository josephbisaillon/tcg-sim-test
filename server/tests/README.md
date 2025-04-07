# Socket.IO Tests for Pokemon TCG Simulator

This directory contains tests for the Socket.IO implementation of the Pokemon TCG Simulator server. These tests ensure that the socket communication between clients and the server works correctly, without race conditions or bugs.

## Important Note

These tests use the **actual server implementation** from `socket-handler.js`, not a mock. This ensures that we're testing the real code that runs in production, not a separate implementation that might diverge over time.

## What's Being Tested

The tests cover the following aspects of the socket implementation:

1. **Room Management**

   - Creating rooms
   - Joining rooms
   - Rejecting players when a room is full
   - Allowing spectators to join full rooms
   - Cleaning up empty rooms

2. **Player Connections**

   - Handling player connections
   - Handling player disconnections
   - Handling player reconnections

3. **Game Synchronization**

   - Action synchronization between players
   - Action requests between players
   - Resync requests
   - Catch-up actions
   - Sync checks

4. **Race Conditions**
   - Multiple simultaneous actions
   - Multiple players leaving and joining

## Running the Tests

To run the tests, you need to have the required dependencies installed. Make sure you've run `npm install` in the server directory.

### Running Tests Once

```bash
npm test
```

### Running Tests in Watch Mode

This will automatically re-run the tests when you make changes to the code:

```bash
npm run test:watch
```

## Test Structure

The tests use Mocha as the test runner and Chai for assertions. Each test follows this structure:

1. Set up a test server and client sockets
2. Perform the test actions
3. Assert the expected results
4. Clean up the server and client sockets

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create a new test case using the `it()` function
2. Set up the necessary client sockets and server state
3. Perform the actions you want to test
4. Use Chai assertions to verify the expected behavior
5. Make sure to clean up any resources you create

Example:

```javascript
it('should handle a new feature', (done) => {
  // Set up
  const testData = {
    /* ... */
  };

  // Perform actions
  clientSocket1.emit('someEvent', testData);

  // Assert results
  clientSocket2.on('someEvent', (data) => {
    expect(data).to.deep.equal(testData);
    done();
  });
});
```

## Troubleshooting

If you encounter issues with the tests:

1. **Timeouts**: If tests are timing out, you may need to increase the timeout value in the test file:

   ```javascript
   this.timeout(15000); // Increase to 15 seconds
   ```

2. **Port conflicts**: If you're running the server and tests simultaneously, you may encounter port conflicts. The tests use port 4001 by default to avoid conflicts with the main server on port 4000.

3. **Connection issues**: Make sure you don't have any firewalls or security software blocking the connections.
