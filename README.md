# PTCG-sim

PTCG-sim is primarily built with JavaScript, using Node.js, Express, and Socket.io as the key frameworks. Socket.io is utilized for two-player functionality.

## Running PTCG-sim Locally

Follow these steps to run PTCG-sim on your local machine:

1. **Install Dependencies:** Run `pnpm install` to install all the required dependencies.

2. **Create Sqlite Database:** In the server/database directory, add a file named "db.sqlite". This is needed for storing game states, which is needed for exporting/importing game states as a URL. Note that you need to add this database even if you don't intend working with the export/imports as the server expects the file to exist.

3. **WebSocket Connection:** The application now automatically uses the current window location for WebSocket connections. No manual configuration is needed as the base URL is dynamically determined.

4. **Start Local Server:** Use nodemon to start running `server.js` locally. You can do this from the root directory by running `pnpm start`. This will load the repository with entry point being `front-end.js`. This file initializes various global variables, sets up the DOM, and registers socket event listeners.

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
