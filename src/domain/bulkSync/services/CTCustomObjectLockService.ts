import { LockService } from './LockService';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import logger from '../../../utils/log';
import { ErrorCodes, StatusError } from '../../../types/errors/StatusError';

export class CTCustomObjectLockService implements LockService {
    private readonly container = 'klaviyo-ct-plugin-lock';
    constructor(private readonly ctApiRoot: ByProjectKeyRequestBuilder) {}
    async acquireLock(key: string): Promise<void> {
        logger.info(`Acquiring lock using CT custom object. Container: ${this.container}, key: ${key}`);
        try {
            await this.ctApiRoot
                .customObjects()
                .withContainerAndKey({
                    container: this.container,
                    key,
                })
                .get()
                .execute();
        } catch (e: any) {
            if (e?.statusCode !== 404) {
                logger.error(`Error getting lock status using CT custom object.`, e);
                throw new StatusError(e.statusCode, e.message, e.code);
            }

            try {
                logger.info(`Lock ${this.container} > ${key} not found. Creating lock using CT custom object`);
                await this.ctApiRoot
                  .customObjects()
                  .post({ body: { container: this.container, key: key, value: '1' } })
                  .execute();
                logger.info(`Lock ${this.container} > ${key} set`)
                return;
            } catch (postError: any) {
                logger.error(`Error getting lock status using CT custom object. ${this.container} > ${key}`, postError);
                throw new StatusError(postError.statusCode, postError.message);
            }

        }
        logger.error(`Lock ${this.container} > ${key} already exists`);
        throw new StatusError(
            409,
            `Lock already exists. Container: ${this.container}, key: ${key}`,
            ErrorCodes.LOCKED,
        );
    }

    async releaseLock(key: string): Promise<void> {
        logger.info(`Releasing lock using CT custom object. Container: ${this.container}, key: ${key}`);
        try {
            await this.ctApiRoot
                .customObjects()
                .withContainerAndKey({
                    container: this.container,
                    key,
                })
                .delete()
                .execute();
            logger.info('Lock released.');
        } catch (e: any) {
            if (e.statusCode !== 404) {
                logger.error(`Error releasing lock using CT custom object. ${this.container} > ${key}`, e);
                throw new StatusError(e.statusCode, e.message);
            }
        }
    }

    async checkLock(key: string): Promise<void> {
        logger.info(`Checking lock using CT custom object. Container: ${this.container}, key: ${key}`);
        try {
            await this.ctApiRoot
                .customObjects()
                .withContainerAndKey({
                    container: this.container,
                    key,
                })
                .get()
                .execute();
        } catch (e: any) {
            if (e?.statusCode !== 404) {
                logger.error(`Error getting lock status using CT custom object.`, e);
                throw new StatusError(e.statusCode, e.message, e.code);
            }
            return;
        }
        logger.error(`Lock ${this.container} > ${key} already exists`);
        throw new StatusError(
            409,
            `Lock already exists. Container: ${this.container}, key: ${key}`,
            ErrorCodes.LOCKED,
        );
    }
}
