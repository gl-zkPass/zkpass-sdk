# didPass Verifier Demo for Developers

## Prerequisite

1. [Node.js 14.6.0 or higher (LTS is preffered)](https://nodejs.org/en/download)
2. [Ngrok](https://ngrok.com/download)
3. [didPass-Wallet](https://docs.ssi.id/didpass/didpass-wallet/download-and-install-wallet)
4. [Issuer Demo](https://docs.ssi.id/didpass/v/didpass-developers-guide/~/changes/jCEn8UG86QOnzyhNQsWk/getting-started/quickstart/issuer-typescript-node.js)

## How to run Verifier Demo
1. Install all dependencies using `npm i`
2. Create a `.env` file and copy the contents from `.env.example` to the `.env` file you just created
3. Adjust the contents of the `.env` file, according to your configuration
4. Start ngrok through a separate terminal using ```ngrok http 3000```
5. Change `NEXT_PUBLIC_URL` to the forwarding port from `ngrok`
6. Run the application with `npm run dev`
7. Access the demo on [http://localhost:3000](http://localhost:3000)