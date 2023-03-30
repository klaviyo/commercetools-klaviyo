import { getTypedMoneyAsNumber } from '../../../utils/get-typed-money-as-number';
import { CategoryReference, Product, ProductVariant } from '@commercetools/platform-sdk';
import { ProductMapper } from './ProductMapper';
import { CurrencyService } from '../services/CurrencyService';

export class DefaultProductMapper implements ProductMapper {
    constructor(private readonly currencyService: CurrencyService) {}
    public mapCtProductToKlaviyoItem(product: Product): ItemRequest {
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
                attributes: {
                    published: true,
                    integration_type: '$custom',
                    catalog_type: '$default',
                    external_id: product.id,
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

    public mapCtProductVariantToKlaviyoVariant(product: Product, productVariant: ProductVariant): ItemVariantRequest {
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
                attributes: {
                    published: true,
                    integration_type: '$custom',
                    catalog_type: '$default',
                    external_id: productVariant.sku,
                    title: `${productName[Object.keys(productName || {})[0]]} | Variant: ${productVariant.sku}`,
                    description: productDescription
                        ? productDescription[Object.keys(productDescription || {})[0]]
                        : 'None',
                    sku: productVariant.sku,
                    url: productUrl,
                    image_full_url: variantImages ? variantImages[0].url : undefined,
                    inventory_quantity: productVariant.availability?.availableQuantity || 0,
                    price: productVariant.prices ? getTypedMoneyAsNumber(productVariant.prices[0].value) : 0,
                },
                relationships: {
                    items: {
                        data: [this.mapCtProductToKlaviyoVariantItem(product)],
                    },
                },
            },
        };
    }

    public mapCtProductsToKlaviyoItemJob(products: Product[]): ItemJobRequest {
        return {
            data: {
                type: 'catalog-item-bulk-create-job',
                attributes: {
                    items: products
                        .filter((p) => p.masterData.current)
                        .map((p) => this.mapCtProductToKlaviyoItem(p).data),
                },
            },
        };
    }

    public mapCtProductVariantsToKlaviyoVariantsJob(product: Product): ItemVariantJobRequest {
        return {
            data: {
                type: 'catalog-variant-bulk-create-job',
                attributes: {
                    variants: product.masterData.current.variants
                        .filter((v) => v.sku)
                        .map((v) => this.mapCtProductVariantToKlaviyoVariant(product, v).data),
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
