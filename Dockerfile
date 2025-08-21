# ---- Build stage ------------------------------------------------------------
# Use a Debian-based image to avoid native module issues (e.g., sharp)
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# Ensure production build
ENV NODE_ENV=production
RUN npm run build

# ---- Run stage --------------------------------------------------------------
FROM node:22-bookworm-slim
WORKDIR /app

# Copy only what's needed at runtime
COPY --from=builder ["/app/public", "./public"]
COPY --from=builder ["/app/.next/static", "./.next/static"]
COPY --from=builder ["/app/.next/standalone", "./"]

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
