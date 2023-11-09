import {
    ICredentialQR,
} from "@didpass/issuer-sdk/lib/types/CredentialDTO";
import { ICredentialQRPayload } from "@didpass/issuer-sdk/lib/types/WalletDTO";

export interface IIssue {

    getCredentialQRCode(
        did: string,
        credentialId: string,
        type: string
    ): Promise<{
        result: ICredentialQR;
    }>;

    getClaimCredential(credentialPayload: ICredentialQRPayload): Promise<any>;
}
