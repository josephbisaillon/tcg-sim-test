# Pokemon TCG Simulator Server

This is the server component of the Pokemon TCG Simulator.

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the setup script:
   ```
   npm run setup
   ```
   This will create the necessary directories and configuration files.

### Configuration

The server uses environment variables for configuration. You can modify these in the `.env` file:

- `PORT`: The port the server will listen on (default: 4000)
- `HOST`: The host address to bind to (default: localhost)
- `NODE_ENV`: The environment mode (development or production)
- `DB_PATH`: Path to the SQLite database file
- `DB_MAX_SIZE_GB`: Maximum database size in GB
- `ADMIN_USERNAME`: Username for Socket.IO Admin UI
- `ADMIN_PASSWORD`: Password for Socket.IO Admin UI
- `ENABLE_DEBUG_LOGS`: Enable detailed logging (true/false)
- `LOG_SOCKET_EVENTS`: Log all socket events (true/false)

### Running the Server

For development with auto-restart:

```
# On Unix/Mac:
npm run dev

# On Windows:
npm run dev:win
```

For production:

```
npm start
```

### Socket.IO Admin UI

The Socket.IO Admin UI is available at:
https://admin.socket.io/

Use the credentials specified in your `.env` file to log in.

## Database

The server uses SQLite for data storage. The database file is created automatically if it doesn't exist.

### Database Location

By default, the database is stored in `database/db.sqlite`. You can change this in the `.env` file.

### Database Size Monitoring

The server monitors the database size and will prevent new game states from being stored if it exceeds the configured limit.

## API Endpoints

- `GET /`: Serves the main application
- `GET /import?key=<key>`: Imports a game state by key

## Socket.IO Events

The server handles various Socket.IO events for game synchronization. See the code for details on the supported events.

## Troubleshooting

### Database Issues

If you encounter database-related errors:

1. Check if the database directory exists
2. Verify the permissions on the database file
3. Check the database path in your `.env` file

### Socket.IO Connection Issues

If clients cannot connect to the server:

1. Verify the server is running
2. Check the CORS settings in `config.js`
3. Ensure the client is using the correct server URL

## Testing

The server includes a comprehensive test suite for the Socket.IO implementation. These tests ensure that the socket communication between clients and the server works correctly, without race conditions or bugs.

### Running Tests

To run the tests:

```bash
# Install test dependencies
npm install

# Run tests once
npm test

# Run tests in watch mode (automatically re-runs when code changes)
npm run test:watch
```

For more information about the tests, see the [tests/README.md](tests/README.md) file.

## Contributing

When making changes to the server:

1. Follow the existing code style
2. Add appropriate error handling
3. Test your changes thoroughly
   - Run the existing tests to ensure you haven't broken anything
   - Add new tests for any new functionality
4. Update documentation as needed
