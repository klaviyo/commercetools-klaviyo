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
    body: KlaviyoRequestType;
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
    | ItemDeletedRequest;

type ProcessingResult = {
    status: 'OK' | '4xx';
};

type maxSizeJobArrayContainer = {
    [key: string]: KlaviyoEvent[];
};
