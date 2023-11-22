/**
 * Represents an interface for authentication.
 * @interface
 */
export interface IAuth {
  authenticateSignature(message: string, signature: string): Promise<boolean>;
}
