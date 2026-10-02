# syntax=docker/dockerfile:1

# build — full deps, since tsc and the type packages are devDependencies.
FROM node:22.23.1-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run compile

# runner
FROM node:22.23.1-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs tiler

# --omit=dev leaves @google-cloud/functions-framework out, which is why
# src/server.ts adds a plain app.listen entrypoint.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=tiler:nodejs /app/build ./build

USER tiler

EXPOSE 8080

CMD ["node", "build/src/server.js"]
