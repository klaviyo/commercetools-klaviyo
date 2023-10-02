import { Subscription } from '@commercetools/platform-sdk';
import logger from '../src/utils/log';
import { subscriptions, getSubscriptions, createSubscription, updateSubscription } from './common/commercetools';

const connect_env = process.env.CONNECT_ENV || 'connect_dev';

const run = async () => {
	await configureSubscriptions();
};

const configureSubscriptions = async () => {
	const ctSubscriptions: Subscription[] = await getSubscriptions();

	subscriptions.forEach(async (sub) => {
		const existingSubscription = ctSubscriptions.find((s) => s.key === `connect-${connect_env}-${sub.resource}`);
		try {
			if (existingSubscription) {
				await updateSubscription(`connect-${connect_env}-${sub.resource}`, {
					version: existingSubscription.version,
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
				});
			} else {
				await createSubscription({
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
				});
			}
		} catch (error) {
			logger.error(
				`PostDeploy: Failed to ${existingSubscription ? 'update' : 'create'} connect-${connect_env}-${
					sub.resource
				} subscription: ${error.message}`,
				error,
			);
		}
	});
};

run();
