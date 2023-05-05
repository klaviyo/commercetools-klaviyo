import { Product, ProductVariant } from '@commercetools/platform-sdk';

export interface ProductMapper {
    mapCtProductToKlaviyoItem(product: Product, update?: boolean): ItemRequest;
    mapCtProductVariantToKlaviyoVariant(
        product: Product,
        variant: ProductVariant,
        update?: boolean,
    ): ItemVariantRequest;
    mapCtProductsToKlaviyoItemJob(products: Product[], type: string): ItemJobRequest;
    mapCtProductVariantsToKlaviyoVariantsJob(
        product: Product,
        productVariants: ProductVariant[] | string[],
        type: string,
    ): ItemVariantJobRequest;
    mapKlaviyoItemIdToDeleteItemRequest(klaviyoItemId: string): ItemDeletedRequest;
}
