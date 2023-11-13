## Prerequisites
1. [Node.js 18 or higher](https://nodejs.org/en/download)
2. [Redis](https://redis.io/)
3. [Ngrok](https://ngrok.com/download)

## Run Issuer Demo
1. Install all dependencies with `npm i`
2. Copy `.env` from `.env.example` and adjust it to your configuration
3. Start ngrok in seperate terminal with `ngrok http 3000`
4. Change `NEXT_PUBLIC_URL` and `NEXT_PUBLIC_DOMAIN_URL` to the forwarding port from `ngrok`
5. Run the application with `npm run dev`
6. Access the demo on [localhost:3000](http://localhost:3000)