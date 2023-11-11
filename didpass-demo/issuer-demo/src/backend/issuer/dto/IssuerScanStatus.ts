import { StatusCodes } from "http-status-codes";

export enum IssuerScanStatus {
    PENDING = "pending",
    SCANNED = "scanned",
    NOT_FOUND = "not found",
}

export interface IIssuerScanResponse {
    status: StatusCodes;
    statusType: IssuerScanStatus;
    message: string;
}
