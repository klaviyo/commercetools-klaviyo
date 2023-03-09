export enum ErrorCodes { LOCKED, UNKNOWN_ERROR }
export class StatusError extends Error {
    constructor(public status: number, message: string, public code?: ErrorCodes) {
        super(message);
    }
}
