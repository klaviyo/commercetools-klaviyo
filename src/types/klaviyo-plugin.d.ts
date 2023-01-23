type KlaviyoEvent = {
    body: any;
};

type KlaviyoEventProfile = {
    $email?: string;
    $id?: string;
    $first_name?: string;
    $last_name?: string;
    $phone_number?: string;
    [key: string]: unknown;
};
