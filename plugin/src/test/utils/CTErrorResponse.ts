export class CTErrorResponse extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}
