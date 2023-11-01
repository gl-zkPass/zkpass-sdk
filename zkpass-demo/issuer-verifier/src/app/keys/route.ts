import * as jose from "jose";

export async function POST() {
  const crypto = require("crypto");

  interface PublicKey {
    kty: string;
    crv: string;
    x: string;
    y: string;
    kid: string;
  }

  const keypair = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: { type: "spki", format: "jwk" },
    privateKeyEncoding: { type: "sec1", format: "pem" },
  });
  // console.log({ keypair });
  const kid = crypto
    .createHash("sha256")
    .update(keypair.publicKey.x)
    .digest("base64");
  const publicKey: PublicKey = {
    kty: keypair.publicKey.kty,
    crv: keypair.publicKey.crv,
    x: keypair.publicKey.x,
    y: keypair.publicKey.y,
    kid,
  };
  const privateKey: string = keypair.privateKey;
  console.log({ publicKey, privateKey });

  // const { publicKey, privateKey } = await jose.generateKeyPair("ES256");
  // const jwksPublicKey = await jose.exportJWK(publicKey);
  // console.log({
  //   privateKey,
  //   publicKey,
  //   jwksPublicKey,
  // });

  // const keyPair = await jose.generateKeyPair("ec", {
  //   crv: "prime256v1",
  // });
  // const jwk = await jose.exportJWK(keyPair.publicKey);
  // const kid = await jose.calculateJwkThumbprint(jwk);
  // const pkcs8Pem = await jose.exportPKCS8(keyPair.privateKey);

  // console.log({ pkcs8Pem });

  // console.log({
  //   keys: [
  //     {
  //       ...jwk,
  //       kid,
  //       use: "sig",
  //       alg: "ES256",
  //     },
  //   ],
  // });
  return Response.json({
    status: "ok",
    message: "Key pair generated, check your console log.",
  });
}

export async function GET() {
  return Response.json({ data: "get api keys" });
}
