FROM node:24-alpine AS base
WORKDIR /app

ENV NPM_CONFIG_UPDATE_NOTIFIER=false

FROM base AS deps

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build:prod

FROM base AS prod-deps

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

FROM node:24-alpine AS runner

WORKDIR /app
USER node

ENV PORT=3211

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=prod-deps /app/node_modules ./node_modules

EXPOSE 3211

CMD ["node", "dist/server.js"]
