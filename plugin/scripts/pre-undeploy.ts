import { getApiRoot } from '../src/infrastructure/driven/commercetools/ctService';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { Subscription } from '@commercetools/platform-sdk';
import logger from '../src/utils/log';

const ctApiRoot: ByProjectKeyRequestBuilder = getApiRoot();

const connect_env = process.env.CONNECT_ENV || 'connect_dev';

const subscriptions = [
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

const run = async () => {
	await deleteSubscriptions();
};

const deleteSubscriptions = async () => {
	let ctSubscriptions: Subscription[] = (await ctApiRoot.subscriptions().get().execute()).body.results;
	ctSubscriptions = ctSubscriptions.filter((sub) => sub.key.includes(`connect-${connect_env}`));
	const ctSubscriptionKeys = ctSubscriptions.map((sub) => sub.key);

	subscriptions.forEach(async (sub) => {
		const subscriptionExists = ctSubscriptionKeys.includes(`connect-${connect_env}-${sub.resource}`);
		if (subscriptionExists) {
			try {
				await ctApiRoot
					.subscriptions()
					.withKey({ key: `connect-${connect_env}-${sub.resource}` })
					.delete({
						queryArgs: {
							version: ctSubscriptions.find((s) => s.key === `connect-${connect_env}-${sub.resource}`)
								.version,
						},
					})
					.execute();
			} catch (error) {
				logger.error(
					`PreUndeploy: Failed to delete connect-${sub.resource} subscription: ${error.message}`,
					error,
				);
			}
		}
	});
};

run();
