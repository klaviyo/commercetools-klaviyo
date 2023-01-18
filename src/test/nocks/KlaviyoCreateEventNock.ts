import nock from 'nock';

export const klaviyoCreateEventNock = (data: any) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/api/events/', {
            data,
        })
        .reply(202, '');
};
