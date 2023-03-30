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
