#!/bin/bash

set -e

cp zkpass.env .env.local

npm install

# no test script available
# npm run test

npm run build

sed -i "s|SHORT_SHA|${SHORT_SHA}|" docker-compose.yml

tar -czvf build.tar.gz docker-compose.yml
