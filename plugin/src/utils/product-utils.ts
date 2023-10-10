import { Product, ProductVariant } from '@commercetools/platform-sdk';

export const removeVariantsWithoutPricesOrImages = (products: Product[]): Product[] => {
    let productsForCreationWithPrices: Product[] = [];

    for (let i = 0; i < products.length; i++) {
        let variants: ProductVariant[] = [];
        for (let j = 0; j < products[i].masterData.current.variants.length; j++) {
            if (
                products[i].masterData.current.variants[j].prices?.length &&
                products[i].masterData.current.variants[j].images?.length
            ) {
                variants.push(products[i].masterData.current.variants[j]);
            }
        }
        if (variants.length) {
            productsForCreationWithPrices.push({
                ...products[i],
                masterData: {
                    ...products[i].masterData,
                    current: {
                        ...products[i].masterData.current,
                        variants: variants,
                    },
                },
            });
        }
    }
    return productsForCreationWithPrices;
};
