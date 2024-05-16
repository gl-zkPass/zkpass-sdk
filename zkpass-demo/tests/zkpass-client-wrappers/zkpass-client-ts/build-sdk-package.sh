#!/usr/bin/env bash

PACKAGE_NAME="zkpass-client-ts"

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",@ ]//g')

PACKAGE_FULL_NAME="${PACKAGE_NAME}-${PACKAGE_VERSION}.tgz"

echo "==============================================="
echo "Pack ${PACKAGE_NAME}"
echo "==============================================="
rm -rf *.tgz
npm install --ignore-scripts
npm run clean
npm run build --ignore-scripts
npm pack

echo
echo "=============================================================="
echo "===== Finish Pack ${PACKAGE_NAME} ====="
echo "=============================================================="
