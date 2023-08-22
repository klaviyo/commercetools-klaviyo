import { InventoryEntryCreatedMessage, ResourceUpdatedDeliveryPayload } from '@commercetools/platform-sdk';

export const sampleInventoryCreatedMessage: InventoryEntryCreatedMessage = {
	id: '38898b94-0070-490d-9c31-22f517a42452',
	version: 1,
	sequenceNumber: 1,
	resource: { typeId: 'inventory-entry', id: 'cd2cd62b-7f08-44e4-96a8-d3e34c40cac9' },
	resourceVersion: 1,
	resourceUserProvidedIdentifiers: { slug: { en: 'message-trigger-test-11' } },
	type: 'InventoryEntryCreated',
	inventoryEntry: {
		id: 'someId',
		version: 1,
		createdAt: '2023-05-09T15:00:47.410Z',
		lastModifiedAt: '2023-05-09T15:00:47.410Z',
		sku: 'A0E200000002E49',
		quantityOnStock: 100,
		availableQuantity: 100,
	},
	createdAt: '2023-03-16T15:01:26.922Z',
	lastModifiedAt: '2023-03-16T15:01:26.922Z',
};

export const sampleInventoryResourceUpdatedMessage: ResourceUpdatedDeliveryPayload = {
	projectKey: 'klaviyo-dev',
	version: 2,
	resourceUserProvidedIdentifiers: {
		sku: 'A0E200000002E49',
	},
	resource: {
		typeId: 'inventory-entry',
		id: '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
	},
	modifiedAt: '2023-04-19T15:55:31.406Z',
	oldVersion: 1,
	notificationType: 'ResourceUpdated',
};
