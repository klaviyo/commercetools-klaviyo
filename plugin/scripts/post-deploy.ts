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
	await configureSubscriptions();
};

const configureSubscriptions = async () => {
	let ctSubscriptions: Subscription[] = (await ctApiRoot.subscriptions().get().execute()).body.results;
	ctSubscriptions = ctSubscriptions.filter((sub) => sub.key.includes(`connect-${connect_env}`));
	const ctSubscriptionKeys = ctSubscriptions.map((sub) => sub.key);

	subscriptions.forEach(async (sub) => {
		const subscriptionExists = ctSubscriptionKeys.includes(`connect-${connect_env}-${sub.resource}`);
		try {
			if (subscriptionExists) {
				await ctApiRoot
					.subscriptions()
					.withKey({ key: `connect-${connect_env}-${sub.resource}` })
					.post({
						body: {
							version: ctSubscriptions.find((s) => s.key === `connect-${connect_env}-${sub.resource}`)
								.version,
							actions: [
								{
									action: 'setMessages',
									messages: [
										{
											resourceTypeId: sub.resource,
											types: sub.types,
										},
									],
								},
								{
									action: 'setChanges',
									changes: sub.changes.map((c) => {
										return {
											resourceTypeId: c,
										};
									}),
								},
								{
									action: 'changeDestination',
									destination: {
										type: 'GoogleCloudPubSub',
										topic: process.env.CONNECT_GCP_TOPIC_NAME,
										projectId: process.env.CONNECT_GCP_PROJECT_ID,
									},
								},
							],
						},
					})
					.execute();
			} else {
				await ctApiRoot
					.subscriptions()
					.post({
						body: {
							key: `connect-${connect_env}-${sub.resource}`,
							destination: {
								type: 'GoogleCloudPubSub',
								topic: process.env.CONNECT_GCP_TOPIC_NAME,
								projectId: process.env.CONNECT_GCP_PROJECT_ID,
							},
							messages: [
								{
									resourceTypeId: sub.resource,
									types: sub.types,
								},
							],
							changes: sub.changes.map((c) => {
								return {
									resourceTypeId: c,
								};
							}),
						},
					})
					.execute();
			}
		} catch (error) {
			logger.error(
				`PostDeploy: Failed to ${subscriptionExists ? 'update' : 'create'} connect-${
					sub.resource
				} subscription: ${error.message}`,
				error,
			);
		}
	});
};

run();
