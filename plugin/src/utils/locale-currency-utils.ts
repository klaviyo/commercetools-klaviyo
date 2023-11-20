import { LocalizedString, Price } from '@commercetools/platform-sdk';
import { getTypedMoneyAsNumber } from './get-typed-money-as-number';
import * as _ from 'lodash';
import * as country_data from 'country-data';

const localeRegex = /^[A-Za-z]{2,4}([_-][A-Za-z]{4})?([_-]([A-Za-z]{2}|[0-9]{3}))?$/g;

export const getLocalizedStringAsText = (inputObject: LocalizedString): string => {
    const preferredLocales = getPreferredLocaleFromEnv();
    if (preferredLocales.locale && inputObject[preferredLocales.locale]) {
        return inputObject[preferredLocales.locale];
    }
    if (preferredLocales.genericLocale && inputObject[preferredLocales.genericLocale]) {
        return inputObject[preferredLocales.genericLocale];
    }
    return inputObject[Object.keys(inputObject)[0]];
};

export const getPreferredLocaleFromEnv = (): { locale?: string; genericLocale?: string } => {
    let locale: string | undefined;
    let genericLocale: string | undefined;
    const envLocale = process.env.PREFERRED_LOCALE || '';

    if (envLocale && new RegExp(localeRegex).test(envLocale)) {
        locale = envLocale;
        if (locale?.includes('-')) {
            genericLocale = locale.split('-')[0];
        }
    }

    // locale should be your intended locale, e.g.: en-US
    // genericLocale would be a fallback derived from locale when possible, e.g.: en
    return { locale, genericLocale };
};

export const getAdditionalLocalizedStringsAsJson = (
    metadataEntries: {
        property: string;
        data: LocalizedString;
    }[],
): any => {
    const outputMetadataEntries: any = {};
    metadataEntries.forEach((entry) => {
        const dataLocales = Object.keys(entry.data);
        dataLocales.forEach((l) => {
            outputMetadataEntries[entry.property + '_' + l] = entry.data[l];
        });
    });
    return outputMetadataEntries;
};

export const getPreferredCurrencyFromEnv = (): string => {
    return process.env.PREFERRED_CURRENCY ?? '';
};

export const getAdditionalPricesAsJson = (
    metadataEntries: {
        property: string;
        data: Price[];
    }[],
): any => {
    const outputMetadataEntries: any = {};
    metadataEntries.forEach((entry) => {
        const currencies = Array.from(new Set(entry.data.map((p) => p.value.currencyCode)));
        currencies.forEach((c) => {
            const matchedCountries = country_data.lookup.countries({ currencies: c });
            const price = getProductPriceByPriority(entry.data, c);
            outputMetadataEntries[entry.property + '_' + c] = getProductPriceByPriority(entry.data, c).amount;
            if (price.country) {
                outputMetadataEntries[entry.property + '_' + price.country] = price.amount;
            } else {
                matchedCountries.forEach((country) => {
                    outputMetadataEntries[entry.property + '_' + country.alpha2] = price.amount;
                });
            }
        });
    });
    return outputMetadataEntries;
};

export const getAdditionalCurrenciesAsJson = (
    metadataEntries: {
        property: string;
        data: Price[];
    }[],
): any => {
    const outputMetadataEntries: any = {};
    metadataEntries.forEach((entry) => {
        const currencies = Array.from(new Set(entry.data.map((p) => p.value.currencyCode)));
        currencies.forEach((c) => {
            const matchedCountries = country_data.lookup.countries({ currencies: c });
            const price = getProductPriceByPriority(entry.data, c);
            if (price.country) {
                outputMetadataEntries[entry.property + '_' + price.country] = price.currency;
            } else {
                matchedCountries.forEach((country) => {
                    outputMetadataEntries[entry.property + '_' + country.alpha2] = price.currency;
                });
            }
        });
    });
    return outputMetadataEntries;
};

export const getProductPriceByPriority = (
    prices: Price[],
    currencyCode?: string,
): { amount: number; currency: string; country?: string } => {
    const currentDate = new Date().getTime();
    let filteredPrices: Price[] = [];
    if (currencyCode) {
        filteredPrices = prices.filter((price) => price.value.currencyCode === currencyCode);
    } else {
        filteredPrices = prices;
    }
    const rangedPrices = filteredPrices
        .filter((price) => price.validFrom || price.validUntil)
        .map((price) => {
            return {
                ...price,
                validFrom: price.validFrom ? new Date(price.validFrom).getTime() : currentDate,
                validUntil: price.validUntil ? new Date(price.validUntil).getTime() : 'N/A',
            };
        })
        .filter(
            (price) =>
                price.validFrom <= currentDate &&
                (price.validUntil !== 'N/A' ? (price.validUntil as number) >= currentDate : true),
        );
    const sortedRangedPrices = _.orderBy(rangedPrices, ['validFrom', 'validUntil'], ['asc', 'asc']);
    const singleRangedPrice = sortedRangedPrices[0];
    const regularPrices = filteredPrices.filter(
        (price) => !price.validFrom && !price.validUntil && !price.customerGroup,
    );
    const singleRegularPrice = regularPrices[0];
    const chosenPrice = singleRangedPrice || singleRegularPrice;

    return {
        amount: getTypedMoneyAsNumber(
            chosenPrice?.value?.centAmount
                ? chosenPrice.value
                : {
                      centAmount: 0,
                      fractionDigits: 2,
                      type: 'centPrecision',
                      currencyCode: chosenPrice?.value?.currencyCode,
                  },
        ),
        currency: chosenPrice?.value?.currencyCode,
        country: chosenPrice?.country,
    };
};
