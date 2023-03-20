type KlaviyoEvent = {
    type:
        | 'profileCreated'
        | 'profileUpdated'
        | 'profileResourceUpdated'
        | 'categoryCreated'
        | 'categoryDeleted'
        | 'categoryUpdated'
        | 'event';
    body: KlaviyoRequestType;
};

type KlaviyoRequestType = ProfileRequest | EventRequest | CategoryRequest | CategoryDeletedRequest;

type ProcessingResult = {
    status: 'OK' | '4xx';
};
