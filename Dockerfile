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
WORKDIR /app/server
RUN npm ci
COPY server/ .
RUN npx prisma generate && npx prisma db push

# Production image
FROM node:22.12-alpine

WORKDIR /app

# Copy server and built frontend
COPY --from=builder /app/server ./server
COPY --from=builder /app/frontend/dist/frontend/browser ./server/public

WORKDIR /app/server

# Install production dependencies only
RUN npm ci --only=production && npx prisma generate

EXPOSE 3000

CMD ["node", "index.js"]
