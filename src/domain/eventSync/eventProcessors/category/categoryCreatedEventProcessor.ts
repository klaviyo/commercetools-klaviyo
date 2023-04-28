import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { CategoryCreatedMessage, Category } from '@commercetools/platform-sdk'
import config from 'config';

export class CategoryCreatedEventProcessor extends AbstractEventProcessor {
    isEventValid(): boolean {
        const message = this.ctMessage as unknown as CategoryCreatedMessage;
        return (
            message.resource.typeId === 'category' &&
            this.isValidMessageType(message.type)
        );
    }

    async generateKlaviyoEvents(): Promise<KlaviyoEvent[]> {
        const message = this.ctMessage as unknown as CategoryCreatedMessage;
        logger.info('Processing category created event');

        let category: Category | undefined = undefined;
        if ('category' in message) {
            if (!message.category.ancestors.length) {
                category = message.category;
            }
        }

        if (!category) {
            category = (await this.context.ctCategoryService.getCategoryById((message as CategoryCreatedMessage).resource.id)) as Category;
        }

        const body: CategoryRequest = this.context.categoryMapper.mapCtCategoryToKlaviyoCategory(category);

        const events: KlaviyoEvent[] = [{ body, type: 'categoryCreated' }];

        return Promise.resolve(events);
    }

    private isValidMessageType(type: string): boolean {
        return Boolean(
            config.has('category.messages.created') && (config.get('category.messages.created') as string[])?.includes(type),
        );
    }
}
