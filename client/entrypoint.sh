#!/bin/sh
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
        echo "Running Production Server"
        exec pnpm start
        ;;
    *)
        echo "Unknown NODE environment: \"${NODE_ENV}\""
esac
