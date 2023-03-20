type ProfileRequest = {
    data: ProfileType;
};

type ProfileType = {
    type: 'profile';
    id?: string;
    attributes: Profile;
    links?: any;
    relationships?: any;
    meta?: {
        identifiers: {
            external_id: string;
        };
    };
};

type Profile = {
    external_id?: string;
    anonymous_id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    title?: string;
    phone_number?: string | null;
    organization?: string;
    image?: string | null;
    created?: string;
    updated?: string;
    last_event_date?: string;
    location?: KlaviyoLocation | null;
    properties?: any;
};

type KlaviyoLocation = {
    address1?: string | null;
    address2?: string | null;
    city?: string;
    country?: string;
    latitude?: string | null;
    longitude?: string | null;
    region?: string;
    zip?: string;
    timezone?: string | null;
};

type EventRequest = {
    data: EventType;
};

type EventType = {
    type: 'event';
    id?: string;
    attributes: {
        profile: KlaviyoEventProfile;
        metric: {
            name: string;
        };
        value: number;
        properties: any;
        unique_id: string;
        time: string;
    };
};

type KlaviyoEventProfile = {
    $email?: string;
    $id?: string;
    $first_name?: string;
    $last_name?: string;
    $phone_number?: string;
    [key: string]: unknown;
};

type CategoryRequest = {
    data: CategoryType;
};

type CategoryType = {
    type: 'catalog-category';
    id?: string;
    attributes: KlaviyoCategory;
    relationships?: any;
};

type KlaviyoCategory = {
    external_id?: string;
    name: string;
    integration_type?: string | '$custom';
    catalog_type?: string | '$default';
    updated?: string;
};

type CategoryDeletedRequest = {
    data: {
        id: string;
    };
};
