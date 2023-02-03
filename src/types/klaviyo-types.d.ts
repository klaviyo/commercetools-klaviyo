type ProfileRequest = {
    data: {
        type: 'profile';
        attributes: Profile;
        meta?: {
            identifiers: {
                external_id: string;
            };
        };
    };
};

type Profile = {
    external_id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    title?: string;
    phone_number?: string;
    organization?: string;
    location?: KlaviyoLocation | null;
};

type KlaviyoLocation = {
    address1?: string | null;
    address2?: string | null;
    city?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    region?: string;
    zip?: string;
    timezone?: string;
};
