import nock from 'nock';

export const klaviyoCreateProfileNock = (data: any, responseCode = 201) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/api/profiles/', {
            data,
        })
        .reply(responseCode, '');
};

export const klaviyoUpsertClientProfileNock = (
    data: any,
    company_id = process.env.KLAVIYO_COMPANY_ID,
    responseCode = 202,
) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .post('/client/profiles/', {
            data,
        })
        .query({ company_id })
        .reply(responseCode, '');
};

export const klaviyoGetProfilesNock = (responseStatusCode = 200, noDataInResponse = false) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .get('/api/profiles/')
        .query({ filter: 'equals%28external_id%2C%22e54d8233-be41-4ce0-ae68-5d0674dd8517%22%29' })
        .reply(
            responseStatusCode,
            {
                data: noDataInResponse
                    ? undefined
                    : [
                          {
                              type: 'profile',
                              id: '01GRKR887TDV7JS4JGM003ANYJ',
                              attributes: {
                                  email: 'roberto.smith@klaviyo.com',
                                  phone_number: '+447476588266',
                                  external_id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
                                  anonymous_id: 'nisi tempor officia',
                                  first_name: 'Roberto',
                                  last_name: 'Smith',
                                  organization: 'klaviyo',
                                  title: 'Mr',
                                  image: null,
                                  created: '2023-02-06T16:16:56+00:00',
                                  updated: '2023-02-07T09:34:35+00:00',
                                  last_event_date: '2023-02-07T09:24:37+00:00',
                                  location: {
                                      address1: 'C, Tall Tower, 23, High Road',
                                      address2: 'private access, additional address info',
                                      city: 'London',
                                      country: 'UK',
                                      latitude: null,
                                      longitude: null,
                                      region: 'aRegion',
                                      zip: 'WE1 2DP',
                                      timezone: null,
                                  },
                                  properties: {},
                              },
                              links: { self: 'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/' },
                              relationships: {
                                  lists: {
                                      links: {
                                          self: 'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/relationships/lists/',
                                          related:
                                              'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/lists/',
                                      },
                                  },
                                  segments: {
                                      links: {
                                          self: 'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/relationships/segments/',
                                          related:
                                              'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/segments/',
                                      },
                                  },
                              },
                          },
                      ],
                links: {
                    self: 'https://a.klaviyo.com/api/profiles/?filter=equals%28external_id%2C%22e54d8233-be41-4ce0-ae68-5d0674dd8517%22%29',
                    next: null,
                    prev: null,
                },
            },
            [],
        );
};

export const klaviyoPatchProfileNock = (responseStatus = 200) => {
    return nock('https://a.klaviyo.com:443', { encodedQueryParams: true })
        .patch('/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/', {
            data: {
                type: 'profile',
                id: '01GRKR887TDV7JS4JGM003ANYJ',
                attributes: {
                    email: 'roberto.smith@klaviyo.com',
                    first_name: 'Roberto',
                    last_name: 'Smith',
                    title: 'Mr',
                    phone_number: '+4407476588266',
                    location: {
                        address1: 'C, Tall Tower, 23, High Road',
                        address2: 'private access, additional address info',
                        city: 'London',
                        country: 'UK',
                        region: 'aRegion',
                        zip: 'WE1 2DP',
                    },
                },
            },
        })
        .reply(responseStatus, {}, []);
};
