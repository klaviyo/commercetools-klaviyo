import nock from 'nock';

export const klaviyoCreateItemJobNock = (data: any, responseCode = 202, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/api/catalog-item-bulk-create-jobs/', {
            data,
        })
        .reply(responseCode, responseBody);
};

export const klaviyoCreateVariantJobNock = (data: any, responseCode = 202, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/api/catalog-variant-bulk-create-jobs/', {
            data,
        })
        .reply(responseCode, responseBody);
};

export const klaviyoGetItemJobNock = (jobId: string, responseCode = 200, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .get(`/api/catalog-item-bulk-create-jobs/${jobId}/`)
        .reply(responseCode, responseBody);
};

export const klaviyoGetVariantJobNock = (jobId: string, responseCode = 200, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .get(`/api/catalog-variant-bulk-create-jobs/${jobId}/`)
        .reply(responseCode, responseBody);
};

export const klaviyoGetCatalogueItemsNock = (responseCode = 200, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .get(`/api/catalog-items/?filter=any%28ids%2C%5B%22%24custom%3A%3A%3A%24default%3A%3A%3Acb09966e-cb7a-4c3a-8eb5-e07f1a53ab8b%22%5D%29`)
        .reply(responseCode, responseBody);
};

export const klaviyoGetCatalogueVariantsNock = (responseCode = 200, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .get(`/api/catalog-items/%24custom%3A%3A%3A%24default%3A%3A%3Acb09966e-cb7a-4c3a-8eb5-e07f1a53ab8b/variants/?fields%5Bcatalog-variant%5D=id`)
        .reply(responseCode, responseBody);
};
