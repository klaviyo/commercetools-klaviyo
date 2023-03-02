export enum ErrorCodes { LOCKED }
export class StatusError extends Error {
    constructor(public status: number, message: string, public code?: ErrorCodes) {
        super(message);
    }
}
