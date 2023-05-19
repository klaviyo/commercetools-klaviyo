import {
	getAdditionalCurrenciesAsJson,
	getAdditionalLocalizedStringsAsJson,
	getAdditionalPricesAsJson,
	getLocalizedStringAsText,
	getPreferredCurrencyFromEnv,
	getPreferredLocaleFromEnv,
	getProductPriceByPriority,
} from './locale-currency-utils';
import { LocalizedString, Price } from '@commercetools/platform-sdk';

describe('getPreferredLocaleFromEnv', () => {
	it('should return undefined for locale and genericLocale when environment variable is undefined/invalid', async () => {
		delete process.env.PREFERRED_LOCALE;
		const preferredLocale = getPreferredLocaleFromEnv();

		expect(preferredLocale.locale).toEqual(undefined);
		expect(preferredLocale.genericLocale).toEqual(undefined);
	});

	it('should get preferred locale from env when available', async () => {
		process.env.PREFERRED_LOCALE = 'en';
		const preferredLocale = getPreferredLocaleFromEnv();

		expect(preferredLocale.locale).toEqual('en');
		expect(preferredLocale.genericLocale).toEqual(undefined);
	});

	it('should get locale and genericLocale when ', async () => {
		process.env.PREFERRED_LOCALE = 'en-US';
		const preferredLocale = getPreferredLocaleFromEnv();

		expect(preferredLocale.locale).toEqual('en-US');
		expect(preferredLocale.genericLocale).toEqual('en');
	});
});

describe('getLocalizedStringAsText', () => {
	const localizedInputObject: LocalizedString = {
		'en-US': 'USA',
		'en-GB': 'Great Britain',
		en: 'English',
		de: 'German',
	};

	it('should return first LocalizedString as text when there is no locale or genericLocale', async () => {
		delete process.env.PREFERRED_LOCALE;

		const text = getLocalizedStringAsText(localizedInputObject);

		expect(text).toEqual(localizedInputObject['en-US']);
	});

	it('should return appropiate LocalizedString as text when it matches locale', async () => {
		process.env.PREFERRED_LOCALE = 'en-GB';

		const text = getLocalizedStringAsText(localizedInputObject);

		expect(text).toEqual(localizedInputObject['en-GB']);
	});

	it('should return appropiate LocalizedString as text when it matches genericLocale', async () => {
		process.env.PREFERRED_LOCALE = 'de-DE';

		const text = getLocalizedStringAsText(localizedInputObject);

		expect(text).toEqual(localizedInputObject['de']);
	});
});

describe('getAdditionalLocalizedStringsAsJson', () => {
	const localizedInputObject: LocalizedString = {
		'en-US': 'USA',
		'en-GB': 'Great Britain',
		en: 'English',
		de: 'German',
	};

	it('should return all LocalizedString as mapped json properties', async () => {
		const additionalJson = getAdditionalLocalizedStringsAsJson([
			{
				property: 'test',
				data: localizedInputObject,
			},
		]);

		expect(additionalJson).toEqual({
			'test_en-US': localizedInputObject['en-US'],
			'test_en-GB': localizedInputObject['en-GB'],
			test_en: localizedInputObject['en'],
			test_de: localizedInputObject['de'],
		});
	});
});

describe('getPreferredCurrencyFromEnv', () => {
	it('should return undefined for locale and genericLocale when environment variable is undefined/invalid', async () => {
		delete process.env.PREFERRED_CURRENCY;
		const preferredCurrency = getPreferredCurrencyFromEnv();

		expect(preferredCurrency).toEqual('');
	});

	it('should get preferred locale from env when available', async () => {
		process.env.PREFERRED_CURRENCY = 'EUR';
		const preferredCurrency = getPreferredCurrencyFromEnv();

		expect(preferredCurrency).toEqual('EUR');
	});
});

describe('getAdditionalPricesAsJson', () => {
	const currencyInputObject = [
		{
			value: {
				centAmount: 500,
				currencyCode: 'EUR',
				fractionDigits: 2,
			},
		},
		{
			value: {
				centAmount: 2000,
				currencyCode: 'USD',
				fractionDigits: 2,
			},
			country: 'US',
		},
	] as Price[];

	it('should return all prices as mapped json properties by country', async () => {
		const additionalJson = getAdditionalPricesAsJson([
			{
				property: 'test',
				data: currencyInputObject,
			},
		]);

		expect(additionalJson).toEqual({
			test_AD: 5,
			test_AT: 5,
			test_AX: 5,
			test_BE: 5,
			test_BL: 5,
			test_CP: 5,
			test_CY: 5,
			test_DE: 5,
			test_EA: 5,
			test_EE: 5,
			test_ES: 5,
			test_EU: 5,
			test_EUR: 5,
			test_FI: 5,
			test_FR: 5,
			test_FX: 5,
			test_GF: 5,
			test_GP: 5,
			test_GR: 5,
			test_IC: 5,
			test_IE: 5,
			test_IT: 5,
			test_LT: 5,
			test_LU: 5,
			test_LV: 5,
			test_MC: 5,
			test_ME: 5,
			test_MF: 5,
			test_MQ: 5,
			test_MT: 5,
			test_NL: 5,
			test_PM: 5,
			test_PT: 5,
			test_RE: 5,
			test_SI: 5,
			test_SK: 5,
			test_SM: 5,
			test_TF: 5,
			test_US: 20,
			test_USD: 20,
			test_VA: 5,
			test_XK: 5,
			test_YT: 5,
			test_ZW: 5,
		});
	});
});

describe('getAdditionalPricesAsJson', () => {
	const currencyInputObject = [
		{
			value: {
				centAmount: 500,
				currencyCode: 'EUR',
				fractionDigits: 2,
			},
		},
		{
			value: {
				centAmount: 2000,
				currencyCode: 'USD',
				fractionDigits: 2,
			},
			country: 'US',
		},
	] as Price[];

	it('should return all currencies as mapped json properties by country', async () => {
		const additionalJson = getAdditionalCurrenciesAsJson([
			{
				property: 'test',
				data: currencyInputObject,
			},
		]);

		expect(additionalJson).toEqual({
			test_AD: 'EUR',
			test_AT: 'EUR',
			test_AX: 'EUR',
			test_BE: 'EUR',
			test_BL: 'EUR',
			test_CP: 'EUR',
			test_CY: 'EUR',
			test_DE: 'EUR',
			test_EA: 'EUR',
			test_EE: 'EUR',
			test_ES: 'EUR',
			test_EU: 'EUR',
			test_FI: 'EUR',
			test_FR: 'EUR',
			test_FX: 'EUR',
			test_GF: 'EUR',
			test_GP: 'EUR',
			test_GR: 'EUR',
			test_IC: 'EUR',
			test_IE: 'EUR',
			test_IT: 'EUR',
			test_LT: 'EUR',
			test_LU: 'EUR',
			test_LV: 'EUR',
			test_MC: 'EUR',
			test_ME: 'EUR',
			test_MF: 'EUR',
			test_MQ: 'EUR',
			test_MT: 'EUR',
			test_NL: 'EUR',
			test_PM: 'EUR',
			test_PT: 'EUR',
			test_RE: 'EUR',
			test_SI: 'EUR',
			test_SK: 'EUR',
			test_SM: 'EUR',
			test_TF: 'EUR',
			test_US: 'USD',
			test_VA: 'EUR',
			test_XK: 'EUR',
			test_YT: 'EUR',
			test_ZW: 'EUR',
		});
	});
});

describe('getProductPriceByPriority', () => {
	const currencyInputObject = [
		{
			id: '58cf4f29-f55b-40a2-9360-97a15ee0a609',
			value: {
				type: 'centPrecision',
				currencyCode: 'EUR',
				centAmount: 500,
				fractionDigits: 2,
			},
		},
		{
			id: '6c61ed1b-f2d7-47a6-b536-2cb8f7156019',
			value: {
				type: 'centPrecision',
				currencyCode: 'EUR',
				centAmount: 2000,
				fractionDigits: 2,
			},
			validUntil: '2023-05-11T04:00:00.000Z',
		},
		{
			id: 'fe328c80-9524-4232-a0d6-ab166df13b27',
			value: {
				type: 'centPrecision',
				currencyCode: 'EUR',
				centAmount: 500,
				fractionDigits: 2,
			},
			validFrom: '2023-05-11T04:00:00.000Z',
		},
		{
			id: '35bca0a3-d0f8-4431-8b2f-d4bb2635de73',
			value: {
				type: 'centPrecision',
				currencyCode: 'EUR',
				centAmount: 12200,
				fractionDigits: 2,
			},
			key: 'amst-test-key',
			channel: {
				typeId: 'channel',
				id: '03c22295-79b0-4838-bc4c-9724133a27ce',
			},
		},
	] as Price[];

	it('should return a single price with the highest priority', async () => {
		const price = getProductPriceByPriority(currencyInputObject);

		expect(price).toEqual({
			amount: 5,
			country: undefined,
			currency: 'EUR',
		});
	});
});
