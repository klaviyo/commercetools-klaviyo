import { DefaultProductMapper } from './DefaultProductMapper';
import { ctGet1Product } from '../../../test/testData/ctGetProducts';
import { DummyCurrencyService } from '../services/dummyCurrencyService';
import { mock } from 'jest-mock-extended';
import { Product, ProductVariant } from '@commercetools/platform-sdk';

const mockCurrencyService = mock<DummyCurrencyService>();
mockCurrencyService.convert.mockImplementation((value, currency) => value);
const productMapper = new DefaultProductMapper(mockCurrencyService);

describe('map CT product to Klaviyo product', () => {
    it('should map a commercetools product to a klaviyo item', () => {
        const klaviyoEvent = productMapper.mapCtProductToKlaviyoItem(ctGet1Product.results[0] as Product);
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map commercetools product variants to a klaviyo variants', () => {
        const klaviyoEvent = productMapper.mapCtProductVariantToKlaviyoVariant(
            ctGet1Product.results[0] as Product,
            ctGet1Product.results[0].masterData.current.masterVariant as ProductVariant,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools product array to a klaviyo item job request', () => {
        const klaviyoEvent = productMapper.mapCtProductsToKlaviyoItemJob(ctGet1Product.results as Product[]);
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools product with variants to a klaviyo variant job request', () => {
        const klaviyoEvent = productMapper.mapCtProductVariantsToKlaviyoVariantsJob(ctGet1Product.results[0] as Product);
        expect(klaviyoEvent).toMatchSnapshot();
    });
});
