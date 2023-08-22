import { CurrencyService } from "./CurrencyService";

export class DummyCurrencyService implements CurrencyService {
    convert(value: number, currencyIso: string): number {
        // ***** hardcoded conversion to USD ***
        // switch (currencyIso) {
        //     case 'GBP':
        //         return value / 1.21;
        //     case 'EUR':
        //         return value / 1.07;
        //     default:
        //         return value;
        // }
        //
        // ***** API service for currencies conversion ***
        // const result = await fetch(`https://my-conversion-api-service.com/${value}?currency=${currencyIso}&targetCurrency=USD`);
        // return result.json();
        //
        // ***** no conversion *****
        return value;
    }
}
