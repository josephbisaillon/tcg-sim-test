FROM node:20-slim

# Install build dependencies for better-sqlite3 and other tools
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies with proper flags for native modules
ENV PYTHON=/usr/bin/python3
ENV NODE_GYP_FORCE_PYTHON=/usr/bin/python3
ENV BETTER_SQLITE3_BINARY=true
RUN pnpm install --unsafe-perm

# Copy application code
COPY . .

# Create database directory
RUN mkdir -p /app/server/database

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["pnpm", "start"]
