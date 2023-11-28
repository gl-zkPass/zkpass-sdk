## Prerequisites

- Ubuntu version 20 or higher, WSL (Windows Subsystem for Linux) is also supported.
- [Node.js 18.7](https://nodejs.org/en) or later.

## Installing demo

- `npm install` - Install dependencies.

## Running demo

- `npm run demo-dewi` - Expected result `false`.
- `npm run demo-ramana` - Expected result `true`.
- `npm run demo-jane` - Expected result `true`.

## Running demo with custom data

- `npm run demo ./test/data/ramana-profile.json ./test/data/bca-finance-ramana-dvr.json` - Expected result `true`
