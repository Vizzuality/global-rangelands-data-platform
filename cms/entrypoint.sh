#!/bin/bash
set -e

case "${NODE_ENV}" in
    development)
        echo "Running Development Server"
        exec pnpm dev
        ;;
    test)
        echo "Running Test"
        exec pnpm test
        ;;
    production)
        echo "Import config"
        pnpm config-sync import -y
        echo "Running Production Server"
        exec pnpm start
        ;;
    *)
        echo "Unknown NODE environment: \"${NODE_ENV}\""
esac
