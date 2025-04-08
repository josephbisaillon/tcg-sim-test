# PTCG-sim

PTCG-sim is primarily built with JavaScript, using Node.js, Express, and Socket.io as the key frameworks. Socket.io is utilized for two-player functionality.

## Running PTCG-sim

### Local Development

Follow these steps to run PTCG-sim on your local machine:

1. **Install Dependencies:** Run `pnpm install` to install all the required dependencies.

2. **Create Sqlite Database:** In the server/database directory, add a file named "db.sqlite". This is needed for storing game states, which is needed for exporting/importing game states as a URL. Note that you need to add this database even if you don't intend working with the export/imports as the server expects the file to exist.

3. **WebSocket Connection:** The application now automatically uses the current window location for WebSocket connections. No manual configuration is needed as the base URL is dynamically determined.

4. **Start Local Server:** Use nodemon to start running `server.js` locally. You can do this from the root directory by running `pnpm start`. This will load the repository with entry point being `front-end.js`. This file initializes various global variables, sets up the DOM, and registers socket event listeners.

### Docker Deployment

For production environments, we provide Docker support for easy deployment:

1. **Prerequisites:**
   - [Docker](https://docs.docker.com/get-docker/)
   - [Docker Compose](https://docs.docker.com/compose/install/)

2. **Quick Start:**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/ptcg-sim.git
   cd ptcg-sim

   # Build and start the containers
   docker-compose up -d
   ```

3. **Access the Application:**
   Open your browser and navigate to `http://localhost:4000`

4. **Configuration:**
   You can configure the application using environment variables:

   - Create a `.env` file based on `.env.production`:
     ```bash
     cp .env.production .env
     # Edit .env with your preferred settings
     ```

   - Or specify variables directly:
     ```bash
     PORT=8080 ADMIN_PASSWORD=securepassword docker-compose up -d
     ```

5. **Available Configuration Options:**

   | Variable | Description | Default |
   |----------|-------------|---------|
   | PORT | The port the server will listen on | 4000 |
   | HOST | The host address to bind to | 0.0.0.0 |
   | ADMIN_USERNAME | Username for Socket.IO Admin UI | admin |
   | ADMIN_PASSWORD | Password for Socket.IO Admin UI | changeThisInProduction |
   | DB_MAX_SIZE_GB | Maximum size for the SQLite database | 15 |
   | ENABLE_ANALYTICS | Enable/disable analytics tracking | false |
   | ANALYTICS_SCRIPTS | JSON configuration for analytics services | {} |
   | SNAPSHOT_RETENTION_DAYS | Number of days to keep game snapshots | 7 |
   | SNAPSHOT_SAVE_INTERVAL | Interval in ms between auto-saves | 30000 |

6. **Data Persistence:**
   The application uses a Docker volume named `ptcg-sim-data` to persist the SQLite database between container restarts. You can manage this volume using standard Docker commands:

   ```bash
   # List volumes
   docker volume ls

   # Backup the database
   docker run --rm -v ptcg-sim-data:/data -v $(pwd):/backup alpine tar -czvf /backup/ptcg-sim-data.tar.gz /data

   # Restore from backup
   docker run --rm -v ptcg-sim-data:/data -v $(pwd):/backup alpine sh -c "rm -rf /data/* && tar -xzvf /backup/ptcg-sim-data.tar.gz -C /"
   ```

7. **Health Checks:**
   The Docker setup includes health checks to monitor the application's status. You can check the health status with:

   ```bash
   docker ps
   ```

   The STATUS column will show `healthy` if everything is working correctly.

Feel free to explore the codebase and play around with the sim! I'm happy to answer any questions and I'm always open to suggestions :)

## Running with Docker

PTCG-sim can be easily deployed in a production environment using Docker. This provides a consistent, isolated environment that's easy to set up and maintain.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ptcg-sim.git
   cd ptcg-sim
   ```

2. **Build and start the containers:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:4000`

### Configuration

The Docker setup is configurable through environment variables. You can either:

1. **Use the provided .env.production file:**
   ```bash
   cp .env.production .env
   # Edit .env with your preferred settings
   docker-compose up -d
   ```

2. **Override specific variables in the command line:**
   ```bash
   PORT=8080 ADMIN_PASSWORD=securepassword docker-compose up -d
   ```

### Important Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | The port the server will listen on | 4000 |
| HOST | The host address to bind to | 0.0.0.0 |
| ADMIN_USERNAME | Username for Socket.IO Admin UI | admin |
| ADMIN_PASSWORD | Password for Socket.IO Admin UI | defaultPassword |
| DB_MAX_SIZE_GB | Maximum size for the SQLite database | 15 |
| ENABLE_ANALYTICS | Enable/disable analytics tracking | false |
| ANALYTICS_SCRIPTS | JSON configuration for analytics services | {} |

### Data Persistence

The SQLite database is stored in a Docker volume named `ptcg-sim-data` to ensure data persistence between container restarts. You can manage this volume using standard Docker commands:

```bash
# List volumes
docker volume ls

# Backup the database
docker run --rm -v ptcg-sim-data:/data -v $(pwd):/backup alpine tar -czvf /backup/ptcg-sim-data.tar.gz /data

# Restore from backup
docker run --rm -v ptcg-sim-data:/data -v $(pwd):/backup alpine sh -c "rm -rf /data/* && tar -xzvf /backup/ptcg-sim-data.tar.gz -C /"
```

### Health Checks

The Docker setup includes health checks to monitor the application's status. You can check the health status with:

```bash
docker ps
```

The STATUS column will show `healthy` if everything is working correctly.

### Analytics Configuration

The application supports configurable analytics tracking through environment variables. This allows you to integrate with various analytics services without modifying the code.

#### Enabling Analytics

To enable analytics, set the `ENABLE_ANALYTICS` environment variable to `true`:

```bash
ENABLE_ANALYTICS=true docker-compose up -d
```

#### Configuring Analytics Services

Analytics services are configured through the `ANALYTICS_SCRIPTS` environment variable, which accepts a JSON string:

```bash
ANALYTICS_SCRIPTS='{"cloudflare":{"enabled":true,"token":"your-token-here"},"google":{"enabled":true,"id":"G-XXXXXXXXXX"}}' docker-compose up -d
```

#### Supported Analytics Services

1. **Cloudflare Web Analytics:**
   ```json
   {
     "cloudflare": {
       "enabled": true,
       "token": "your-cloudflare-token"
     }
   }
   ```

2. **Google Analytics:**
   ```json
   {
     "google": {
       "enabled": true,
       "id": "G-XXXXXXXXXX"
     }
   }
   ```

You can enable multiple services simultaneously by including them in the JSON configuration.

### Game State Persistence

The application includes comprehensive state persistence features that ensure game continuity:

#### URL-Based Room Persistence

1. **Shareable Game Links**: Players can share direct links to their game rooms
2. **Persistent Sessions**: Users can refresh the page without losing their room connection
3. **Improved Reconnection**: The application can properly rejoin rooms after page reloads
4. **Reduced Connection Issues**: Cleaner reconnection process minimizes sync problems
5. **Preserved Game State**: Board state is maintained when players refresh the page

When a user joins a room, the URL is automatically updated with the room ID and username:
```
https://yourdomain.com/?room=roomID&user=username&spectator=false
```

#### Automatic Game State Saving

The application now automatically saves the game state to the server:

1. **Periodic Saving**: Game state is saved every 30 seconds during active play
2. **Complete State Storage**: All actions, board positions, and game progress are preserved
3. **Room-Based Storage**: Game states are associated with room IDs for easy retrieval
4. **Seamless Recovery**: Players can rejoin a game even after both disconnect

#### How It Works

1. **During Play**:
   - The game state is automatically saved to the database every 30 seconds
   - Each save includes all actions, counters, and player information

2. **On Reconnection**:
   - The system checks if a saved state exists for the room
   - If found, it restores the complete game state, including all cards and actions
   - If not found, it falls back to the standard reconnection process

3. **Connection Handling**:
   - New players joining a room get a fresh board state
   - Reconnecting players maintain the existing game state
   - Other players in the room are not affected when someone refreshes their page
   - Even if both players disconnect, the game can be resumed from the last saved state

This robust persistence system ensures that games can continue smoothly despite connection issues, page refreshes, or even complete disconnections.

### Production Deployment Considerations

1. **Security:**
   - Change the default admin credentials
   - Consider using a reverse proxy like Nginx for SSL termination
   - Restrict access to the Socket.IO Admin UI

2. **Performance:**
   - Adjust the health check intervals based on your needs
   - Monitor the database size and adjust DB_MAX_SIZE_GB accordingly

3. **Scaling:**
   - For high-traffic deployments, consider using a more robust database solution
   - Implement a load balancer if deploying multiple instances

4. **Deployment URLs:**
   - The application automatically uses the current window location for its base URL
   - This allows for flexible deployment to any domain or port without configuration
   - Both WebSocket connections and asset URLs will adapt to the current domain

### Troubleshooting

#### SQLite Native Module Issues

This application uses `better-sqlite3` instead of `sqlite3` for improved compatibility and performance. The Dockerfile includes the necessary build dependencies to compile the native modules:

- Python 3
- Make
- G++ compiler
- SQLite3 development libraries

The Docker build process sets the appropriate environment variables for node-gyp to use Python 3 and compiles the native modules with the `--unsafe-perm` flag to ensure proper permissions.

If you encounter any issues, you can try:

1. Rebuilding the Docker image with the `--no-cache` flag:
   ```bash
   docker-compose build --no-cache
   ```

2. Checking if your architecture (e.g., ARM64 for M1/M2 Macs) is properly supported by the Node.js image.

3. Running the application locally first to verify that the database connection works:
   ```bash
   pnpm install
   pnpm start
   ```

## Contributing

If you're interested in contributing, we'll soon be releasing detailed information about the contribution process. Stay tuned!

## Open Source

PTCG-sim is an open-source project. We encourage the community to get involved and stay updated with the latest releases and changes in the codebase.

## Contact

Feel free to reach out on:

- [Twitter](https://twitter.com/xxmichaellong)
- [Discord](https://discord.gg/jMfhQa38mh)

Happy testing!

-XXL
