import { getCustomerProfile, getOrderById, getOrderByPaymentId, getPaymentById } from './ctService';
import { sampleCustomerApiResponse } from '../../../test/testData/ctCustomerApi';
import * as ctPlatformSdk from '@commercetools/platform-sdk';
import { sampleOrderCreatedMessage, sampleOrderWithPaymentMessage } from '../../../test/testData/orderData';
import { samplePaymentCreatedMessage } from "../../../test/testData/ctPaymentMessages";
import { StatusError } from "../../../types/errors/StatusError";

jest.mock('@commercetools/platform-sdk', () => {
    const module = jest.createMockFromModule<any>('@commercetools/platform-sdk');
    module.createApiBuilderFromCtpClient = jest.fn();
    return module;
});

describe('ctService > getCustomerProfile', () => {
    it('should get the customer profile from commercetools by id', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockReturnValueOnce({
            withProjectKey: () => {
                return {
                    customers: () => {
                        return {
                            withId: () => {
                                return {
                                    get: () => {
                                        return {
                                            execute: () => {
                                                return {
                                                    body: sampleCustomerApiResponse,
                                                };
                                            },
                                        };
                                    },
                                };
                            },
                        };
                    },
                };
            },
        } as any);

        const customer = await getCustomerProfile('123456');

        expect(customer).toMatchSnapshot();
    });

    it('should throw error when the CT sdk throws error', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockImplementationOnce(() => {
            throw Error('Unexpected Error');
        });

        await expect(getCustomerProfile('123456')).rejects.toThrow(Error);
    });
});

describe('ctService > getOrderById', () => {
    it('should get the order from commercetools by id', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockReturnValueOnce({
            withProjectKey: () => {
                return {
                    orders: () => {
                        return {
                            withId: () => {
                                return {
                                    get: () => {
                                        return {
                                            execute: () => {
                                                return {
                                                    body: sampleOrderCreatedMessage.order,
                                                };
                                            },
                                        };
                                    },
                                };
                            },
                        };
                    },
                };
            },
        } as any);

        const order = await getOrderById('123456');

        expect(order).toMatchSnapshot();
    });

    it('should return undefined on error', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockImplementationOnce(() => {
            throw Error('Unexpected Error');
        });

        const order = await getOrderById('123456');

        expect(order).toEqual(undefined);
    });
});

describe('ctService > getPaymentById', () => {
    it('should get the payment from commercetools by id', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockReturnValueOnce({
            withProjectKey: () => {
                return {
                    payments: () => {
                        return {
                            withId: () => {
                                return {
                                    get: () => {
                                        return {
                                            execute: () => {
                                                return {
                                                    body: samplePaymentCreatedMessage.payment,
                                                };
                                            },
                                        };
                                    },
                                };
                            },
                        };
                    },
                };
            },
        } as any);

        const order = await getPaymentById('123456');

        expect(order).toMatchSnapshot();
    });

    it('should throw error when the CT sdk throws error', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockImplementationOnce(() => {
            throw Error('Unexpected Error');
        });

        await expect(getPaymentById('123456')).rejects.toThrow(Error);
    });
});

describe('ctService > getOrderByPaymentId', () => {
    it('should get the order from commercetools by payment id', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockReturnValueOnce({
            withProjectKey: () => {
                return {
                    orders: () => {
                        return {
                            get: () => {
                                return {
                                    execute: () => {
                                        return {
                                            body: {
                                                results: [sampleOrderWithPaymentMessage.order],
                                            },
                                        };
                                    },
                                };
                            },
                        };
                    },
                };
            },
        } as any);

        const order = await getOrderByPaymentId('123456');

        expect(order).toMatchSnapshot();
    });

    it('should throw error when the CT sdk returns no results for the payment id', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockReturnValueOnce({
            withProjectKey: () => {
                return {
                    orders: () => {
                        return {
                            get: () => {
                                return {
                                    execute: () => {
                                        return {
                                            body: {
                                                results: [],
                                            },
                                        };
                                    },
                                };
                            },
                        };
                    },
                };
            },
        } as any);

        await expect(getOrderByPaymentId('123456')).rejects.toThrow(StatusError);
    });

    it('should throw error when the CT sdk throws error', async () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockImplementationOnce(() => {
            throw Error('Unexpected Error');
        });

        await expect(getOrderByPaymentId('123456')).rejects.toThrow(Error);
    });
});
