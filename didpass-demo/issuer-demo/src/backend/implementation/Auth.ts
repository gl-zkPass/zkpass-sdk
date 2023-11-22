import { IAuth } from "../interfaces/IAuth";
import { SiweMessage } from "siwe";

/**
 * Represents an implementation of the IAuth interface.
 * @implements {IAuth}
 */
export class Auth implements IAuth {
  /**
   * Authenticates a signature against a message using Sign In With Ethereum (SIWE) Library.
   * @param {string} message - The message to authenticate.
   * @param {string} signature - The signature to verify against the message.
   * @returns {Promise<boolean>} - A promise that resolves to true if the signature is valid, false otherwise.
   */
  async authenticateSignature(
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const siweMessage = new SiweMessage(message);
      const { success } = await siweMessage.verify({ signature });

      return success;
    } catch (error) {
      return false;
    }
  }
}
