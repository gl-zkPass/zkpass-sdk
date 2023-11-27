## Prerequisites

- Ubuntu version 20 or higher, WSL (Windows Subsystem for Linux) is also supported.
- [Node.js 18.7](https://nodejs.org/en) or later.

## Installing demo

- `npm install` - Install dependencies.

## Running demo

- `npm run demo ./test/data/dewi-profile-wrong.json ./test/data/bca-insurance-dewi-dvr.json` - Dewi, expected result `false`.
- `npm run demo ./test/data/ramana-profile.json ./test/data/bca-finance-ramana-dvr.json` - Ramana, expected result `true`.
- `npm run demo ./test/data/jane-blood-test-result.json ./test/data/employee-onboarding-dvr.json` - Jane, expected result `true`.
