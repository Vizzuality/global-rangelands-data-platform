# syntax=docker/dockerfile:1
# Development image. Source is bind-mounted at runtime; ENTRYPOINT resolves
# through the compose mount (./client:/app/client).
FROM node:24.15.0-bookworm-slim

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# Lockfile only, so source edits don't reinstall dependencies.
COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN chown -R node:node /app
USER node

EXPOSE 3000
ENTRYPOINT ["/app/client/entrypoint.sh"]
