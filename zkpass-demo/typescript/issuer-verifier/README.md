## Prerequisites

- [Node.js 18.7](https://nodejs.org/en) or later.
- [ngrok](https://ngrok.com/)

## Running issuer-verifier

- `ngrok http 3009` - Start ngrok server.
- Create `.env.development`, copy content from `.env.example` and set `NEXT_PUBLIC_URL` to ngrok url from step 1.
- `npm install` - Install dependencies.
- `npm run dev` - Start the issuer-verifier server.

## Generating Keypair [Optional]

- `POST localhost:3009/keys`, check your console to see generated keypair.
- Add public key to [issuer jwks.json](public/issuer/jwks.json)
- Update issuer private key to sign blood test result in [issuer/blood_tests](src/app/issuer/blood_tests/route.ts)
- `POST localhost:3009/keys`, check your console to see generated keypair.
- Add public key to [verifier jwks.json](public/verifier/jwks.json)
- Update verifier private key to sign dvr in [verifier/proof](src/app/verifier/dvrs/route.ts)

## Modifying DVR [Optional]

- You can update DVR in [\_generateBloodTestQuery](src/app/verifier/dvrs/route.ts)

## Modifying Proof Validator [Optional]

- You can update the method to validate provided proof in [proofValidator](src/app/verifier/proofs/proofValidator.ts)
