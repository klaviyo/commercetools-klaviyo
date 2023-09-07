import {
	ProductCreatedMessage,
	ProductPublishedMessage,
	ProductUnpublishedMessage,
	ResourceDeletedDeliveryPayload,
	ResourceUpdatedDeliveryPayload,
} from '@commercetools/platform-sdk';

export const sampleProductCreatedMessage: ProductCreatedMessage = {
	id: '38898b94-0070-490d-9c31-22f517a42452',
	version: 1,
	sequenceNumber: 1,
	resource: { typeId: 'product', id: 'cd2cd62b-7f08-44e4-96a8-d3e34c40cac9' },
	resourceVersion: 1,
	resourceUserProvidedIdentifiers: { slug: { en: 'message-trigger-test-11' } },
	type: 'ProductCreated',
	productProjection: {
		id: 'cb09966e-cb7a-4c3a-8eb5-e07f1a53ab8b',
		version: 1,
		createdAt: '2023-02-09T13:00:01.144Z',
		lastModifiedAt: '2023-02-09T13:00:01.144Z',
		productType: {
			typeId: 'product-type',
			id: 'a13e880b-2460-4469-ae07-596a9ddb2d82',
		},
		name: {
			en: 'Bag medium GUM black',
			de: 'Tasche medium GUM schwarz',
		},
		categories: [
			{
				typeId: 'category',
				id: '5b4de911-e0c3-473e-a6ba-dd61d47d0bbd',
			},
		],
		categoryOrderHints: {},
		slug: {
			en: 'gum-bag-medium-BS1900-black',
			de: 'gum-tasche-medium-BS1900-schwarz',
		},
		masterVariant: {
			id: 1,
			sku: 'A0E2000000027DV',
			key: 'A0E2000000027DV',
			prices: [
				{
					id: '15198c6d-4662-44c6-8a82-614f071bdb45',
					value: {
						type: 'centPrecision',
						currencyCode: 'EUR',
						centAmount: 11875,
						fractionDigits: 2,
					},
				},
				{
					id: '304c521b-88ae-4bbc-9ce2-fbaf279b8ffa',
					value: {
						type: 'centPrecision',
						currencyCode: 'USD',
						centAmount: 11875,
						fractionDigits: 2,
					},
					country: 'US',
				},
			],
			images: [
				{
					url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082612_1_medium.jpg',
					dimensions: {
						w: 0,
						h: 0,
					},
				},
			],
			attributes: [
				{
					name: 'size',
					value: 'one size',
				},
				{
					name: 'color',
					value: {
						key: 'black',
						label: {
							en: 'black',
							it: 'nero',
							de: 'schwarz',
						},
					},
				},
			],
			assets: [],
		},
		variants: [],
		searchKeywords: {},
		published: true,
		hasStagedChanges: false,
		key: '82612',
		taxCategory: {
			typeId: 'tax-category',
			id: '8e0e04cc-7097-41cd-b44f-1571f8649d40',
		},
	},
	createdAt: '2023-03-16T15:01:26.922Z',
	lastModifiedAt: '2023-03-16T15:01:26.922Z',
};

export const sampleProductResourceDeletedMessage: ResourceDeletedDeliveryPayload = {
	version: 6,
	projectKey: 'klaviyo-dev',
	resource: {
		typeId: 'product',
		id: 'cb09966e-cb7a-4c3a-8eb5-e07f1a53ab8b',
	},
	modifiedAt: '2023-02-06T16:13:23.528Z',
	notificationType: 'ResourceDeleted',
	resourceUserProvidedIdentifiers: {},
};

export const sampleProductResourceUpdatedMessage: ResourceUpdatedDeliveryPayload = {
	version: 6,
	projectKey: 'klaviyo-dev',
	resource: {
		typeId: 'product',
		id: 'b218c09d-aad7-460b-9da3-d91a4fb8c4b7',
	},
	modifiedAt: '2023-02-06T16:13:23.528Z',
	notificationType: 'ResourceUpdated',
	resourceUserProvidedIdentifiers: {},
	oldVersion: 5,
};

export const sampleProductUnpublishedMessage: ProductUnpublishedMessage = {
	id: '38898b94-0070-490d-9c31-22f517a42452',
	version: 1,
	sequenceNumber: 1,
	resource: {
		typeId: 'product',
		id: 'cb09966e-cb7a-4c3a-8eb5-e07f1a53ab8b',
	},
	resourceVersion: 1,
	type: 'ProductUnpublished',
	resourceUserProvidedIdentifiers: {},
	createdAt: '2023-03-16T15:01:26.922Z',
	lastModifiedAt: '2023-03-16T15:01:26.922Z',
};

export const sampleProductPublishedMessage: ProductPublishedMessage = {
	id: '38898b94-0070-490d-9c31-22f517a42452',
	version: 1,
	sequenceNumber: 1,
	resource: {
		typeId: 'product',
		id: 'd5d463ef-8701-4823-9413-4dd6032cf581',
	},
	removedImageUrls: [],
	scope: 'All',
	productProjection: {
		id: 'd5d463ef-8701-4823-9413-4dd6032cf581',
		version: 50,
		productType: {
			typeId: 'product-type',
			id: '8e65f6af-c86f-448a-bc22-e61c72738793',
		},
		name: {
			en: 'Small AC/DC Relay',
		},
		description: {
			en: 'Ideal for small electronics projects',
		},
		categories: [
			{
				typeId: 'category',
				id: '35b5d524-3dae-41bc-9116-806cdb82f78b',
			},
		],
		categoryOrderHints: {},
		slug: {
			en: 'example-product',
		},
		masterVariant: {
			id: 1,
			sku: 'EXPROD1',
			prices: [
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
			],
			images: [
				{
					url: 'https://af8624530ae38a966e54-c4324683759a12aace9336b874361505.ssl.cf1.rackcdn.com/relay-5meY_-gN.jpg',
					dimensions: {
						w: 225,
						h: 225,
					},
				},
			],
			attributes: [
				{
					name: 'baseId',
					value: 'EXPROD1',
				},
				{
					name: 'color',
					value: {
						key: 'blue',
						label: {
							de: 'blau',
							it: 'blu',
							en: 'blue',
						},
					},
				},
				{
					name: 'seasonNew',
					value: 'new',
				},
			],
			assets: [],
			availability: {
				isOnStock: true,
				availableQuantity: 107,
				channels: {
					'03c22295-79b0-4838-bc4c-9724133a27ce': {
						isOnStock: true,
						availableQuantity: 60,
						version: 6,
						id: 'df743513-c74e-453e-8c4c-e414d77b8d85',
					},
				},
			},
		},
		variants: [],
		searchKeywords: {},
		hasStagedChanges: false,
		published: true,
		priceMode: 'Embedded',
		createdAt: '2023-05-05T00:23:06.770Z',
		lastModifiedAt: '2023-05-12T15:11:36.519Z',
	},
	resourceVersion: 1,
	type: 'ProductPublished',
	resourceUserProvidedIdentifiers: {},
	createdAt: '2023-03-16T15:01:26.922Z',
	lastModifiedAt: '2023-03-16T15:01:26.922Z',
};
