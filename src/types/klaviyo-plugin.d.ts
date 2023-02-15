type KlaviyoEvent = {
    type: 'profileCreated' | 'profileUpdated' | 'profileResourceUpdated' | 'event';
    body: KlaviyoRequestType;
};

type KlaviyoRequestType = ProfileRequest | EventRequest;

type ProcessingResult = {
    status: 'OK' | '4xx';
};

type Context = {
    currencyService: ICurrencyService;
};

interface ICurrencyService {
    /**
     *
     * @param value the amount to convert (not in cents, e.g. $1.56)
     * @param currencyCode Currency code compliant to [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217).
     */
    convert(value: number, currencyCode: string): number;
}
