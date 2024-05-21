# Global Rangelands Data Platform client application

## Overview

This platform is built using Node.js and [Next.js](https://nextjs.org/), a React framework, with TypeScript and [Tailwind](https://tailwindcss.com/).

## Dependencies

- Node.js v20.12
- Yarn v4.2.1

## Install & run

### Native execution

Be sure to set the required environment variables before running the application - see
the [Configuration](#configuration) section below for more details.

To run the application in development mode, use:

```bash
yarn dev
```

To run the application in production mode, use:

```bash
yarn build
yarn start
```

### Docker

This project includes 2 docker configuration files:

- `Dockerfile` aimed at development environments (may require tuning to work on different environments)
- `Dockerfile.prod` aimed at production environments

You can use either file to build a docker image for this application. Be sure to set the required environment variables
when running the container.

### Configuration

| Variable name            | Description                |           Default value |
| ------------------------ | -------------------------- | ----------------------: |
| NEXT_PUBLIC_URL          | Canonical URL              |  http://localhost:$PORT |
| NEXT_PUBLIC_API_URL      | URL of the CMS API.        | http://0.0.0.0:1337/cms |
| NEXT_PUBLIC_MAPBOX_TOKEN | Mapbox token used for maps |                      '' |
