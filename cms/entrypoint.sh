#!/bin/bash
set -e

case "${NODE_ENV}" in
    development)
        echo "Running Development Server"
        exec yarn dev
        ;;
    test)
        echo "Running Test"
        exec yarn test
        ;;
    production)
        echo "Import config - Skip on first deploy"
        # Temporarily disable configuration import fot he first run of cms
        # yarn config-sync import -y
        echo "Running Production Server"
        exec yarn start
        ;;
    *)
        echo "Unknown NODE environment: \"${NODE_ENV}\""
esac
