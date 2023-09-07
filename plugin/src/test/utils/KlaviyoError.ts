type ErrorResponse = {
    error?: {
        text: string;
    };
};

export class KlaviyoError extends Error {
    public status: number;

    public response?: ErrorResponse;

    constructor(status: number) {
        super();
        this.status = status;
    }

    public setResponse(response: ErrorResponse) {
        this.response = response;
    }
}
