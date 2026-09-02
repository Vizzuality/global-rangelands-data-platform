# syntax=docker/dockerfile:1
# Development image. ENTRYPOINT resolves through the compose mount
# (./cms:/app/cms).
FROM node:22.23.1-bookworm-slim

# Native toolchain for sharp.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
      autoconf \
      automake \
      libc6 \
      zlib1g-dev \
      libpng-dev \
      nasm \
      bash \
      libvips-dev \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app/

# Lockfile only, so source edits don't reinstall dependencies.
COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 1337
ENTRYPOINT ["/app/cms/entrypoint.sh"]
