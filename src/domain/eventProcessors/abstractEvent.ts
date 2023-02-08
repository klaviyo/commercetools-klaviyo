import { DeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';

export abstract class AbstractEvent {
    constructor(protected readonly ctMessage: DeliveryPayload) {}

    abstract isEventValid(): boolean;

    abstract generateKlaviyoEvents(): Promise<KlaviyoEvent[]>;

    static instance<T extends AbstractEvent>(ctMessage: DeliveryPayload): T {
        return Reflect.construct(this, [ctMessage]) as T;
    }
}
