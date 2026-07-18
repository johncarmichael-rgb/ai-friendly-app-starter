#!/bin/sh

set -e

echo "Command: $@"

command="${1:-prod}"

case $command in
  watch)
    NODE_ENV=development npm install

    echo "Running socket dev server..."
    exec npm run dev:start
  ;;
  prod)
    echo "Running socket server..."
    exec npm run start
  ;;
esac
