import { AbstractEvent } from './abstractEvent.js';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ConfigWrapper, Profiles } from 'klaviyo-api';
ConfigWrapper(process.env.KLAVIYO_AUTH_KEY);

export class CustomerCreatedEvent extends AbstractEvent {
    isEventValid(ctMessage: MessageDeliveryPayload): boolean {
        return ctMessage.resource.typeId === 'customer'; // && ctMessage.notificationType === 'ResourceCreated';
    }

    async process(ctMessage: MessageDeliveryPayload): Promise<void> {
        try {
            //test call to klaviyo API
            console.time('klaviyocall');
            const response = await Profiles.getProfiles();
            console.timeEnd('klaviyocall');
            console.log(JSON.stringify(response));
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            console.log(`An error was thrown check the HTTP code with ${error.status}`);
        }
        // return 0;
    }
}
