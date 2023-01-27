export class KlaviyoError extends Error {
    private status: number;

    constructor(status: number) {
        super();
        this.status = status;
    }
}
