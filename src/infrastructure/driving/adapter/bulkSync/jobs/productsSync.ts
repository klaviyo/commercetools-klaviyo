import { parentPort } from 'node:worker_threads';
import { ProductsSync } from '../../../../../domain/bulkSync/ProductsSync';
import { CTCustomObjectLockService } from '../../../../../domain/bulkSync/services/CTCustomObjectLockService';
import { KlaviyoSdkService } from '../../../../driven/klaviyo/KlaviyoSdkService';
import { getApiRoot } from '../../../../driven/commercetools/ctService';
import { DefaultProductMapper } from '../../../../../domain/shared/mappers/DefaultProductMapper';
import { DefaultCtProductService } from '../../../../driven/commercetools/DefaultCtProductService';
import { DummyCurrencyService } from '../../../../../domain/shared/services/dummyCurrencyService';

let productsSync: ProductsSync;

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
	await productsSync?.releaseLockExternally();
}

(async () => {
	productsSync = new ProductsSync(
		new CTCustomObjectLockService(getApiRoot()),
		new DefaultProductMapper(new DummyCurrencyService()),
		new KlaviyoSdkService(),
		new DefaultCtProductService(getApiRoot()),
	);

	await productsSync.syncAllProducts();

	if (parentPort) parentPort.postMessage('done');
	else process.exit(0);
})();

if (parentPort)
	parentPort.once('message', (message) => {
		if (message === 'cancel') return cancel();
	});
