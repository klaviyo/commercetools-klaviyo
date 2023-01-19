import nock from 'nock';

export const klaviyoCreateEventNock = (data: any, responseCode = 202) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/api/events/', {
            data,
        })
        .reply(responseCode, '');
};
