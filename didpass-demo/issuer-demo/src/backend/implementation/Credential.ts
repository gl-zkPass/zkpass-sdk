import { ICredential } from "../interfaces/ICredential";
import didkit from "@spruceid/didkit-wasm-node";
import { Auth } from "./Auth";
import { IssuanceDetails } from "../dto/IssuanceDetailsDTO";

/**
 * Credential class that implements ICredential interface.
 * @implements {ICredential}
 */
export class Credential implements ICredential {
  /**
   * The authentication object used for credential creation.
   */
  private auth: Auth;

  /**
   * Creates a new instance of the Credential class.
   */
  constructor() {
    this.auth = new Auth();
  }

  public async processCredentialRequest(
    walletDID: string,
    signedChallenge: string,
    vcId: string,
    vcProvider: any
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async processUpdateCredentialRequest(
    walletDID: string,
    signedRequest: string,
    vcId: string,
    vcProvider: any
  ): Promise<any> {
    throw new Error("Method not implemented.");
  }

  public async processStatusCheckRequest(
    did: string,
    vcId: string,
    vcProvider: any
  ): Promise<string> {
    throw new Error();
  }

  /**
   * Removes any characters that are not alphanumeric or a space from the given string.
   * @param str - The string to sanitize.
   * @returns The sanitized string.
   */
  public static safeString(str: string) {
    return str.replace(/^a-zA-Z0-9 ]/g, "");
  }

  /**
   * Builds a context object from a credential subject.
   * @param credentialSubject - The credential subject object.
   * @returns The context object.
   */
  public static buildContext(creadentialSubject: object) {
    return Object.keys(creadentialSubject).reduce(
      (prev, key) => ({
        ...prev,
        [key]: `ex:${this.safeString(key)}`,
      }),
      {}
    );
  }

  /**
   * Signs a verifiable credential using the provided issuance details, message, and signature.
   * @param issuanceDetails The details of the credential issuance, including issuer, metadata, and credential subject.
   * @param message The message to authenticate.
   * @param signature The signature to use for authentication.
   * @returns A signed verifiable credential.
   * @throws An error if the signature is invalid.
   */
  public async signCredential(
    issuanceDetails: IssuanceDetails,
    message: string,
    signature: string
  ) {
    // Authenticate request
    const isAuthenticated = await this.auth.authenticateSignature(
      message,
      signature
    );

    if (!isAuthenticated) {
      throw new Error("Invalid signature");
    }

    // Build Credential
    const { issuer, metadata, credentialSubject } = issuanceDetails;

    // Get verification method
    const verificationMethod = await issuer.getVerificationMethod();

    // Get Context
    let contextArray = metadata.context;
    if (!contextArray)
      contextArray = [Credential.buildContext(credentialSubject)];
    if (!Array.isArray(contextArray)) contextArray = [metadata.context];

    // Get Type
    const credentialTypeArray = Array.isArray(metadata.credentialType)
      ? metadata.credentialType
      : [metadata.credentialType];

    // Construct
    const unsignedCredential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1",
        ...contextArray,
      ],
      id: metadata.id,
      type: ["VerifiableCredential", ...credentialTypeArray],
      credentialSubject: {
        ...credentialSubject,
      },
      issuer: issuer.did,
      holder: metadata.receiverDID,
      issuanceDate: new Date().toISOString(),
      validFrom: metadata.validFrom?.toISOString() ?? undefined,
      validUntil: metadata.validUntil?.toISOString() ?? undefined,
    };

    const credentialOptions = {
      proofPurpose: "assertionMethod",
      verificationMethod,
      type: "EcdsaSecp256k1RecoverySignature2020",
    };

    // Sign
    const keypair = JSON.stringify(issuer.rawJwk);
    const credential = await didkit.issueCredential(
      JSON.stringify(unsignedCredential),
      JSON.stringify(credentialOptions),
      keypair
    );

    return JSON.parse(credential);
  }

  /**
   * Verifies the given credential object.
   * @param credential The credential object to be verified.
   * @returns A parsed verification object.
   * @throws An error if the proof, proof purpose, or verification method is missing.
   */
  public static async verifyCredential(credential: any) {
    if (!credential.proof) throw new Error("Missing proof!");
    if (!credential.proof.proofPurpose)
      throw new Error("Missing proof purpose!");
    if (!credential.proof.verificationMethod)
      throw new Error("Missing verification method!");

    const proofPurpose = credential.proof.proofPurpose;
    const verificationMethod = credential.proof.verificationMethod;

    const verificationOption = {
      proofPurpose,
      verificationMethod,
      type: "EcdsaSecp256k1RecoverySignature2020",
    };

    const verification = await didkit.verifyCredential(
      JSON.stringify(credential),
      JSON.stringify(verificationOption)
    );

    return JSON.parse(verification);
  }
}
