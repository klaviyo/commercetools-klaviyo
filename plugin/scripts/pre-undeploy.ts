import { Subscription } from '@commercetools/platform-sdk';
import logger from '../src/utils/log';
import { subscriptions, getSubscriptions, deleteSubscription } from './common/commercetools';

const connect_env = process.env.CONNECT_ENV || 'connect_dev';

const run = async () => {
	await deleteSubscriptions();
};

const deleteSubscriptions = async () => {
	const ctSubscriptions: Subscription[] = await getSubscriptions();

	subscriptions.forEach(async (sub) => {
		const existingSubscription = ctSubscriptions.find((s) => s.key === `connect-${connect_env}-${sub.resource}`);
		if (existingSubscription) {
			try {
				await deleteSubscription(`connect-${connect_env}-${sub.resource}`, existingSubscription.version);
			} catch (error) {
				logger.error(
					`PreUndeploy: Failed to delete connect-${connect_env}-${sub.resource} subscription: ${error.message}`,
					error,
				);
			}
		}
	});
};

run();
