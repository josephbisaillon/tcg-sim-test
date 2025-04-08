# Use Node.js LTS as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite-dev

# Copy package files
COPY package*.json ./
COPY pnpm-*.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy client package files
COPY client/package*.json ./client/
RUN cd client && pnpm install

# Copy server package files
COPY server/package*.json ./server/
RUN cd server && pnpm install

# Copy the rest of the application
COPY . .

# Create database directory
RUN mkdir -p /app/server/database

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Expose the port
EXPOSE 4000

# Start the server
CMD ["node", "server/server.js"]
