import { AbstractEventProcessor } from '../abstractEventProcessor';
import logger from '../../../../utils/log';
import { CategoryCreatedMessage, Category } from '@commercetools/platform-sdk'
import { DefaultCtCategoryService } from '../../../../infrastructure/driven/commercetools/DefaultCtCategoryService';
import config from 'config';
import { getApiRoot } from '../../../../infrastructure/driven/commercetools/ctService';

export class CategoryCreatedEventProcessor extends AbstractEventProcessor {
    ctCategoryService = new DefaultCtCategoryService(getApiRoot());
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

        let category: Category;
        if ('category' in message) {
            category = message.category;
        } else {
            category = (await this.ctCategoryService.getCategoryById((message as CategoryCreatedMessage).resource.id)) as Category;
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
