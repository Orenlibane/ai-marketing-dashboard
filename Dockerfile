FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy frontend
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ .
RUN npm run build

# Copy server
WORKDIR /app
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/
WORKDIR /app/server
RUN npm ci
COPY server/ .

# Production image
FROM node:22-bookworm-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy server and built frontend
COPY --from=builder /app/server ./server
COPY --from=builder /app/frontend/dist/frontend/browser ./server/public

WORKDIR /app/server

# Install production dependencies
RUN npm ci --omit=dev && npx prisma generate

EXPOSE 3000

# Server handles db push and seeding on startup
CMD ["node", "index.js"]
