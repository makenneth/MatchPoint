#!/bin/bash

export REDIS_PORT=6379
export DB_PASSWORD=Lalala4321.
export DOMAIN=localhost:3000
export APP_HOST=localhost
export APP_PORT=3000
export NODE_ENV=development
export HOST=localhost
export REDIS_HOST=127.0.0.1
export WEB_HOST=localhost
export WEBSOCKET_SERVER=http://localhost:9000
docker-compose build
docker-compose down
docker-compose up
