type KlaviyoEvent = {
    type:
        | 'profileCreated'
        | 'profileUpdated'
        | 'profileResourceUpdated'
        | 'categoryCreated'
        | 'categoryDeleted'
        | 'event';
    body: KlaviyoRequestType;
};

type KlaviyoRequestType = ProfileRequest | EventRequest | CategoryRequest | CategoryDeletedRequest;

type ProcessingResult = {
    status: 'OK' | '4xx';
};
