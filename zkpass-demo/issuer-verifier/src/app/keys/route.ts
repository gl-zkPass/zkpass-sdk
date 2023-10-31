import * as jose from "jose";

export async function POST() {
  // const { publicKey, privateKey } = await jose.generateKeyPair("ES256");
  // const jwksPublicKey = await jose.exportJWK(publicKey);
  // console.log({
  //   privateKey,
  //   publicKey,
  //   jwksPublicKey,
  // });

  const keyPair = await jose.generateKeyPair("ES256");
  const jwk = await jose.exportJWK(keyPair.publicKey);
  const kid = await jose.calculateJwkThumbprint(jwk);
  const pkcs8Pem = await jose.exportPKCS8(keyPair.privateKey);

  console.log({ pkcs8Pem });

  console.log({
    keys: [
      {
        ...jwk,
        kid,
        use: "sig",
        alg: "ES256",
      },
    ],
  });
  return Response.json({ status: "ok" });
}

export async function GET() {
  return Response.json({ data: "get api keys" });
}
