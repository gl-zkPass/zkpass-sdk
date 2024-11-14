<h1 align="middle">zkpass Command Line Demo</h1>

<p>
  <p>
    For complete information on everything you need to do before using this program, including installation and usage instructions, please refer to the Gitbook documentation.
  </p>
  <a href="https://docs.ssi.id/zkpass/v/zkpass-developers-guide/sdk-tutorial/quick-start/typescript-node.js-linux" target="_blank">
      <img src="https://img.shields.io/badge/GitBook-read-blue?style=for-the-badge&logo=gitbook&logoColor=white" />
  </a>
</p>

## Prerequisites

- Ubuntu version 20 or higher, WSL (Windows Subsystem for Linux) is also supported.
- [Node.js 18.17](https://nodejs.org/en) or later.

## How to Run zkPass Demo

Follow these steps to run the zkPass Demo:

1. Set up the environment:

   1. Copy `.env.example` and rename it to `.env`:
      ```bash
      cp .env.example .env
      ```
   2. Update all the environment variables in the `.env` file based on the environment you want to test.

   Replace the placeholders with your actual values. You can get the API key and secret API key from the [zkPass Portal](https://portal.ssi.id/en).

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run a script from `package.json`:

   ```bash
   npm run [demo-script]
   ```

   For example:

   ```bash
   npm run demo-basic
   ```

4. Available demo scripts:
   - `demo-basic`
   - `demo-basic-false`
   - `demo-dewi`
   - `demo-ramana`
   - `demo-jane`
   - `demo-multi`

You can run any of the above scripts using the `npm run` command followed by the script name.
