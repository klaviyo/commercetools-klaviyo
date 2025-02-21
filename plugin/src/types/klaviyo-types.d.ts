/* Note: some properties are duplicated as camelCase.
 * This is due to the TypeScript SDK mapping responses and
 * making some properties camelCase, while they're still defined
 * as snake_case in the API.
 */

import { CatalogItemCreateQuery, CatalogItemCreateQueryResourceObject, CatalogItemUpdateQuery } from 'klaviyo-api';
import { KlaviyoEvent } from './klaviyo-plugin';

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
    external_id?: string; // API
    externalId?: string; // SDK
    anonymous_id?: string; // API
    anonymousId?: string; // SDK
    email?: string;
    first_name?: string; // API
    firstName?: string; // SDK
    last_name?: string; // API
    lastName?: string; // SDK
    title?: string;
    phone_number?: string | null; // API
    phoneNumber?: string | null; // SDK
    organization?: string;
    image?: string | null;
    created?: string;
    updated?: string;
    last_event_date?: string; // API
    lastEventDate?: string; // SDK
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
        profile: {
            data: KlaviyoEventProfile;
        };
        metric: {
            data: {
                type: string;
                attributes: {
                    name: string;
                };
            };
        };
        value: number;
        properties: any;
        unique_id?: string; // API
        uniqueId?: string; // SDK
        time: Date;
    };
};

type KlaviyoEventProfile = {
    type: string;
    attributes: {
        email?: string;
        id?: string;
        first_name?: string;
        last_name?: string;
        phone_number?: string;
        external_id?: string; // API
        externalId?: string; // SDK
        [key: string]: unknown;
    };
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
    external_id?: string; // API
    externalId?: string; // SDK
    id?: string;
    name: string;
    integration_type?: string | '$custom'; // API
    integrationType?: string | '$custom'; // SDK
    catalog_type?: string | '$default'; // API
    catalogType?: string | '$default'; // SDK
    updated?: string;
};

type CategoryDeletedRequest = {
    data: {
        id: string;
    };
};

type ItemRequest = {
    data: CatalogItemCreateQuery | CatalogItemUpdateQuery;
    variantJobRequests?: KlaviyoEvent[];
};

type ItemType = {
    type: 'catalog-item';
    id?: string;
    attributes: KlaviyoCatalogItem;
    relationships?: KlaviyoRelationships;
};

type KlaviyoCatalogItem = {
    external_id?: string; // API
    externalId?: string; // SDK
    id?: string;
    integration_type?: string | '$custom'; // API
    integrationType?: string | '$custom'; // SDK
    catalog_type?: string | '$default'; // API
    catalogType?: string | '$default'; // SDK
    title?: string;
    description?: string;
    url?: string;
    image_full_url?: string; // API
    imageFullUrl?: string; // SDK
    published: boolean;
    price?: number;
    custom_metadata?: any; // API
    customMetadata?: any; // SDK
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
    external_id?: string; // API
    externalId?: string; // SDK
    id?: string;
    integration_type?: string | '$custom'; // API
    integrationType?: string | '$custom'; // SDK
    catalog_type?: string | '$default'; // API
    catalogType?: string | '$default'; // SDK
    title?: string;
    description?: string;
    sku?: string;
    inventory_quantity?: number; // API
    inventoryQuantity?: number; // SDK
    inventory_policy?: 0 | 1 | 2; // API
    inventoryPolicy?: 0 | 1 | 2; // SDK
    price?: number;
    url?: string;
    image_full_url?: string; // API
    imageFullUrl?: string; // SDK
    published: boolean;
    custom_metadata?: any; // API
    customMetadata?: any; // SDK
};

type KlaviyoRelationships = {
    [key: string]: {
        data: KlaviyoRelationshipData | KlaviyoRelationshipData[];
    };
};

type KlaviyoRelationshipData = {
    type: 'catalog-item' | 'catalog-variant' | 'catalog-category';
    id: string;
};

type ItemJobRequest = {
    data: ItemJobType;
};

type ItemJobType = {
    type: 'catalog-item-bulk-create-job' | 'catalog-item-bulk-update-job';
    id?: string;
    attributes: {
        items: {
            data: ItemType[];
        };
    };
};

type ItemVariantJobRequest = {
    data: ItemVariantJobType;
};

type ItemVariantJobType = {
    type: 'catalog-variant-bulk-create-job' | 'catalog-variant-bulk-update-job' | 'catalog-variant-bulk-delete-job';
    id?: string;
    attributes: {
        variants: {
            data: ItemVariantType[];
        };
    };
};

type KlaviyoQueryResult<KlaviyoElement> = {
    data: KlaviyoElement[];
    links: {
        self: 'string';
        first: 'string';
        last: 'string';
        prev: 'string';
        next: 'string';
    };
};
