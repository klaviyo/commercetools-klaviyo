import nock from 'nock';

export const klaviyoCreateCategoryNock = (data: any, responseCode = 201, responseBody = {}) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/api/catalog-categories/', {
            data,
        })
        .reply(responseCode, responseBody);
};