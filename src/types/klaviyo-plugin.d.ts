type KlaviyoEvent = {
    type:
        | 'profileCreated'
        | 'profileUpdated'
        | 'profileResourceUpdated'
        | 'categoryCreated'
        | 'categoryDeleted'
        | 'categoryUpdated'
        | 'itemCreated'
        | 'variantCreated'
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
    | ItemVariantJobRequest;

type ProcessingResult = {
    status: 'OK' | '4xx';
};
