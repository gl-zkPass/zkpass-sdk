# zkpass-client-react-native

React Native implementation for ZkPass Client

## Installation

```sh
npm install zkpass-client-react-native
```

## Usage
### JWE Encryption
```js
import { encryptDataToJWEToken } from 'zkpass-client-react-native';

const key = 
  '-----BEGIN PUBLIC KEY-----\n' +
  'YOUR_P256_PUBLIC_KEY\n' +
  '-----END PUBLIC KEY-----';  
const data = JSON.stringify({
  Hello: 'World!',
});

const result = encryptDataToJWEToken(key, data);
```

### JWE Decryption
```js
import { decryptJWEToken } from 'zkpass-client-react-native';

const key = 
  '-----BEGIN PRIVATE KEY-----\n' +
  'YOUR_P256_PRIVATE_KEY\n' +
  '-----END PRIVATE KEY-----';
const jwe = 'YOUR_JWE';

const result = await decryptJWEToken(key, jwe);
```

### JWS Signing
```js
import { signDataToJWSToken } from 'zkpass-client-react-native';

const key = 
  '-----BEGIN PRIVATE KEY-----\n' +
  'YOUR_P256_PRIVATE_KEY\n' +
  '-----END PRIVATE KEY-----';
const data = JSON.stringify({
  Hello: 'World!',
});
const verificationKeys = {
  jku: 'YOUR_JKU',
  kid: 'YOUR_KID',
};

const result = await signDataToJWSToken(
  key,
  data,
  verificationKeys,
);
```

### JWS Verification
```js
import { verifyJWSToken } from 'zkpass-client-react-native';

const key = 
  '-----BEGIN PUBLIC KEY-----\n' +
  'YOUR_P256_PUBLIC_KEY\n' +
  '-----END PUBLIC KEY-----';
const jws = 'YOUR_JWS';

const result = await verifyJWSToken(key, jws);
```

### Generate ZkProof
```js
import { generateZkPassProof } from 'zkpass-client-react-native';

const url = 'http://your.zkpass.service.url.com/';
const userData = 'USER_DATA_JWE';
const dvrToken = 'DVR_TOKEN_JWE';

const result = await generateZkPassProof(url, userData, dvrToken);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
