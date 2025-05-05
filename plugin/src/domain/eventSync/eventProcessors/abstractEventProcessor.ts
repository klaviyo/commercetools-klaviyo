import { DeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { Context } from '../../../types/klaviyo-context';
import config from 'config';
import { KlaviyoEvent } from '../../../types/klaviyo-plugin';

export abstract class AbstractEventProcessor {
    constructor(protected readonly ctMessage: DeliveryPayload, protected readonly context: Context) {}

    abstract isEventValid(): boolean;

    abstract generateKlaviyoEvents(): Promise<KlaviyoEvent[]>;

    static instance<T extends AbstractEventProcessor>(ctMessage: DeliveryPayload, context: Context): T {
        return Reflect.construct(this, [ctMessage, context]) as T;
    }

    isEventDisabled(PROCESSOR_NAME: string): boolean {
        const disabledEvents = config.get<string[]>('disabledEvents') ?? [];
        return disabledEvents.includes(PROCESSOR_NAME);
    }
}
