import { parentPort } from 'node:worker_threads';
import { CustomersSync } from '../../../../../domain/bulkSync/CustomersSync';
import { CTCustomObjectLockService } from '../../../../../domain/bulkSync/services/CTCustomObjectLockService';
import { DefaultCustomerMapper } from '../../../../../domain/shared/mappers/DefaultCustomerMapper';
import { KlaviyoSdkService } from '../../../../driven/klaviyo/KlaviyoSdkService';
import { DefaultCtCustomerService } from '../../../../driven/commercetools/DefaultCtCustomerService';
import { getApiRoot } from '../../../../driven/commercetools/ctService';

let customersSync: CustomersSync;

const cancel = async () => {
	if (parentPort) {
		await releaseLock();
		parentPort.postMessage('cancelled');
	}
	else {
		await releaseLock();
		process.exit(0);
	}
};

const releaseLock = async () => {
	await customersSync?.releaseLockExternally();
}

(async () => {
	customersSync = new CustomersSync(
		new CTCustomObjectLockService(getApiRoot()),
		new DefaultCustomerMapper(),
		new KlaviyoSdkService(),
		new DefaultCtCustomerService(getApiRoot()),
	);

	await customersSync.syncAllCustomers();
	process.exit(0);
})();

if (parentPort)
	parentPort.once('message', (message) => {
		if (message === 'cancel') return cancel();
	});
