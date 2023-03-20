import { DefaultCategoryMapper } from './DefaultCategoryMapper';
import { sampleCategoryCreatedMessage } from '../../../test/testData/ctCategoryMessages';

const categoryMapper = new DefaultCategoryMapper();

describe('map CT category to Klaviyo category', () => {
    it('should map a commercetools category to a klaviyo category', () => {
        const klaviyoEvent = categoryMapper.mapCtCategoryToKlaviyoCategory(sampleCategoryCreatedMessage.category);
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools category to a klaviyo category with an existing profile id', () => {
        const klaviyoEvent = categoryMapper.mapCtCategoryToKlaviyoCategory(
            sampleCategoryCreatedMessage.category,
            '123456',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });
});
