FROM node:22.12-alpine AS builder

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
COPY server/prisma.config.ts ./server/
WORKDIR /app/server
RUN npm ci
COPY server/ .

# Production image
FROM node:22.12-alpine

WORKDIR /app

# Copy server and built frontend
COPY --from=builder /app/server ./server
COPY --from=builder /app/frontend/dist/frontend/browser ./server/public

WORKDIR /app/server

# Install production dependencies
RUN npm ci --omit=dev && npx prisma generate

EXPOSE 3000

# Run db push at startup, then start server
CMD ["sh", "-c", "npx prisma db push && node index.js"]
