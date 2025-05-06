import { mockDeep } from 'jest-mock-extended';
import { KlaviyoError } from '../../../test/utils/KlaviyoError';
import { StatusError } from '../../../types/errors/StatusError';

const klvSdkModule = {
    Profiles: {
        createProfile: jest.fn(),
        updateProfile: jest.fn(),
    },
    Events: {
        createEvent: jest.fn(),
    },
    Catalogs: {
        spawnCreateItemsJob: jest.fn(),
        spawnCreateVariantsJob: jest.fn(),
        spawnUpdateItemsJob: jest.fn(),
        spawnUpdateVariantsJob: jest.fn(),
        getCreateItemsJob: jest.fn(),
        getCreateVariantsJob: jest.fn(),
        getUpdateItemsJob: jest.fn(),
        getUpdateVariantsJob: jest.fn(),
        getCatalogItems: jest.fn(),
        getCatalogVariants: jest.fn(),
        getCatalogItemVariants: jest.fn(),
        getCatalogCategories: jest.fn(),
    },
};

import { KlaviyoSdkService } from './KlaviyoSdkService';
import { EventType } from '../../../types/klaviyo-types';
import { KlaviyoEvent } from '../../../types/klaviyo-plugin';
import { EventEnum } from 'klaviyo-api';

jest.mock('klaviyo-api', () => {
    const module = jest.createMockFromModule<any>('klaviyo-api');
    module.Profiles = klvSdkModule.Profiles;
    module.Events = klvSdkModule.Events;
    module.Catalogs = klvSdkModule.Catalogs;
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

        expect(klvSdkModule.Profiles.createProfile).toBeCalledTimes(1);
        expect(klvSdkModule.Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
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
            data: { errors: [{ meta: { duplicate_profile_id: '01GRKR887TDV7JS4JGM003ANYJ' } }] },
        });
        klvSdkModule.Profiles.createProfile = jest.fn().mockRejectedValue(responseError);

        await expect(klaviyoService.sendEventToKlaviyo(klaviyoEvent)).rejects.toThrow(KlaviyoError);

        expect(klvSdkModule.Profiles.createProfile).toBeCalledTimes(1);
        expect(klvSdkModule.Profiles.updateProfile).toBeCalledTimes(0);
        expect(klvSdkModule.Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
    });

    test("should retry without phone number when the input event is of type 'profileCreated' but the phone is invalid", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'profileCreated',
            body: {
                data: {
                    type: 'profile',
                    attributes: {
                        phoneNumber: '1234',
                    },
                },
            },
        };
        const modifiedBody: any = {
            data: {
                ...klaviyoEvent.body.data,
                attributes: {
                    ...(klaviyoEvent.body.data).attributes,
                    phoneNumber: undefined,
                },
            },
        };
        const responseError: KlaviyoError = new KlaviyoError(400);
        responseError.setResponse({
            data: { errors: [{ source: { pointer: '/data/attributes/phone_number' } }] },
        });
        klvSdkModule.Profiles.createProfile.mockRejectedValueOnce(responseError);
        klvSdkModule.Profiles.createProfile.mockResolvedValueOnce({});

        await klaviyoService.sendEventToKlaviyo(klaviyoEvent);

        expect(klvSdkModule.Profiles.createProfile).toBeCalledTimes(2);
        expect(klvSdkModule.Profiles.updateProfile).toBeCalledTimes(0);
        expect(klvSdkModule.Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
        expect(klvSdkModule.Profiles.createProfile).toBeCalledWith(modifiedBody);
    });

    test("should retry without phone number and throw new when the input event is of type 'profileCreated' there are more issues", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'profileCreated',
            body: {
                data: {
                    type: 'profile',
                    attributes: {},
                },
            },
        };
        const responseError: KlaviyoError = new KlaviyoError(400);
        responseError.setResponse({
            data: { errors: [{ source: { pointer: '/data/attributes/phone_number' } }] },
        });
        klvSdkModule.Profiles.createProfile.mockRejectedValueOnce(responseError);
        const responseErrorAlt: KlaviyoError = new KlaviyoError(400);
        responseErrorAlt.setResponse({
            data: { errors: [{ source: { pointer: '/data/attributes/phone_number' } }] },
        });
        klvSdkModule.Profiles.createProfile.mockRejectedValueOnce(responseErrorAlt);

        await expect(klaviyoService.sendEventToKlaviyo(klaviyoEvent)).rejects.toThrow(KlaviyoError);

        expect(klvSdkModule.Profiles.createProfile).toBeCalledTimes(2);
        expect(klvSdkModule.Profiles.updateProfile).toBeCalledTimes(0);
        expect(klvSdkModule.Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
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
        klvSdkModule.Profiles.createProfile = jest.fn().mockRejectedValue(new StatusError(409, 'Duplicated profile'));

        await expect(klaviyoService.sendEventToKlaviyo(klaviyoEvent)).rejects.toThrow(StatusError);

        expect(klvSdkModule.Profiles.createProfile).toBeCalledTimes(1);
        expect(klvSdkModule.Profiles.updateProfile).toBeCalledTimes(0);
        expect(klvSdkModule.Profiles.createProfile).toBeCalledWith(klaviyoEvent.body);
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

        expect(klvSdkModule.Events.createEvent).toBeCalledTimes(1);
        expect(klvSdkModule.Events.createEvent).toBeCalledWith(klaviyoEvent.body);
    });

    test('should throw error when the input event type is not supported', async () => {
        const klaviyoEvent = { type: 'invalid', body: {} };

        await expect(klaviyoService.sendEventToKlaviyo(klaviyoEvent as KlaviyoEvent)).rejects.toThrow(Error);

        expect(klvSdkModule.Events.createEvent).toBeCalledTimes(0);
        expect(klvSdkModule.Profiles.createProfile).toBeCalledTimes(0);
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
        klvSdkModule.Catalogs.spawnCreateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                },
            },
        });
        klvSdkModule.Catalogs.getCreateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                    attributes: {
                        status: 'complete',
                    },
                },
            },
        });

        await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);

        expect(klvSdkModule.Catalogs.spawnCreateItemsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.spawnCreateItemsJob).toBeCalledWith(klaviyoEvent.body);
        expect(klvSdkModule.Catalogs.getCreateItemsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getCreateItemsJob).toBeCalledWith('test-id', {});
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
        klvSdkModule.Catalogs.spawnCreateItemsJob = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(klvSdkModule.Catalogs.spawnCreateItemsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getCreateItemsJob).toBeCalledTimes(0);
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
        klvSdkModule.Catalogs.spawnCreateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                },
            },
        });
        klvSdkModule.Catalogs.getCreateItemsJob = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(klvSdkModule.Catalogs.spawnCreateItemsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getCreateItemsJob).toBeCalledTimes(1);
    });

    test("should create an item job in klaviyo when the input event is of type 'itemUpdated'", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'itemUpdated',
            body: {
                data: {
                    type: 'catalog-item-bulk-update-job',
                    attributes: {
                        items: [],
                    },
                },
            },
        };
        klvSdkModule.Catalogs.spawnUpdateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                },
            },
        });
        klvSdkModule.Catalogs.getUpdateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                    attributes: {
                        status: 'complete',
                    },
                },
            },
        });

        await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);

        expect(klvSdkModule.Catalogs.spawnUpdateItemsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.spawnUpdateItemsJob).toBeCalledWith(klaviyoEvent.body);
        expect(klvSdkModule.Catalogs.getUpdateItemsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getUpdateItemsJob).toBeCalledWith('test-id', {});
    });

    test("should log error when the input event is of type 'itemUpdated' and creating throws error", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'itemUpdated',
            body: {
                data: {
                    type: 'catalog-item-bulk-update-job',
                    attributes: {
                        items: [],
                    },
                },
            },
        };
        klvSdkModule.Catalogs.spawnUpdateItemsJob = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(klvSdkModule.Catalogs.spawnUpdateItemsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getUpdateItemsJob).toBeCalledTimes(0);
    });

    test("should log error when the input event is of type 'itemUpdated' and getting the job throws error", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'itemUpdated',
            body: {
                data: {
                    type: 'catalog-item-bulk-update-job',
                    attributes: {
                        items: [],
                    },
                },
            },
        };
        klvSdkModule.Catalogs.spawnUpdateItemsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                },
            },
        });
        klvSdkModule.Catalogs.getUpdateItemsJob = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(klvSdkModule.Catalogs.spawnUpdateItemsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getUpdateItemsJob).toBeCalledTimes(1);
    });

    test("should create a variant job in klaviyo when the input event is of type 'variantCreated'", async () => {
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
        klvSdkModule.Catalogs.spawnCreateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                },
            },
        });
        klvSdkModule.Catalogs.getCreateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                    attributes: {
                        status: 'complete',
                    },
                },
            },
        });

        await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);

        expect(klvSdkModule.Catalogs.spawnCreateVariantsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.spawnCreateVariantsJob).toBeCalledWith(klaviyoEvent.body);
        expect(klvSdkModule.Catalogs.getCreateVariantsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getCreateVariantsJob).toBeCalledWith('test-id', {});
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
        klvSdkModule.Catalogs.spawnCreateVariantsJob = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(klvSdkModule.Catalogs.spawnCreateVariantsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getCreateVariantsJob).toBeCalledTimes(0);
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
        klvSdkModule.Catalogs.spawnCreateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                },
            },
        });
        klvSdkModule.Catalogs.getCreateVariantsJob = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(klvSdkModule.Catalogs.spawnCreateVariantsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getCreateVariantsJob).toBeCalledTimes(1);
    });

    test("should create a variant job in klaviyo when the input event is of type 'variantUpdated'", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'variantUpdated',
            body: {
                data: {
                    type: 'catalog-variant-bulk-update-job',
                    attributes: {
                        variants: [],
                    },
                },
            },
        };
        klvSdkModule.Catalogs.spawnUpdateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                },
            },
        });
        klvSdkModule.Catalogs.getUpdateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                    attributes: {
                        status: 'complete',
                    },
                },
            },
        });

        await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);

        expect(klvSdkModule.Catalogs.spawnUpdateVariantsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.spawnUpdateVariantsJob).toBeCalledWith(klaviyoEvent.body);
        expect(klvSdkModule.Catalogs.getUpdateVariantsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getUpdateVariantsJob).toBeCalledWith('test-id', {});
    });

    test("should log error when the input event is of type 'variantUpdated' and creating throws error", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'variantUpdated',
            body: {
                data: {
                    type: 'catalog-variant-bulk-update-job' as unknown as EventEnum,
                    attributes: {
                        variants: [],
                    },
                },
            },
        };
        klvSdkModule.Catalogs.spawnUpdateVariantsJob = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(klvSdkModule.Catalogs.spawnUpdateVariantsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getUpdateVariantsJob).toBeCalledTimes(0);
    });

    test("should log error when the input event is of type 'variantUpdated' and getting the job throws error", async () => {
        const klaviyoEvent: KlaviyoEvent = {
            type: 'variantUpdated',
            body: {
                data: {
                    type: 'catalog-variant-bulk-update-job',
                    attributes: {
                        variants: [],
                    },
                },
            },
        };
        klvSdkModule.Catalogs.spawnUpdateVariantsJob = jest.fn().mockResolvedValueOnce({
            body: {
                data: {
                    id: 'test-id',
                },
            },
        });
        klvSdkModule.Catalogs.getUpdateVariantsJob = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
        expect(klvSdkModule.Catalogs.spawnUpdateVariantsJob).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getUpdateVariantsJob).toBeCalledTimes(1);
    });

    test('should throw error when the input event type is not supported', async () => {
        const klaviyoEvent = { type: 'invalid', body: {} };

        await expect(klaviyoService.sendJobRequestToKlaviyo(klaviyoEvent as KlaviyoEvent)).rejects.toThrow(Error);
    });
});

describe('klaviyoService > getKlaviyoItemsByIds', () => {
    test('should return catalogue items from klaviyo when ids are provided', async () => {
        klvSdkModule.Catalogs.getCatalogItems = jest.fn().mockResolvedValueOnce({
            body: {
                data: [
                    {
                        id: 'test-id',
                    },
                ],
            },
        });

        const result = await klaviyoService.getKlaviyoItemsByIds(['test-id']);

        expect(result[0]).toBeDefined();
        expect(result[0].id).toEqual('test-id');
        expect(klvSdkModule.Catalogs.getCatalogItems).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getCatalogItems).toBeCalledWith({
            fieldsCatalogItem: undefined,
            filter: 'any(ids,["$custom:::$default:::test-id"])',
        });
    });

    test('should return empty array when no ids are provided', async () => {
        const result = await klaviyoService.getKlaviyoItemsByIds([]);

        expect(result.length).toEqual(0);
        expect(klvSdkModule.Catalogs.getCatalogItems).toBeCalledTimes(0);
    });

    test('should log error when klaviyo sdk throws error', async () => {
        klvSdkModule.Catalogs.getCatalogItems = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.getKlaviyoItemsByIds(['test-id']);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
    });
});

describe('klaviyoService > getKlaviyoItemVariantsByCtSkus', () => {
    test('should return catalogue variants from klaviyo when skus are provided', async () => {
        klvSdkModule.Catalogs.getCatalogItemVariants = jest.fn().mockResolvedValueOnce({
            body: {
                data: [
                    {
                        id: 'test-id',
                    },
                ],
            },
        });

        const result = await klaviyoService.getKlaviyoItemVariantsByCtSkus('test-id', ['test-id'], undefined);

        expect(result[0]).toBeDefined();
        expect(result[0].id).toEqual('test-id');
        expect(klvSdkModule.Catalogs.getCatalogItemVariants).toBeCalledTimes(1);
        expect(klvSdkModule.Catalogs.getCatalogItemVariants).toBeCalledWith('$custom:::$default:::test-id', {
            fieldsCatalogVariant: undefined,
            filter: 'any(ids,["$custom:::$default:::test-id"])',
        });
    });

    test('should return empty array when no skus are provided', async () => {
        const result = await klaviyoService.getKlaviyoItemVariantsByCtSkus('test-id', [], undefined);

        expect(result.length).toEqual(0);
        expect(klvSdkModule.Catalogs.getCatalogItemVariants).toBeCalledTimes(0);
    });

    test('should log error and return empty array when klaviyo sdk throws 404 error', async () => {
        klvSdkModule.Catalogs.getCatalogItemVariants = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(404, 'Not found');
        });

        let error;
        let result: any;
        try {
            result = await klaviyoService.getKlaviyoItemVariantsByCtSkus('test-id', undefined, undefined);
        } catch (e) {
            error = e;
        }

        expect(result).toBeDefined();
        expect(result?.length).toEqual(0);
        expect(error).toBeUndefined();
    });

    test('should log error when klaviyo sdk throws other errors', async () => {
        klvSdkModule.Catalogs.getCatalogItemVariants = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.getKlaviyoItemVariantsByCtSkus('test-id', undefined, undefined);
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
    });
});

describe('klaviyoService > getKlaviyoPaginatedCategories', () => {
    test('should return categories from klaviyo ', async () => {
        klvSdkModule.Catalogs.getCatalogCategories = jest.fn().mockResolvedValueOnce({
            body: {
                data: [
                    {
                        id: 'test-id',
                    },
                ],
                links: {},
            },
        });

        const result = await klaviyoService.getKlaviyoPaginatedCategories();

        expect(result.data[0]).toBeDefined();
        expect(result.data[0].id).toEqual('test-id');
        expect(klvSdkModule.Catalogs.getCatalogCategories).toBeCalledTimes(1);
    });

    test('should return categories from klaviyo when using a pagination cursor', async () => {
        klvSdkModule.Catalogs.getCatalogCategories = jest.fn().mockResolvedValueOnce({
            body: {
                data: [
                    {
                        id: 'test-id',
                    },
                ],
                links: {},
            },
        });

        const result = await klaviyoService.getKlaviyoPaginatedCategories('page-cursor');

        expect(result.data[0]).toBeDefined();
        expect(result.data[0].id).toEqual('test-id');
        expect(klvSdkModule.Catalogs.getCatalogCategories).toBeCalledTimes(1);
    });

    test('should log error when klaviyo sdk throws error', async () => {
        klvSdkModule.Catalogs.getCatalogCategories = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.getKlaviyoPaginatedCategories();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
    });
});

describe('klaviyoService > getKlaviyoPaginatedItems', () => {
    test('should return items from klaviyo ', async () => {
        klvSdkModule.Catalogs.getCatalogItems = jest.fn().mockResolvedValueOnce({
            body: {
                data: [
                    {
                        id: 'test-id',
                    },
                ],
                links: {},
            },
        });

        const result = await klaviyoService.getKlaviyoPaginatedItems();

        expect(result.data[0]).toBeDefined();
        expect(result.data[0].id).toEqual('test-id');
        expect(klvSdkModule.Catalogs.getCatalogItems).toBeCalledTimes(1);
    });

    test('should return items from klaviyo when using a pagination cursor', async () => {
        klvSdkModule.Catalogs.getCatalogItems = jest.fn().mockResolvedValueOnce({
            body: {
                data: [
                    {
                        id: 'test-id',
                    },
                ],
                links: {},
            },
        });

        const result = await klaviyoService.getKlaviyoPaginatedItems('page-cursor');

        expect(result.data[0]).toBeDefined();
        expect(result.data[0].id).toEqual('test-id');
        expect(klvSdkModule.Catalogs.getCatalogItems).toBeCalledTimes(1);
    });

    test('should log error when klaviyo sdk throws error', async () => {
        klvSdkModule.Catalogs.getCatalogItems = jest.fn().mockImplementationOnce(() => {
            throw new StatusError(500, 'Unknown error');
        });

        let error;
        try {
            await klaviyoService.getKlaviyoPaginatedItems();
        } catch (e) {
            error = e;
        }

        expect(error).toBeInstanceOf(StatusError);
    });
});
