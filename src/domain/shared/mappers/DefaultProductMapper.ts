import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { Category, CategoryReference, Price, Product, ProductVariant, ProductVariantAvailability, TypedMoney } from '@commercetools/platform-sdk';
import { ProductMapper } from './ProductMapper';
import { CurrencyService } from '../services/CurrencyService';
import * as _ from 'lodash';
import config from 'config';

export class DefaultProductMapper implements ProductMapper {
    constructor(private readonly currencyService: CurrencyService) {}
    public mapCtProductToKlaviyoItem(product: Product, update = false): ItemRequest {
        const productName = product.masterData.current.name;
        const productDescription = product.masterData.current.description;
        const productSlug = product.masterData.current.slug;
        const defaultProductSlug = productSlug[Object.keys(productSlug)[0]] || '';
        const productUrl = process.env.PRODUCT_URL_TEMPLATE
            ? String(process.env.PRODUCT_URL_TEMPLATE).replace('{{productSlug}}', defaultProductSlug)
            : 'None';
        const productMasterVariantImages = product.masterData.current.masterVariant.images;
        const allProductCategories = product.masterData.current.categories.concat(
            product.masterData.current.categories.map((c) => (c.obj as Category).ancestors).flat(),
        );
        const productPrice = product.masterData.current.masterVariant.prices ? this.getProductPriceByPriority(product.masterData.current.masterVariant.prices) : 0;
        return {
            data: {
                type: 'catalog-item',
                id: update ? `$custom:::$default:::${product.id}` : undefined,
                attributes: {
                    published: true,
                    integration_type: !update ? '$custom' : undefined,
                    catalog_type: !update ? '$default' : undefined,
                    external_id: !update ? product.id : undefined,
                    title: productName[Object.keys(productName || {})[0]],
                    description: productDescription
                        ? productDescription[Object.keys(productDescription || {})[0]]
                        : 'None',
                    url: productUrl,
                    image_full_url: productMasterVariantImages ? productMasterVariantImages[0]?.url : undefined,
                    price: productPrice
                        ? this.currencyService.convert(
                            productPrice.amount,
                            productPrice.currency,
                        )
                        : 0,
                },
                relationships: product.masterData.current.categories?.length
                    ? {
                          categories: {
                              data: allProductCategories.map((category) =>
                                  this.mapCtProductCategoryToKlaviyoItemCategory(category),
                              ),
                          },
                      }
                    : undefined,
            },
        };
    }

    public mapCtProductVariantToKlaviyoVariant(
        product: Product,
        productVariant: ProductVariant,
        update = false,
    ): ItemVariantRequest {
        const productName = product.masterData.current.name;
        const productDescription = product.masterData.current.description;
        const productSlug = product.masterData.current.slug;
        const defaultProductSlug = productSlug[Object.keys(productSlug)[0]] || '';
        const productUrl = process.env.PRODUCT_URL_TEMPLATE
            ? String(process.env.PRODUCT_URL_TEMPLATE).replace('{{productSlug}}', defaultProductSlug)
            : 'None';
        const variantImages = productVariant.images;
        const variantPrice = productVariant.prices ? this.getProductPriceByPriority(productVariant.prices) : 0;
        return {
            data: {
                type: 'catalog-variant',
                id: update ? `$custom:::$default:::${productVariant.sku}` : undefined,
                attributes: {
                    published: true,
                    integration_type: !update ? '$custom' : undefined,
                    catalog_type: !update ? '$default' : undefined,
                    external_id: !update ? productVariant.sku : undefined,
                    title: `${productName[Object.keys(productName || {})[0]]} | Variant: ${productVariant.sku}`,
                    description: productDescription
                        ? productDescription[Object.keys(productDescription || {})[0]]
                        : 'None',
                    sku: !update ? productVariant.sku : undefined,
                    url: productUrl,
                    image_full_url: variantImages ? variantImages[0].url : undefined,
                    inventory_quantity: this.getProductInventoryByPriority(productVariant.availability),
                    inventory_policy: 1,
                    price: variantPrice
                        ? this.currencyService.convert(
                            variantPrice.amount,
                            variantPrice.currency,
                        )
                        : 0,
                },
                relationships: !update
                    ? {
                          items: {
                              data: [this.mapCtProductToKlaviyoVariantItem(product)],
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
                    items: products
                        .filter((p) => p.masterData.current)
                        .map((p) => this.mapCtProductToKlaviyoItem(p, type === 'itemUpdated').data),
                },
            },
        };
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
                    variants:
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
        };
    }

    private mapCtProductCategoryToKlaviyoItemCategory(category: CategoryReference): KlaviyoRelationshipData {
        return {
            type: 'catalog-category',
            id: `$custom:::$default:::${category.id}`,
        };
    }

    private mapCtProductToKlaviyoVariantItem(product: Product): KlaviyoRelationshipData {
        return {
            type: 'catalog-item',
            id: `$custom:::$default:::${product.id}`,
        };
    }

    private getProductPriceByPriority(prices: Price[]): { amount: number, currency: string } {
        const currentDate = new Date().getTime();
        const rangedPrices = prices
            .filter((price) => price.validFrom || price.validUntil)
            .map((price) => {
                return {
                    ...price,
                    validFrom: price.validFrom ? new Date(price.validFrom).getTime() : currentDate,
                    validUntil: price.validUntil ? new Date(price.validUntil).getTime() : 'N/A',
                };
            })
            .filter(
                (price) =>
                    price.validFrom <= currentDate &&
                    (price.validUntil !== 'N/A' ? (price.validUntil as number) >= currentDate : true),
            );
        const sortedRangedPrices = _.orderBy(rangedPrices, ['validFrom', 'validUntil'], ['asc', 'asc']);
        const singleRangedPrice = sortedRangedPrices[0]?.value;
        const regularPrices = prices.filter((price) => !price.validFrom && !price.validUntil && !price.customerGroup);
        const singleRegularPrice = regularPrices[0]?.value;
        const chosenPrice: TypedMoney = singleRangedPrice || singleRegularPrice;

        return {
            amount: getTypedMoneyAsNumber(chosenPrice),
            currency: chosenPrice.currencyCode,
        };
    }

    public getProductInventoryByPriority(availability?: ProductVariantAvailability): number {
        if (!availability) {
            return 0;
        }

        if (config.has('product.inventory.useChannelInventory')) {
            const productInventoryChannel = (config.get('product.inventory.useChannelInventory') as string);
            if (productInventoryChannel && availability.channels) {
                const channelAvailableQuantity = availability.channels[productInventoryChannel]?.availableQuantity;
                if (channelAvailableQuantity) {
                    return channelAvailableQuantity;
                }
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
}
