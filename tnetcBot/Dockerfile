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
    # Set appropriate permissions (open for any user)
    chmod 777 /app/data

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Copy assets folder
COPY assets ./assets

# Expose port if using webhook
# EXPOSE 3000

# Create volume for persistent data
VOLUME ["/app/data"]

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# These are commented out as we're running as root in docker-compose.yml
# For production deployment, uncomment these lines and remove user: "root" from docker-compose.yml
# RUN addgroup -S appgroup && \
#     adduser -S appuser -G appgroup && \
#     chown -R appuser:appgroup /app
# USER appuser

# Start the bot
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/index.js"] 