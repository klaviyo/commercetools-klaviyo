import { Events, Profiles, Catalogs } from 'klaviyo-api';
import { mockDeep } from 'jest-mock-extended';
import { KlaviyoError } from '../../../test/utils/KlaviyoError';
import { StatusError } from '../../../types/errors/StatusError';
import { KlaviyoSdkService } from "./KlaviyoSdkService";

jest.mock('klaviyo-api', () => {
    const module = jest.createMockFromModule<any>('klaviyo-api');
    module.Profiles.createProfile = jest.fn();
    module.Events.createEvent = jest.fn();
    module.Catalogs = {
        spawnCreateItemsJob: jest.fn(),
        spawnCreateVariantsJob: jest.fn(),
        getCreateItemsJob: jest.fn(),
        getCreateVariantsJob: jest.fn(),
    };
    return module;
});

const klaviyoService = new KlaviyoSdkService();


describe('klaviyoService > sendEventToKlaviyo', () => {
    test("should create a profile in klaviyo when the input event is of type 'profileCreated'", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'profileCreated',
            body: {
                data: {
                    type: 'profile',
                    attributes: {},
                },
            },
        };

        await klaviyoService.sendEventToKlaviyo(klaviyoEvent);

        expect(Profiles.createProfile).toBeCalledTimes(1);
        expect(Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
    });

    test("should throw an error when the input event is of type 'profileCreated' but the profile already exists in klaviyo", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'profileCreated',
            body: {
                data: {
                    type: 'profile',
                    attributes: {},
                },
            },
        };
        const responseError: KlaviyoError = new KlaviyoError(409);
        responseError.setResponse({
            error: {
                text: '{"errors":[{"meta":{"duplicate_profile_id":"01GRKR887TDV7JS4JGM003ANYJ"}}]}',
            },
        });
        Profiles.createProfile = jest.fn().mockRejectedValue(responseError);

        await expect(klaviyoService.sendEventToKlaviyo(klaviyoEvent)).rejects.toThrow(KlaviyoError);

        expect(Profiles.createProfile).toBeCalledTimes(1);
        expect(Profiles.updateProfile).toBeCalledTimes(0);
        expect(Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
    });

    test("should throw error when the input event is of type 'profileCreated' but the profile already exists in klaviyo and the error response doesn't contain the ID of the duplicated profile", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'profileCreated',
            body: {
                data: {
                    type: 'profile',
                    attributes: {},
                },
            },
        };
        Profiles.createProfile = jest.fn().mockRejectedValue(new StatusError(409, 'Duplicated profile'));

        await expect(klaviyoService.sendEventToKlaviyo(klaviyoEvent)).rejects.toThrow(StatusError);

        expect(Profiles.createProfile).toBeCalledTimes(1);
        expect(Profiles.updateProfile).toBeCalledTimes(0);
        expect(Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
    });

    test("should create an event in klaviyo when the input event is of type 'event'", async () => {
        const eventTypeMock: EventType = mockDeep<EventType>();

        const klaviyoEvent: KlaviyoEvent = {
            type: 'event',
            body: {
                data: eventTypeMock,
            },
        };

        await klaviyoService.sendEventToKlaviyo(klaviyoEvent);

        expect(Events.createEvent).toBeCalledTimes(1);
        expect(Events.createEvent).toBeCalledWith(klaviyoEvent.body);
    });

    test('should throw error when the input event type is not supported', async () => {
        const klaviyoEvent = { type: 'invalid', body: {} };

        await expect(klaviyoService.sendEventToKlaviyo(klaviyoEvent as KlaviyoEvent)).rejects.toThrow(Error);

        expect(Events.createEvent).toBeCalledTimes(0);
        expect(Profiles.createProfile).toBeCalledTimes(0);
    });
});

describe('klaviyoService > sendJobRequestToKlaviyo', () => {
    test("should create an item job in klaviyo when the input event is of type 'itemCreated'", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'itemCreated',
            body: {
                data: {
                    type: 'catalog-item-bulk-create-job',
                    attributes: {
                        items: [],
                    },
                },
            },
        };
        Catalogs.spawnCreateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                }
            }
        });
        Catalogs.getCreateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                    attributes: {
                        status: 'complete',
                    }
                }
            }
        });

        await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);

        expect(Catalogs.spawnCreateItemsJob).toBeCalledTimes(1);
        expect(Catalogs.spawnCreateItemsJob).toBeCalledWith(klaviyoEvent.body);
        expect(Catalogs.getCreateItemsJob).toBeCalledTimes(1);
        expect(Catalogs.getCreateItemsJob).toBeCalledWith('test-id', {});
    });

    test("should log error when the input event is of type 'itemCreated' and creating throws error", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'itemCreated',
            body: {
                data: {
                    type: 'catalog-item-bulk-create-job',
                    attributes: {
                        items: [],
                    },
                },
            },
        };
        Catalogs.spawnCreateItemsJob = jest.fn().mockImplementationOnce(() => {throw new StatusError(500, 'Unknown error')});

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(Catalogs.spawnCreateItemsJob).toBeCalledTimes(1);
        expect(Catalogs.getCreateItemsJob).toBeCalledTimes(0);
    });

    test("should log error when the input event is of type 'itemCreated' and getting the job throws error", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'itemCreated',
            body: {
                data: {
                    type: 'catalog-item-bulk-create-job',
                    attributes: {
                        items: [],
                    },
                },
            },
        };
        Catalogs.spawnCreateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                }
            }
        });
        Catalogs.getCreateItemsJob = jest.fn().mockImplementationOnce(() => {throw new StatusError(500, 'Unknown error')});

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(Catalogs.spawnCreateItemsJob).toBeCalledTimes(1);
        expect(Catalogs.getCreateItemsJob).toBeCalledTimes(1);
    });

    test("should create an variant job in klaviyo when the input event is of type 'variantCreated'", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'variantCreated',
            body: {
                data: {
                    type: 'catalog-variant-bulk-create-job',
                    attributes: {
                        variants: [],
                    },
                },
            },
        };
        Catalogs.spawnCreateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                }
            }
        });
        Catalogs.getCreateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                    attributes: {
                        status: 'complete',
                    }
                }
            }
        });

        await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);

        expect(Catalogs.spawnCreateVariantsJob).toBeCalledTimes(1);
        expect(Catalogs.spawnCreateVariantsJob).toBeCalledWith(klaviyoEvent.body);
        expect(Catalogs.getCreateVariantsJob).toBeCalledTimes(1);
        expect(Catalogs.getCreateVariantsJob).toBeCalledWith('test-id', {});
    });

    test("should log error when the input event is of type 'variantCreated' and creating throws error", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'variantCreated',
            body: {
                data: {
                    type: 'catalog-variant-bulk-create-job',
                    attributes: {
                        variants: [],
                    },
                },
            },
        };
        Catalogs.spawnCreateVariantsJob = jest.fn().mockImplementationOnce(() => {throw new StatusError(500, 'Unknown error')});

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(Catalogs.spawnCreateVariantsJob).toBeCalledTimes(1);
        expect(Catalogs.getCreateVariantsJob).toBeCalledTimes(0);
    });

    test("should log error when the input event is of type 'variantCreated' and getting the job throws error", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'variantCreated',
            body: {
                data: {
                    type: 'catalog-variant-bulk-create-job',
                    attributes: {
                        variants: [],
                    },
                },
            },
        };
        Catalogs.spawnCreateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                }
            }
        });
        Catalogs.getCreateVariantsJob = jest.fn().mockImplementationOnce(() => {throw new StatusError(500, 'Unknown error')});

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(Catalogs.spawnCreateVariantsJob).toBeCalledTimes(1);
        expect(Catalogs.getCreateVariantsJob).toBeCalledTimes(1);
    });

    test('should throw error when the input event type is not supported', async () => {
        const klaviyoEvent = { type: 'invalid', body: {} };

        await expect(klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent as KlaviyoEvent)).rejects.toThrow(Error);
    });
});
