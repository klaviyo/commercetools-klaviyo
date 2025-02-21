import { ProfileType } from "../../types/klaviyo-types";

const sampleKlaviyoProfile = (): ProfileType => {
    return {
        type: 'profile',
        id: '01GRKR887TDV7JS4JGM003ANYJ',
        attributes: {
            email: 'marge@klaviyo.com',
            phone_number: '+12345678901',
            external_id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
            anonymous_id: 'nisi tempor officia',
            first_name: 'Marge',
            last_name: 'Simpson',
            organization: 'klaviyo',
            title: 'Miss',
            image: null,
            created: '2023-02-06T16:16:56+00:00',
            updated: '2023-02-07T10:47:53+00:00',
            last_event_date: '2023-02-07T09:24:37+00:00',
            location: {
                address1: '12, First Street',
                address2: null,
                city: 'Hilpertburgh',
                country: 'US',
                latitude: null,
                longitude: null,
                region: 'aRegion',
                zip: '12345',
                timezone: null,
            },
            properties: {},
        },
        links: {
            self: 'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/',
        },
        relationships: {
            lists: {
                links: {
                    self: 'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/relationships/lists/',
                    related: 'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/lists/',
                },
            },
            segments: {
                links: {
                    self: 'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/relationships/segments/',
                    related: 'https://a.klaviyo.com/api/profiles/01GRKR887TDV7JS4JGM003ANYJ/segments/',
                },
            },
        },
    };
};

export const getSampleKlaviyoProfile = (): ProfileType => {
    return { ...sampleKlaviyoProfile } as ProfileType;
};
