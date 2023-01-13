import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';

export abstract class AbstractEvent {
    constructor(protected readonly ctMessage: MessageDeliveryPayload) {}
    abstract isEventValid(): boolean;

    abstract generateKlaviyoEvent(): KlaviyoEvent;

    static instance<T extends AbstractEvent>(ctMessage: MessageDeliveryPayload): T {
        return Reflect.construct(this, [ctMessage]) as T;
    }
}
