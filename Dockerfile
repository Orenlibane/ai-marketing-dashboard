FROM node:22.12-alpine AS builder

WORKDIR /app

# Copy frontend
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ .
RUN npm run build

# Copy server - copy prisma schema BEFORE npm ci (for postinstall)
WORKDIR /app
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/
COPY server/prisma.config.ts ./server/
WORKDIR /app/server
RUN npm ci
COPY server/ .
RUN npx prisma db push

# Production image
FROM node:22.12-alpine

WORKDIR /app

# Copy server and built frontend
COPY --from=builder /app/server ./server
COPY --from=builder /app/frontend/dist/frontend/browser ./server/public

WORKDIR /app/server

# Install production dependencies only
RUN npm ci --omit=dev && npx prisma generate

EXPOSE 3000

CMD ["node", "index.js"]
