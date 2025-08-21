# ---- Build stage ------------------------------------------------------------
FROM node:22-bookworm-slim AS builder
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
