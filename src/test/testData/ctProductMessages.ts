import {
	ProductCreatedMessage, ProductUnpublishedMessage, ResourceDeletedDeliveryPayload,
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
		id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
	},
	resourceVersion: 1,
	type: 'ProductUnpublished',
	resourceUserProvidedIdentifiers: {},
	createdAt: '2023-03-16T15:01:26.922Z',
	lastModifiedAt: '2023-03-16T15:01:26.922Z',
};
