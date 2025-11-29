# ---- Build stage ------------------------------------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NEXT_DISABLE_SWC_THREADS=1

RUN npm run build

# ---- Run stage --------------------------------------------------------------
FROM node:20-bookworm-slim
WORKDIR /app

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server + all required Node files
COPY --from=builder /app/.next/standalone ./

# Copy static files where Next expects them
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production

# Render injects PORT (e.g. 10000); server.js respects process.env.PORT
EXPOSE 3000

CMD ["node", "server.js"]
