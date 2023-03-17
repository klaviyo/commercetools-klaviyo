type KlaviyoEvent = {
    type: 'profileCreated' | 'profileUpdated' | 'profileResourceUpdated' | 'categoryCreated' | 'event';
    body: KlaviyoRequestType;
};

type KlaviyoRequestType = ProfileRequest | EventRequest | CategoryRequest;

type ProcessingResult = {
    status: 'OK' | '4xx';
};
