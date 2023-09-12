import { getApiRoot } from '../src/infrastructure/driven/commercetools/ctService';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { Subscription } from '@commercetools/platform-sdk';
import logger from '../src/utils/log';

const ctApiRoot: ByProjectKeyRequestBuilder = getApiRoot();

const connect_env = process.env.CONNECT_ENV || 'connect_dev';

const run = async () => {
	await deleteSubscriptions();
};

const deleteSubscriptions = async () => {
	let ctSubscriptions: Subscription[] = (await ctApiRoot.subscriptions().get().execute()).body.results;
	ctSubscriptions = ctSubscriptions.filter((sub) => sub.key.includes(`connect-${connect_env}`));

	ctSubscriptions.forEach(async (sub) => {
		try {
			await ctApiRoot
				.subscriptions()
				.withKey({ key: sub.key })
				.delete({
					queryArgs: {
						version: sub.version,
					},
				})
				.execute();
		} catch (error) {
			logger.error(`PreUndeploy: Failed to delete connect-${sub.resource} subscription: ${error.message}`, error);
		}
	});
};

run();
