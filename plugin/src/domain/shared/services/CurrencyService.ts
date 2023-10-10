export interface CurrencyService {
    /**
     *
     * @param value the amount to convert (not in cents, e.g. $1.56)
     * @param currencyCode Currency code compliant to [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217).
     */
    convert(value: number, currencyCode: string): number;
}

export class CurrencyService {
    convert(value: number, currencyIso: string): number {
        switch (currencyIso) {
            case 'EUR':
                return value * 11.7;
            case 'USD':
                return value * 10.6;
            case 'CAD':
                return value * 7.8;
            case 'GBP':
                return value * 13;
            case 'SEK':
                return value * 1;
            case 'KRW':
                return value * 0.008;
            case 'AUD':
                return value * 7.017;
            case 'HKD':
                return value * 1.416;
            case 'JPY':
                return value * 0.077;
            case 'CNY':
                return value * 15;

            default:
                return value;
        }
    }
}
