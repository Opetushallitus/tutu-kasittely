#!/bin/bash

CONTAINER_NAME="tutu-postgres"

echo "Starting..."

while true; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "starting Tutu DB")
  echo "Tutu DB Container status: $STATUS"
  if [ "$STATUS" = "healthy" ]; then
    echo "Tutu DB up & running, yay!"
    break
  fi
  sleep 1
done
