# ---- Build stage ------------------------------------------------------------
FROM node:20-bookworm-slim AS builder   # use LTS, very stable with Next 15
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=2048" \
    NEXT_DISABLE_SWC_THREADS=1

RUN npm run build

# ---- Run stage --------------------------------------------------------------
FROM node:20-bookworm-slim
WORKDIR /app

# Copy the standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./public/_next/static
COPY --from=builder /app/public ./public

# Let Render inject PORT at runtime, don't hardcode it here
ENV NODE_ENV=production

# Render will set PORT (e.g. 10000); Next's server.js uses process.env.PORT
EXPOSE 3000

CMD ["node", "server.js"]
