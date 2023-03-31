import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { CategoryReference, Product, ProductVariant } from '@commercetools/platform-sdk';
import { ProductMapper } from './ProductMapper';
import { CurrencyService } from '../services/CurrencyService';

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
        return {
            data: {
                type: 'catalog-item',
                id: update ? `$custom:::$default:::${product.id}` : undefined,
                attributes: {
                    published: true,
                    integration_type: !update ? '$custom' : undefined,
                    catalog_type: !update ? '$default': undefined,
                    external_id: !update ? product.id : undefined,
                    title: productName[Object.keys(productName || {})[0]],
                    description: productDescription
                        ? productDescription[Object.keys(productDescription || {})[0]]
                        : 'None',
                    url: productUrl,
                    image_full_url: productMasterVariantImages ? productMasterVariantImages[0].url : undefined,
                },
                relationships: product.masterData.current.categories?.length
                    ? {
                          categories: {
                              data: product.masterData.current.categories.map((category) =>
                                  this.mapCtProductCategoryToKlaviyoItemCategory(category),
                              ),
                          },
                      }
                    : undefined,
            },
        };
    }

    public mapCtProductVariantToKlaviyoVariant(product: Product, productVariant: ProductVariant, update = false): ItemVariantRequest {
        const productName = product.masterData.current.name;
        const productDescription = product.masterData.current.description;
        const productSlug = product.masterData.current.slug;
        const defaultProductSlug = productSlug[Object.keys(productSlug)[0]] || '';
        const productUrl = process.env.PRODUCT_URL_TEMPLATE
            ? String(process.env.PRODUCT_URL_TEMPLATE).replace('{{productSlug}}', defaultProductSlug)
            : 'None';
        const variantImages = productVariant.images;
        return {
            data: {
                type: 'catalog-variant',
                id: update ? `$custom:::$default:::${productVariant.sku}` : undefined,
                attributes: {
                    published: true,
                    integration_type: !update ? '$custom': undefined,
                    catalog_type: !update ? '$default' : undefined,
                    external_id: !update ? productVariant.sku : undefined,
                    title: `${productName[Object.keys(productName || {})[0]]} | Variant: ${productVariant.sku}`,
                    description: productDescription
                        ? productDescription[Object.keys(productDescription || {})[0]]
                        : 'None',
                    sku: !update ? productVariant.sku : undefined,
                    url: productUrl,
                    image_full_url: variantImages ? variantImages[0].url : undefined,
                    inventory_quantity: productVariant.availability?.availableQuantity || 0,
                    price: productVariant.prices ? getTypedMoneyAsNumber(productVariant.prices[0].value) : 0,
                },
                relationships: !update ? {
                    items: {
                        data: [this.mapCtProductToKlaviyoVariantItem(product)],
                    },
                } : undefined,
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

    public mapCtProductVariantsToKlaviyoVariantsJob(product: Product, productVariants: ProductVariant[], type: string): ItemVariantJobRequest {
        let jobType: any;
        switch (type) {
            case 'variantCreated':
                jobType = 'catalog-variant-bulk-create-job';
                break;
            case 'variantUpdated':
                jobType = 'catalog-variant-bulk-update-job';
                break;
        }
        return {
            data: {
                type: jobType,
                attributes: {
                    variants: productVariants
                        .map((v) => this.mapCtProductVariantToKlaviyoVariant(product, v, type === 'variantUpdated').data),
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
}
