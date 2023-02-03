type KlaviyoEvent = {
    type: 'profileCreated' | 'profileUpdated' | 'event';
    body?: any;
};

type KlaviyoEventProfile = {
    $email?: string;
    $id?: string;
    $first_name?: string;
    $last_name?: string;
    $phone_number?: string;
    [key: string]: unknown;
};

type ProcessingResult = {
    status: 'OK' | '4xx';
};
