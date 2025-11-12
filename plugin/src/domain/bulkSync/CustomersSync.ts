import logger from '../../utils/log';
import { LockService } from './services/LockService';
import { PaginatedCustomerResults } from '../../infrastructure/driven/commercetools/DefaultCtCustomerService';
import { CustomerMapper } from '../shared/mappers/CustomerMapper';
import { KlaviyoService } from '../../infrastructure/driven/klaviyo/KlaviyoService';
import { isFulfilled, isRejected } from '../../utils/promise';
import { ErrorCodes } from '../../types/errors/StatusError';
import { Customer } from '@commercetools/platform-sdk';
import { CtCustomerService } from '../../infrastructure/driven/commercetools/CtCustomerService';
import { ProfileRequest } from '../../types/klaviyo-types';
import { delaySeconds } from '../../utils/delay-seconds';
import { ProfileDeduplicationService } from '../shared/services/ProfileDeduplicationService';

export class CustomersSync {
    lockKey = 'customerFullSync';
    constructor(
        private readonly lockService: LockService,
        private readonly customerMapper: CustomerMapper,
        private readonly klaviyoService: KlaviyoService,
        private readonly ctCustomerService: CtCustomerService,
        private readonly profileDeduplicationService?: ProfileDeduplicationService,
    ) {}

    public syncAllCustomers = async () => {
        logger.info('Started sync of all historical customers');
        try {
            //ensures that only one sync at the time is running
            await this.lockService.acquireLock(this.lockKey);

            let ctCustomerResults: PaginatedCustomerResults | undefined;
            let succeeded = 0,
                errored = 0,
                totalCustomers = 0,
                totalKlaviyoProfiles = 0;

            do {
                ctCustomerResults = await this.ctCustomerService.getAllCustomers(ctCustomerResults?.lastId);

                // Generate profile promises for all customers
                const profilePromisesArrays = await Promise.all(
                    ctCustomerResults.data.map((customer) => this.generateCustomerProfiles(customer)),
                );
                const promiseResults = await Promise.allSettled(profilePromisesArrays.flat());

                const rejectedPromises = promiseResults.filter(isRejected);
                const fulfilledPromises = promiseResults.filter(isFulfilled);

                this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises);

                totalCustomers += ctCustomerResults.data.length;
                totalKlaviyoProfiles += promiseResults.length;
                errored += rejectedPromises.length;
                succeeded += fulfilledPromises.length;
                if (rejectedPromises.length) {
                    rejectedPromises.forEach((rejected) =>
                        logger.error('Error syncing profiles with klaviyo', rejected),
                    );
                }
                await delaySeconds(2);
            } while (ctCustomerResults.hasMore);
            logger.info(
                `Historical customers import. Total customers to be imported ${totalCustomers}, total klaviyo profiles: ${totalKlaviyoProfiles}, successfully imported: ${succeeded}, errored: ${errored}`,
            );
            await this.lockService.releaseLock(this.lockKey);
        } catch (e: any) {
            if (e?.code !== ErrorCodes.LOCKED) {
                logger.error('Error while syncing all historical customers', e);
                await this.lockService.releaseLock(this.lockKey);
            } else {
                logger.warn('Already locked');
            }
        }
    };

    public syncCustomersByIdRange = async (customerIds: string[]) => {
        logger.info('Started sync of historical customers by id range');
        try {
            //ensures that only one sync at the time is running
            await this.lockService.acquireLock(this.lockKey);

            let ctCustomerResults: PaginatedCustomerResults | undefined;
            let succeeded = 0,
                errored = 0,
                totalCustomers = 0,
                totalKlaviyoProfiles = 0;

            do {
                ctCustomerResults = await this.ctCustomerService.getCustomersByIdRange(
                    customerIds,
                    ctCustomerResults?.lastId,
                );

                // Generate profile promises for all customers
                const profilePromisesArrays = await Promise.all(
                    ctCustomerResults.data.map((customer) => this.generateCustomerProfiles(customer)),
                );
                const promiseResults = await Promise.allSettled(profilePromisesArrays.flat());

                const rejectedPromises = promiseResults.filter(isRejected);
                const fulfilledPromises = promiseResults.filter(isFulfilled);

                this.klaviyoService.logRateLimitHeaders(fulfilledPromises, rejectedPromises);

                totalCustomers += ctCustomerResults.data.length;
                totalKlaviyoProfiles += promiseResults.length;
                errored += rejectedPromises.length;
                succeeded += fulfilledPromises.length;
                if (rejectedPromises.length) {
                    rejectedPromises.forEach((rejected) =>
                        logger.error('Error syncing profiles with klaviyo', rejected),
                    );
                }
            } while (ctCustomerResults.hasMore);
            logger.info(
                `Historical customers import by id range. Total customers to be imported ${totalCustomers}, total klaviyo profiles: ${totalKlaviyoProfiles}, successfully imported: ${succeeded}, errored: ${errored}`,
            );
            await this.lockService.releaseLock(this.lockKey);
        } catch (e: any) {
            if (e?.code !== ErrorCodes.LOCKED) {
                logger.error('Error while syncing historical customers by id range', e);
                await this.lockService.releaseLock(this.lockKey);
            } else {
                logger.warn('Already locked');
            }
        }
    };

    private generateCustomerProfiles = async (customer: Customer): Promise<Promise<any>[]> => {
        // Step 1: Check if deduplication is enabled
        if (this.profileDeduplicationService?.shouldDeduplicate() && customer.email) {
            // Step 2: Search for existing profile by email FIRST
            const deduplicationResult = await this.profileDeduplicationService.findExistingProfileByEmail(
                customer.email,
                customer.id,
            );

            // Step 3: If found, update existing profile instead of creating new one
            if (deduplicationResult.existingProfile && deduplicationResult.klaviyoProfileId) {
                logger.debug(
                    `Bulk sync: Found existing profile for email ${customer.email}. Using profile ID: ${deduplicationResult.klaviyoProfileId}`,
                );

                // Map customer to profile with existing Klaviyo profile ID
                const profileBody = this.customerMapper.mapCtCustomerToKlaviyoProfile(
                    customer,
                    deduplicationResult.klaviyoProfileId,
                );

                // Step 4: Always use profileResourceUpdated since we're updating an existing profile
                return [
                    this.klaviyoService.sendEventToKlaviyo({
                        type: 'profileResourceUpdated',
                        body: profileBody,
                    }),
                ];
            }
        }

        // No existing profile found or deduplication disabled - create new profile
        const events: ProfileRequest[] = [];
        events.push(this.customerMapper.mapCtCustomerToKlaviyoProfile(customer));

        const klaviyoProfilePromises: Promise<any>[] = [];
        events.forEach((e) =>
            klaviyoProfilePromises.push(this.klaviyoService.sendEventToKlaviyo({ type: 'profileCreated', body: e })),
        );
        return klaviyoProfilePromises;
    };

    public async releaseLockExternally(): Promise<void> {
        await this.lockService.releaseLock(this.lockKey);
    }
}
