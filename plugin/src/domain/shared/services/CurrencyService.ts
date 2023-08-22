export interface CurrencyService {
  /**
   *
   * @param value the amount to convert (not in cents, e.g. $1.56)
   * @param currencyCode Currency code compliant to [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217).
   */
  convert(value: number, currencyCode: string): number;
}
