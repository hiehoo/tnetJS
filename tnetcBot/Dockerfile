# Build stage
FROM node:23.4.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:23.4.0-alpine AS production

# Set Node.js to production mode
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy package files 
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && \
    # Clean npm cache
    npm cache clean --force && \
    # Add sqlite dependencies for better-sqlite3
    apk add --no-cache sqlite sqlite-dev python3 make g++ && \
    # Create data directory for SQLite database
    mkdir -p /app/data && \
    # Set appropriate permissions
    chmod 755 /app/data && \
    # Create a non-root user to run the app
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Expose port if using webhook
# EXPOSE 3000

# Create volume for persistent data
VOLUME ["/app/data"]

# Switch to non-root user
USER appuser

# Start the bot
CMD ["node", "dist/index.js"] 