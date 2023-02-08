type KlaviyoEvent = {
    type: 'profileCreated' | 'profileUpdated' | 'profileResourceUpdated' | 'event';
    body: ProfileRequest | EventRequest;
};

type ProcessingResult = {
    status: 'OK' | '4xx';
};
