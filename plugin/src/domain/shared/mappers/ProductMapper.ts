import { InventoryEntry, Product, ProductVariant } from '@commercetools/platform-sdk';
import {
    ItemDeletedRequest,
    ItemJobRequest,
    ItemRequest,
    ItemVariantJobRequest,
    ItemVariantRequest,
} from '../../../types/klaviyo-types';
import { GetCatalogVariantResponseCollectionDataInner } from 'klaviyo-api';

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
    mapKlaviyoVariantIdToDeleteVariantRequest(klaviyoVariantId: string): ItemDeletedRequest;
    mapCtInventoryEntryToKlaviyoVariant(
        inventory: InventoryEntry,
        klaviyoVariant: GetCatalogVariantResponseCollectionDataInner,
    ): ItemVariantRequest;
}
