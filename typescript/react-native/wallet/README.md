<h1 align="middle">Wallet Demo</h1>

<p>
  <a href="https://docs.ssi.id/zkpass/v/zkpass-developers-guide/sdk-tutorial/quick-start/typescript-react-native" target="_blank">
      <img src="https://img.shields.io/badge/GitBook-read-blue?style=for-the-badge&logo=gitbook&logoColor=white" />
  </a>
</p>

## Prerequisites

- [Node.js 18.17.0](https://nodejs.org/en) or later.
- [React Native](https://reactnative.dev/docs/environment-setup)
- [Java JDK v11 until v20](https://jdk.java.net/archive/) (gradle dosen't support higher version of JDK)

## Running Wallet-Demo

1. Run `npm install` - Install dependencies.

2. To run this demo you can use two options:
  -  Running Android Virtual Device (AVD)
     1. Open Android Studio
     2. Look for Device Manager icon
     3. Start the virtual device (create one if you doesn't have one)
  - Connect your phone via cable. Please refer to this [documentation](https://reactnative.dev/docs/running-on-device).

3. Go back to your terminal and start the React Native Wallet Demo using `npm run start`

4. Press `a` on the terminal to build the wallet in Android on your AVD or phone.

## Snippets

### Generating ZkPass Proof

https://github.com/GDP-ADMIN/zkpass-sdk/blob/b01b43fd54ec086d9693951c0b471b048fcd0569/zkpass-demo/wallet/src/home/HomePage.tsx#L101-L117