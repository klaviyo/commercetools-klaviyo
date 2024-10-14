import { getApiRoot } from '../../src/infrastructure/driven/commercetools/ctService';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { SubscriptionDraft, SubscriptionUpdate } from '@commercetools/platform-sdk';

const ctApiRoot: ByProjectKeyRequestBuilder = getApiRoot();

const connect_env = process.env.CONNECT_ENV || 'connect_dev';

export const subscriptions = [
	{
		resource: 'product',
		types: ['ProductPublished', 'ProductUnpublished'],
		changes: ['product'],
	},
	{
		resource: 'inventory-entry',
		types: [],
		changes: ['inventory-entry'],
	},
	{
		resource: 'category',
		types: ['CategoryCreated'],
		changes: ['category'],
	},
	{
		resource: 'order',
		types: ['OrderCreated', 'OrderStateChanged', 'OrderImported', 'OrderCustomerSet'],
		changes: ['order'],
	},
	{
		resource: 'customer',
		types: ['CustomerCreated'],
		changes: ['customer'],
	},
	{
		resource: 'payment',
		types: ['PaymentTransactionAdded', 'PaymentTransactionStateChanged'],
		changes: ['payment'],
	},
];

export const getSubscriptions = async () => {
	return (
		await ctApiRoot
			.subscriptions()
			.get({
				queryArgs: {
					where: `key = "${subscriptions
						.map((sub) => `connect-${connect_env}-${sub.resource}`)
						.join('" or key = "')}"`,
				},
			})
			.execute()
	).body.results;
};

export const createSubscription = async (body: SubscriptionDraft) => {
	await ctApiRoot
		.subscriptions()
		.post({
			body,
		})
		.execute();
};

export const updateSubscription = async (key: string, body: SubscriptionUpdate) => {
	await ctApiRoot
		.subscriptions()
		.withKey({ key })
		.post({
			body,
		})
		.execute();
};

export const deleteSubscription = async (key: string, version: number) => {
	await ctApiRoot
		.subscriptions()
		.withKey({ key })
		.delete({
			queryArgs: {
				version,
			},
		})
		.execute();
};
