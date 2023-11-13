# didPass Verifier Demo for Developers

## Prerequisite

1. [Node.js 14.6.0 or higher (LTS is preffered)](https://nodejs.org/en/download)
1. [Docker](https://docs.docker.com/get-docker/)
1. [Redis](https://redis.io/)
1. [Ngrok](https://ngrok.com/download)

## How to run Verifier Demo
1. Install all dependencies using `npm i`
2. Create a `.env` file and copy the contents from `.env.example` to the `.env` file you just created
3. Adjust the contents of the `.env` file, according to your configuration
4. Start ngrok through a separate terminal using ```ngrok http 3000```
5. Setup local dependencies with docker

   i. Run docker compose in terminal
    ```bash
    npm run compose:up
    ```

   ii. Initialize prisma client
   ```bash
   npx prisma generate
   ```

6. Change `NEXT_PUBLIC_URL` to the forwarding port from `ngrok`
7. Run the application with `npm run dev`
8. Access the demo on [http://localhost:3000](http://localhost:3000)