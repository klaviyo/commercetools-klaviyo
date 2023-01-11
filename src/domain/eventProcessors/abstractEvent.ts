import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';

export abstract class AbstractEvent {
    abstract isEventValid(ctMessage: MessageDeliveryPayload): boolean;

    abstract process(ctMessage: MessageDeliveryPayload): void;
}
