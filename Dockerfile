# syntax=docker/dockerfile:1

# ---- deps: install production dependencies (better-sqlite3 is a native module) ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# Build toolchain in case better-sqlite3 has no prebuilt binary for this platform.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- runner: minimal runtime image ----
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    DB_PATH=/data/app.db \
    PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server ./server
COPY public ./public
# SQLite database lives on a mounted volume at /data.
# The container runs as root (default) so a root-owned mounted volume stays writable.
RUN mkdir -p /data
EXPOSE 3000
CMD ["node", "server/server.js"]
