import { Product, ProductVariant } from '@commercetools/platform-sdk';

export interface ProductMapper {
    mapCtProductToKlaviyoItem(product: Product): ItemRequest;
    mapCtProductVariantToKlaviyoVariant(product: Product, variant: ProductVariant): ItemVariantRequest;
    mapCtProductsToKlaviyoItemJob(products: Product[]): ItemJobRequest;
    mapCtProductVariantsToKlaviyoVariantsJob(product: Product): ItemVariantJobRequest;
}
