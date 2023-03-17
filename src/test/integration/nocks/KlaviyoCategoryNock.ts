import nock from 'nock';

export const klaviyoCreateCategoryNock = (data: any, responseCode = 201, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/api/catalog-categories/', {
            data,
        })
        .reply(responseCode, responseBody);
};

export const klaviyoDeleteCategoryNock = (id: string, responseCode = 204) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .delete(`/api/catalog-categories/${id}/`, undefined)
        .reply(responseCode);
};