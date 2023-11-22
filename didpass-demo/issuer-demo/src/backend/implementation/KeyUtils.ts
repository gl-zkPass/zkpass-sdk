import { ec } from "elliptic";
import { ethers } from "ethers";
import { isHex, isHexStrict } from "web3-validator";

/**
 * Resolves a private key into its corresponding public key, JWK, and address.
 * @param privateKey - The private key to resolve.
 * @returns An object containing the resolved private key, public key, JWK, and address.
 */
export function resolvePrivateKey(privateKey: string) {
  const keyStripped = prefixHex(privateKey);

  const keyHexSliced = keyStripped.substring(2);
  const curve = new ec("secp256k1");

  const publicKey = curve.keyFromPrivate(keyHexSliced).getPublic("hex");
  const publicX = publicKey.substring(2, 2 + 64);
  const publicY = publicKey.split(publicX)[1];

  const jwk = {
    kty: "EC",
    crv: "secp256k1",
    x: Buffer.from(publicX, "hex").toString("base64url"),
    y: Buffer.from(publicY, "hex").toString("base64url"),
    d: Buffer.from(keyHexSliced, "hex").toString("base64url"),
  };

  const address = computeAddress(privateKey);

  return {
    privateKey: keyStripped,
    publicKey,
    address,
    jwk,
  };
}

/**
 * Computes the address of a given private key.
 * @param privateKey - The private key to compute the address from.
 * @returns The computed address.
 */
export function computeAddress(privateKey: string) {
  const keyStripped = prefixHex(privateKey);
  const address = ethers.utils.computeAddress(keyStripped);

  return address;
}

/**
 * Removes the '0x' prefix from a given hex string.
 * @param hex - The hex string to strip.
 * @returns The stripped hex string.
 * @throws An error if the input is not a valid hex string.
 */
export function stripHex(hex: string) {
  if (!isHex(hex)) throw new Error("Invalid hex string value");
  if (isHexStrict(hex)) return hex.substring(2);

  return hex;
}

/**
 * Adds "0x" prefix to a given hex string if it's not already present.
 * @param hex - The hex string to be prefixed.
 * @returns The hex string with "0x" prefix.
 * @throws An error if the input string is not a valid hex string.
 */
export function prefixHex(hex: string) {
  if (!isHex(hex)) throw new Error("Invalid hex string value");
  if (!isHexStrict(hex)) return "0x" + hex;

  return hex;
}
