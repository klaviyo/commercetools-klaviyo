import nock from 'nock';

export const klaviyoCreateCategoryNock = (data: any, responseCode = 201, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/api/catalog-categories', {
            data,
        })
        .reply(responseCode, responseBody);
};

export const klaviyoDeleteCategoryNock = (id: string, responseCode = 204) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .delete(`/api/catalog-categories/${id}`, undefined)
        .reply(responseCode);
};

export const klaviyoGetCategoriesNock = (responseStatusCode = 200, noDataInResponse = false) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .get('/api/catalog-categories')
        .query({ filter: 'any%28ids%2C%5B%22%24custom%3A%3A%3A%24default%3A%3A%3Ab218c09d-aad7-460b-9da3-d91a4fb8c4b7%22%5D%29' })
        .reply(
            responseStatusCode,
            {
                data: noDataInResponse
                    ? undefined
                    : [
                          {
                              type: 'catalog-category',
                              id: '$custom:::$default:::b218c09d-aad7-460b-9da3-d91a4fb8c4b7',
                              attributes: {
                                  external_id: 'b218c09d-aad7-460b-9da3-d91a4fb8c4b7',
                                  name: 'MessageTriggerTest1',
                                  integration_type: '$custom',
                                  catalog_type: '$default',
                              },
                          },
                      ],
                links: {
                    self: 'https://a.klaviyo.com/api/catalog-categories/',
                    next: null,
                    prev: null,
                },
            },
            [],
        );
};

export const klaviyoGetAllCategoriesNock = (responseStatusCode = 200, body?: any) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .get('/api/catalog-categories')
        .reply(
            responseStatusCode,
            body || {
                data: [],
                links: {}
            },
            [],
        );
};

export const klaviyoPatchCategoryNock = (responseStatus = 200) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .patch('/api/catalog-categories/%24custom%3A%3A%3A%24default%3A%3A%3Ab218c09d-aad7-460b-9da3-d91a4fb8c4b7', {
            data: {
                type: 'catalog-category',
                id: '$custom:::$default:::b218c09d-aad7-460b-9da3-d91a4fb8c4b7',
                attributes: {
                    name: 'MessageTriggerTest1',
                },
            },
        })
        .reply(responseStatus, {}, []);
};
