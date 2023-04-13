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
    relationships?: KlaviyoRelationships;
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

type ItemRequest = {
    data: ItemType;
};

type ItemType = {
    type: 'catalog-item';
    id?: string;
    attributes: KlaviyoCatalogItem;
    relationships?: KlaviyoRelationships;
};

type KlaviyoCatalogItem = {
    external_id?: string;
    integration_type?: string | '$custom';
    catalog_type?: string | '$default';
    title?: string;
    description?: string;
    url?: string;
    image_full_url?: string;
    published: boolean;
};

type ItemVariantRequest = {
    data: ItemVariantType;
};

type ItemVariantType = {
    type: 'catalog-variant';
    id?: string;
    attributes: KlaviyoCatalogVariant;
    relationships?: KlaviyoRelationships;
};

type ItemDeletedRequest = {
    data: {
        id: string;
        deleteVariantsJob?: KlaviyoEvent;
    };
};

type KlaviyoCatalogVariant = {
    external_id?: string;
    integration_type?: string | '$custom';
    catalog_type?: string | '$default';
    title?: string;
    description?: string;
    sku?: string;
    inventory_quantity?: number;
    price?: number;
    url?: string;
    image_full_url?: string;
    published: boolean;
};

type KlaviyoRelationships = {
    [key: string]: {
        data: KlaviyoRelationshipData[]
    }
}

type KlaviyoRelationshipData = {
    type: 'catalog-item' | 'catalog-variant' | 'catalog-category';
    id: string;
}

type ItemJobRequest = {
    data: ItemJobType;
};

type ItemJobType = {
    type: 'catalog-item-bulk-create-job' | 'catalog-item-bulk-update-job';
    id?: string,
    attributes: {
        items: ItemType[];
    };
};

type ItemVariantJobRequest = {
    data: ItemVariantJobType;
};

type ItemVariantJobType = {
    type: 'catalog-variant-bulk-create-job' | 'catalog-variant-bulk-update-job' | 'catalog-variant-bulk-delete-job';
    id?: string,
    attributes: {
        variants: ItemVariantType[];
    };
};
