FROM node:24.15.0-bookworm-slim
# Install dependencies
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y \
      build-essential \
      gcc autoconf \
      automake \
      libc6 \
      zlib1g-dev \
      libpng-dev \
      nasm bash \
      libvips-dev \
    && apt-get clean

ENV NODE_ENV=development

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app/

COPY config ./config
COPY database ./database
COPY public ./public
COPY src ./src

COPY .env \
     .nvmrc \
     .npmrc \
     favicon.png \
     package.json \
     pnpm-lock.yaml \
     entrypoint.sh \
     tsconfig.json \
     ./

RUN pnpm install --frozen-lockfile

ENV PATH=/app/node_modules/.bin:$PATH

EXPOSE 1337
ENTRYPOINT ["/app/cms/entrypoint.sh"]
