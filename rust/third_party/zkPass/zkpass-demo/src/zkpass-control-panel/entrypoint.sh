#!/bin/bash

set -e

npx prisma migrate deploy
PORT=3000 HOSTNAME=0.0.0.0 node server.js
