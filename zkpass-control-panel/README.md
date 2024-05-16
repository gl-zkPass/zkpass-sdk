## Pre-requisites

1. Node.js [18.17](https://nodejs.org/), or later
2. Install [Docker](https://docs.docker.com/engine/install/)

## Installation & Setup

All commands below should be run from the root directory of the project.

### Install MySql & Adminer

```bash
npm run compose:up
```

### Install Dependencies

```bash
npm install
```

### Setup Environment Variables

```bash
cp .env.example .env
```

> **Note**
> Ask for the `.env` file from the team

### Load Initial Data

- Add `prisma` command in the `package.json`, this was removed because this will overwrite existing DB every CI/CD

```
"scripts": {...},
"prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
```

- This will execute all the `.sql` in the `/prisma/migrations`

```bash
npx prisma migrate deploy
```

- Add your email to `/prisma/seed.ts` within `prisma.user.createMany()` if it doesn't already exist; this is used when you login.

- Load seed

```bash
npx prisma db seed
```

## Running Code

```bash
npm run dev
```

### Control Panel Page

```bash
http://localhost:3000/
```

### Adminer

```bash
http://localhost:8080/
```

```plaintext
    Server: mysql
    Username: root
    Password: root
```

## Notes

### Stop Docker Containers

```bash
npm run compose:down
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

### Generate Prisma Migration

Used when you have made changes to the schema.

```bash
npx prisma migrate dev --name init
```

### Sync Prisma Schema Changes to Database

Used when other developers have made changes to the schema.

```bash
npx prisma db push
```
