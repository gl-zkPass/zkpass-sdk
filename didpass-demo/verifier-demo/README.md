# didPass Verifier Demo for Developers

## Prerequisite

1. [Node.js 14.6.0 or higher (LTS is preffered)](https://nodejs.org/en/download)
2. [Ngrok](https://ngrok.com/download)
3. [Docker](https://docs.docker.com/get-docker/)
4. [didPass-Wallet](https://docs.ssi.id/didpass/didpass-wallet/download-and-install-wallet)
5. [Issuer Demo](https://docs.ssi.id/didpass/v/didpass-developers-guide/~/changes/jCEn8UG86QOnzyhNQsWk/getting-started/quickstart/issuer-typescript-node.js)

## How to run Verifier Demo

> **Note**: To ensure a smooth experience with the demo, we recommend running it within a WSL (Windows Subsystem for Linux) environment or Docker container.

1. Install all dependencies

```
npm install
```

2. Create a `.env` file and copy the contents from `.env.example` to the `.env` file you just created
3. Adjust the contents of the `.env` file, according to your configuration
4. Start `ngrok` through a separate terminal using

```bash
ngrok http 3002
```

5. Change `NEXT_PUBLIC_URL` to the forwarding port from `ngrok`
6. Run the application with

```bash
npm run dev
```

7. Access the demo on [http://localhost:3002](http://localhost:3002)

## How to run in Docker Container

1. Make sure the Docker engine is installed and running
2. Run docker compose through the pre-defined npm command, and wait until it finishes

```bash
npm run compose:up
```

3. Once it is done, the container should automatically be started and exposed to port `3002`
4. Finally, access the verifier demo on [http://localhost:3002](http://localhost:3002)
