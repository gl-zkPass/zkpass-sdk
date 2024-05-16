# @didpass/zkpass-client-ts

Welcome to the `@didpass/zkpass-client-ts` SDK! This TypeScript wrapper is designed to facilitate the utilization of the underlying Rust core SDK. It leverages an FFI (Foreign Function Interface) module to interact with the Rust `libr0_zkpass_query.so` file, providing seamless integration into your TypeScript projects.

## Description

The `@didpass/zkpass-client-ts` SDK acts as a bridge between your TypeScript applications and the Rust core SDK. By leveraging this wrapper, developers can harness the functionality of the Rust library without dealing directly with its complexities, offering a more accessible and user-friendly interface.

## Installation via NPM Registry

To integrate the `@didpass/zkpass-client-ts` SDK into your project, follow these steps:

1. Ensure you have access to the package registry by adding the following line to your `.npmrc` file:

   ```plaintext
   @didpass:registry=https://us-west1-npm.pkg.dev/gdp-labs/gdplabs-npm-public/
   ```

2. Install the package via npm:

   ```bash
   npm install @didpass/zkpass-client-ts
   ```

## Loading `libr0_zkpass_query.so` File via Custom Path

You can load `libr0_zkpass_query.so` from a custom path by adding an `.env` file with the following key-value:

```plaintext
FFI_BINARY_PATH=/path/to/libr0_zkpass_query.so
```

To setup your own `libr0_zkpass_query.so`, see [this guide](../../README.md#initial-build-setup-prerequisites).

## Usage

Once installed and configured, you can start using the SDK in your TypeScript code:

```typescript
import { ZkPassClient, ZkPassApiKey } from "@didpass/zkpass-client-ts";

// Create an instance of the client
const zkPassServiceUrl = "https://staging-zkpass.ssi.id";
const zkPassApiKey = new ZkPassApiKey("API_KEY", "API_SECRET");
const zkVm = "r0";
const zkPassClient = new ZkPassClient({
  zkPassServiceUrl,
  zkPassApiKey,
  zkVm,
});

// Use the client methods as needed
// For example:
const proof = await zkPassClient.generateZkpassProof(userDataJWT, dvrJWT);
console.log(proof);
```

Please refer to the documentation or examples provided by the SDK for further usage and API details.

## NextJS Compatibility

Prior to Next.js `v13.5.6` projects, several configurations have to be made in your project.

In `next.config.js`:

```js
const nextConfig = {
  // ...,
  experimental: {
    // ...,
    esmExternals: "loose", // Enable ESM imports
    serverComponentsExternalPackages: ["@didpass/zkpass-client-ts"], // Exclude SDK from bundling, to enable reading binary file
  },
};

module.exports = nextConfig;
```

> The `serverComponentsExternalPackages` configuration ensures that the package [`@didpass/zkpass-client-ts`](#didpasszkpass-client-ts) is excluded from NextJS' bundling and compilation process, allowing it to be imported directly from `node_modules`. As a result, remember to include the `node_modules` directory in your production build. See [NextJS Deployment Guide](https://nextjs.org/docs/pages/building-your-application/deploying).

## Support

For any queries, issues, or assistance regarding the `@didpass/zkpass-client-ts` SDK, feel free to reach out to [our support team](mailto:support@example.com).
