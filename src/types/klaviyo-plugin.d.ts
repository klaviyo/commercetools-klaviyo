type KlaviyoEvent = {
    type: 'profileCreated' | 'profileUpdated' | 'profileResourceUpdated' | 'event';
    body: KlaviyoRequestType;
};

type KlaviyoRequestType = ProfileRequest | EventRequest;

type ProcessingResult = {
    status: 'OK' | '4xx';
};
