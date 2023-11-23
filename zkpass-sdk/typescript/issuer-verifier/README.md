## Prerequisites

- [Node.js 18.7](https://nodejs.org/en) or later.

## Running issuer-verifier

- `npm install` - Install dependencies.
- `npm run dev` - Start the issuer-verifier server.

## Generating Keypair [Optional]

- `POST localhost:3001/keys`, check your console to see generated keypair.

## Modifying DVR [Optional]

- You can update DVR in [\_generateBloodTestQuery](src/app/verifier/dvrs/route.ts)

## Modifying Proof Validator [Optional]

- You can update the method to validate provided proof in [proofValidator](src/app/verifier/proofs/proofValidator.ts)

## Snippets

### Issuer Signing Data

https://github.com/GDP-ADMIN/didPass-demo/blob/b62cdaec4150d2022eb49930d9aa9c2afcd06d81/zkpass-demo/typescript/issuer-verifier/src/app/issuer/blood_tests/route.ts#L64-L95

### Verifier Signing DVR

https://github.com/GDP-ADMIN/didPass-demo/blob/b971737b4e52ba56213ae378fff0ac8e13553935/zkpass-demo/typescript/issuer-verifier/src/app/verifier/dvrs/route.ts#L67-L113

### Verifier Validating Proof

https://github.com/GDP-ADMIN/didPass-demo/blob/b62cdaec4150d2022eb49930d9aa9c2afcd06d81/zkpass-demo/typescript/issuer-verifier/src/app/verifier/proofs/route.ts#L10-L19
