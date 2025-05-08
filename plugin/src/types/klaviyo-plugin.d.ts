import {
    CategoryDeletedRequest,
    CategoryRequest,
    EventRequest,
    ItemDeletedRequest,
    ItemJobRequest,
    ItemRequest,
    ItemVariantJobRequest,
    ItemVariantRequest,
    ProfileRequest,
} from './klaviyo-types';
import { EventCreateQueryV2 } from 'klaviyo-api';

type KlaviyoEvent = {
    type:
        | 'profileCreated'
        | 'profileUpdated'
        | 'profileResourceUpdated'
        | 'categoryCreated'
        | 'categoryDeleted'
        | 'categoryUpdated'
        | 'itemCreated'
        | 'itemUpdated'
        | 'itemDeleted'
        | 'variantCreated'
        | 'variantUpdated'
        | 'variantDeleted'
        | 'event';
    // Several Klaviyo queries
    body: EventCreateQueryV2 | any;
};

type KlaviyoRequestType =
    | ProfileRequest
    | EventRequest
    | CategoryRequest
    | CategoryDeletedRequest
    | ItemRequest
    | ItemVariantRequest
    | ItemJobRequest
    | ItemVariantJobRequest
    | ItemDeletedRequest
    | any;

type ProcessingResult = {
    status: 'OK' | '4xx';
};

type maxSizeJobArrayContainer = {
    [key: string]: KlaviyoEvent[];
};
