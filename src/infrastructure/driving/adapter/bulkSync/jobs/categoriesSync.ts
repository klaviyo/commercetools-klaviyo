import { parentPort } from 'node:worker_threads';
import { CategoriesSync } from '../../../../../domain/bulkSync/CategoriesSync';
import { CTCustomObjectLockService } from '../../../../../domain/bulkSync/services/CTCustomObjectLockService';
import { KlaviyoSdkService } from '../../../../driven/klaviyo/KlaviyoSdkService';
import { getApiRoot } from '../../../../driven/commercetools/ctService';
import { DefaultCategoryMapper } from '../../../../../domain/shared/mappers/DefaultCategoryMapper';
import { DefaultCtCategoryService } from '../../../../driven/commercetools/DefaultCtCategoryService';

let categoriesSync: CategoriesSync;

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
	await categoriesSync?.releaseLockExternally();
}

(async () => {
	categoriesSync = new CategoriesSync(
		new CTCustomObjectLockService(getApiRoot()),
		new DefaultCategoryMapper(),
		new KlaviyoSdkService(),
		new DefaultCtCategoryService(getApiRoot()),
	);

	await categoriesSync.syncAllCategories();

	if (parentPort) parentPort.postMessage('done');
	else process.exit(0);
})();

if (parentPort)
	parentPort.once('message', (message) => {
		if (message === 'cancel') return cancel();
	});
