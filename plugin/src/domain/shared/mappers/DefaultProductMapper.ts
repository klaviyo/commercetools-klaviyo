import {
    Category,
    CategoryReference,
    InventoryEntry,
    Product,
    ProductVariant,
    ProductVariantAvailability,
} from '@commercetools/platform-sdk';
import { ProductMapper } from './ProductMapper';
import { CurrencyService } from '../services/CurrencyService';
import config from 'config';
import {
    getLocalizedStringAsText,
    getAdditionalLocalizedStringsAsJson,
    getPreferredCurrencyFromEnv,
    getProductPriceByPriority,
    getAdditionalPricesAsJson,
    getAdditionalCurrenciesAsJson,
} from '../../../utils/locale-currency-utils';
import {
    ItemDeletedRequest,
    ItemJobRequest,
    ItemRequest,
    ItemVariantJobRequest,
    ItemVariantRequest,
    ItemVariantType,
    KlaviyoRelationshipData,
} from '../../../types/klaviyo-types';
import { GetCatalogVariantResponseCollectionDataInner } from 'klaviyo-api';

export class DefaultProductMapper implements ProductMapper {
    constructor(private readonly currencyService: CurrencyService) {}
    public mapCtProductToKlaviyoItem(product: Product, update = false): ItemRequest {
        const productName = product.masterData.current.name;
        const productDescription = product.masterData.current.description;
        const productSlug = product.masterData.current.slug;
        const defaultProductSlug = getLocalizedStringAsText(productSlug);
        const productUrl = process.env.PRODUCT_URL_TEMPLATE
            ? String(process.env.PRODUCT_URL_TEMPLATE).replace('{{productSlug}}', defaultProductSlug)
            : 'None';
        const productMasterVariantImages = product.masterData.current.masterVariant.images;
        const allProductCategories = product.masterData.current.categories.concat(
            product.masterData.current.categories.map((c) => (c.obj as Category).ancestors).flat(),
        );
        const productPrice = product.masterData.current.masterVariant.prices
            ? getProductPriceByPriority(product.masterData.current.masterVariant.prices, getPreferredCurrencyFromEnv())
            : 0;
        return {
            data: {
                type: 'catalog-item',
                id: update ? `$custom:::$default:::${product.id}` : undefined,
                attributes: {
                    published: true,
                    integrationType: !update ? '$custom' : undefined,
                    catalogType: !update ? '$default' : undefined,
                    externalId: !update ? product.id : undefined,
                    title: getLocalizedStringAsText(productName),
                    description: productDescription ? getLocalizedStringAsText(productDescription) : '',
                    url: productUrl,
                    imageFullUrl: productMasterVariantImages ? productMasterVariantImages[0]?.url : undefined,
                    price: productPrice ? this.currencyService.convert(productPrice.amount, productPrice.currency) : 0,
                    customMetadata: {
                        title_json: JSON.stringify(
                            getAdditionalLocalizedStringsAsJson([
                                {
                                    property: 'title',
                                    data: productName,
                                },
                            ]),
                        ),
                        slug_json: JSON.stringify(
                            getAdditionalLocalizedStringsAsJson([
                                {
                                    property: 'slug',
                                    data: productSlug,
                                },
                            ]),
                        ),
                        price_json: product.masterData.current.masterVariant.prices
                            ? JSON.stringify(
                                  getAdditionalPricesAsJson([
                                      {
                                          property: 'price',
                                          data: product.masterData.current.masterVariant.prices,
                                      },
                                  ]),
                              )
                            : undefined,
                        currency_json: product.masterData.current.masterVariant.prices
                            ? JSON.stringify(
                                  getAdditionalCurrenciesAsJson([
                                      {
                                          property: 'currency',
                                          data: product.masterData.current.masterVariant.prices,
                                      },
                                  ]),
                              )
                            : undefined,
                    },
                },
                relationships: product.masterData.current.categories?.length
                    ? {
                          categories: {
                              data: this.mapCtCategoriesToKlaviyoRelationshipCategories(allProductCategories),
                          },
                      }
                    : undefined,
            },
        } as any;
    }

    public mapCtProductVariantToKlaviyoVariant(
        product: Product,
        productVariant: ProductVariant,
        update = false,
    ): ItemVariantRequest {
        const productName = product.masterData.current.name;
        const productDescription = product.masterData.current.description;
        const productSlug = product.masterData.current.slug;
        const defaultProductSlug = getLocalizedStringAsText(productSlug);
        const productUrl = process.env.PRODUCT_URL_TEMPLATE
            ? String(process.env.PRODUCT_URL_TEMPLATE).replace('{{productSlug}}', defaultProductSlug)
            : 'None';
        const variantImages = productVariant.images;
        const variantPrice = productVariant.prices
            ? getProductPriceByPriority(productVariant.prices, getPreferredCurrencyFromEnv())
            : 0;
        const variantInventoryQuantity = this.getProductInventoryByPriority(productVariant.availability);
        return {
            data: {
                type: 'catalog-variant',
                id: update ? `$custom:::$default:::${productVariant.sku}` : undefined,
                attributes: {
                    published: true,
                    integrationType: !update ? '$custom' : undefined,
                    catalogType: !update ? '$default' : undefined,
                    externalId: !update ? productVariant.sku : undefined,
                    title: getLocalizedStringAsText(productName),
                    description: productDescription ? getLocalizedStringAsText(productDescription) : '',
                    sku: !update ? productVariant.sku : undefined,
                    url: productUrl,
                    imageFullUrl: variantImages?.[0]?.url,
                    inventoryQuantity: variantInventoryQuantity ?? 0,
                    inventoryPolicy: 1,
                    price: variantPrice ? this.currencyService.convert(variantPrice.amount, variantPrice.currency) : 0,
                    customMetadata: {
                        title_json: JSON.stringify(
                            getAdditionalLocalizedStringsAsJson([
                                {
                                    property: 'title',
                                    data: productName,
                                },
                            ]),
                        ),
                        slug_json: JSON.stringify(
                            getAdditionalLocalizedStringsAsJson([
                                {
                                    property: 'slug',
                                    data: productSlug,
                                },
                            ]),
                        ),
                        price_json: productVariant.prices
                            ? JSON.stringify(
                                  getAdditionalPricesAsJson([
                                      {
                                          property: 'price',
                                          data: productVariant.prices,
                                      },
                                  ]),
                              )
                            : undefined,
                        currency_json: productVariant.prices
                            ? JSON.stringify(
                                  getAdditionalCurrenciesAsJson([
                                      {
                                          property: 'currency',
                                          data: productVariant.prices,
                                      },
                                  ]),
                              )
                            : undefined,
                    },
                },
                relationships: !update
                    ? {
                          item: {
                              data: this.mapCtProductToKlaviyoVariantItem(product),
                          },
                      }
                    : undefined,
            },
        };
    }

    public mapCtProductsToKlaviyoItemJob(products: Product[], type: string): ItemJobRequest {
        let jobType: any;
        switch (type) {
            case 'itemCreated':
                jobType = 'catalog-item-bulk-create-job';
                break;
            case 'itemUpdated':
                jobType = 'catalog-item-bulk-update-job';
                break;
        }

        return {
            data: {
                type: jobType,
                attributes: {
                    items: {
                        data: products
                            .filter((p) => p.masterData.current)
                            .map((p) => this.mapCtProductToKlaviyoItem(p, type === 'itemUpdated').data),
                    },
                },
            },
        } as any;
    }

    public mapCtProductVariantsToKlaviyoVariantsJob(
        product: Product,
        productVariants: ProductVariant[] | string[],
        type: string,
    ): ItemVariantJobRequest {
        let jobType: any;
        switch (type) {
            case 'variantCreated':
                jobType = 'catalog-variant-bulk-create-job';
                break;
            case 'variantUpdated':
                jobType = 'catalog-variant-bulk-update-job';
                break;
            case 'variantDeleted':
                jobType = 'catalog-variant-bulk-delete-job';
                break;
        }
        return {
            data: {
                type: jobType,
                attributes: {
                    variants: {
                        data:
                            type === 'variantDeleted'
                                ? productVariants.map(
                                      (v) =>
                                          ({
                                              type: 'catalog-variant',
                                              id: v as string,
                                          } as ItemVariantType),
                                  )
                                : productVariants.map(
                                      (v) =>
                                          this.mapCtProductVariantToKlaviyoVariant(
                                              product,
                                              v as ProductVariant,
                                              type === 'variantUpdated',
                                          ).data,
                                  ),
                    },
                },
            },
        };
    }

    private mapCtCategoriesToKlaviyoRelationshipCategories(categories: CategoryReference[]): KlaviyoRelationshipData[] {
        return Array.from(new Set(categories.map((category) => category.id))).map((category) => ({
            type: 'catalog-category',
            id: `$custom:::$default:::${category}`,
        }));
    }

    private mapCtProductToKlaviyoVariantItem(product: Product): KlaviyoRelationshipData {
        return {
            type: 'catalog-item',
            id: `$custom:::$default:::${product.id}`,
        };
    }

    public getProductInventoryByPriority(availability?: ProductVariantAvailability | InventoryEntry): number | null {
        if (!availability) {
            return 0;
        }

        if (config.has('product.inventory.useChannelInventory')) {
            const productInventoryChannel = config.get('product.inventory.useChannelInventory') as string;
            const variantAvailabilityChannels = (availability as ProductVariantAvailability).channels;
            const inventoryEntryChannel = (availability as InventoryEntry).supplyChannel;
            if (productInventoryChannel && (variantAvailabilityChannels || inventoryEntryChannel)) {
                const variantChannelAvailableQuantity = variantAvailabilityChannels
                    ? variantAvailabilityChannels[productInventoryChannel]?.availableQuantity
                    : undefined;
                const inventoryChannelAvailableQuantity =
                    inventoryEntryChannel?.id === productInventoryChannel ? availability.availableQuantity : undefined;
                if (variantChannelAvailableQuantity) {
                    return variantChannelAvailableQuantity;
                }

                if (inventoryChannelAvailableQuantity) {
                    return inventoryChannelAvailableQuantity;
                } else {
                    if (!variantAvailabilityChannels) {
                        return null;
                    }
                }
            }
            // Prevents bulk sync and inventory update events from stepping on each other
            else if (!productInventoryChannel && inventoryEntryChannel) {
                return null;
            }
        }

        return availability?.availableQuantity || 0;
    }

    public mapKlaviyoItemIdToDeleteItemRequest(klaviyoItemId: string): ItemDeletedRequest {
        return {
            data: {
                id: klaviyoItemId,
            },
        };
    }

    public mapKlaviyoVariantIdToDeleteVariantRequest(klaviyoVariantId: string): ItemDeletedRequest {
        return {
            data: {
                id: klaviyoVariantId,
            },
        };
    }

    public mapCtInventoryEntryToKlaviyoVariant(
        inventory: InventoryEntry,
        klaviyoVariant: GetCatalogVariantResponseCollectionDataInner,
    ): ItemVariantRequest {
        const inventoryEntryQuantity = this.getProductInventoryByPriority(inventory);
        return {
            data: {
                type: 'catalog-variant',
                id: klaviyoVariant.id,
                attributes: {
                    inventoryPolicy: 1,
                    inventoryQuantity: inventoryEntryQuantity !== null ? inventoryEntryQuantity : undefined,
                    published: true,
                },
            },
        };
    }
}
