FROM node:24-bookworm-slim AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN pnpm build


FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/app.db

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

RUN corepack enable \
    && pnpm install --prod --frozen-lockfile \
    && mkdir -p /app/data \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 hono \
    && chown -R hono:nodejs /app

USER hono

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["node", "dist/index.js"]
