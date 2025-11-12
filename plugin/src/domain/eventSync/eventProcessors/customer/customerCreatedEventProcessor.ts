import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { Customer, CustomerCreatedMessage } from '@commercetools/platform-sdk';
import { KlaviyoEvent } from '../../../../types/klaviyo-plugin';

export class CustomerCreatedEventProcessor extends AbstractEventProcessor {
    private readonly PROCESSOR_NAME = 'CustomerCreated';

    isEventValid(): boolean {
        const customerCreatedMessage = this.ctMessage as unknown as CustomerCreatedMessage;
        return (
            customerCreatedMessage.resource.typeId === 'customer' &&
            customerCreatedMessage.type === 'CustomerCreated' &&
            !!customerCreatedMessage.customer &&
            !!customerCreatedMessage.customer.email &&
            !this.isEventDisabled(this.PROCESSOR_NAME)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CustomerCreatedMessage;
        logger.info(`processing CT ${message.resource.typeId}${message.type} message`);

        let customer: Customer;
        if ('customer' in message) {
            customer = message.customer;
        } else {
            customer = (await this.context.ctCustomerService.getCustomerProfile(
                (message as CustomerCreatedMessage).resource.id,
            ));
        }

        // Check if deduplication is enabled
        if (this.context.profileDeduplicationService.shouldDeduplicate() && customer.email) {
            // Search for existing profile by email
            const deduplicationResult = await this.context.profileDeduplicationService.findExistingProfileByEmail(
                customer.email,
                customer.id,
            );

            // If found, update existing profile instead of creating new one
            if (deduplicationResult.existingProfile && deduplicationResult.klaviyoProfileId) {
                logger.info(
                    `Found existing profile for email ${customer.email}. Updating profile ID: ${deduplicationResult.klaviyoProfileId}`,
                );

                // Map customer to profile with existing Klaviyo profile ID
                // This includes updating the external_id with the Commercetools customer ID
                const profileBody = this.context.customerMapper.mapCtCustomerToKlaviyoProfile(
                    customer,
                    deduplicationResult.klaviyoProfileId,
                );

                // Use profileResourceUpdated since we're updating an existing profile
                const klaviyoEvent: KlaviyoEvent = {
                    body: profileBody,
                    type: 'profileResourceUpdated',
                };
                return [klaviyoEvent];
            }
        }

        // No existing profile found or deduplication disabled - create new profile
        const klaviyoEvent: KlaviyoEvent = {
            body: this.context.customerMapper.mapCtCustomerToKlaviyoProfile(customer),
            type: 'profileCreated',
        };
        return [klaviyoEvent];
    }
}
