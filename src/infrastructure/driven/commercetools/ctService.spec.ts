import { getApiRoot } from './ctService';
import * as ctPlatformSdk from '@commercetools/platform-sdk';

jest.mock('@commercetools/platform-sdk', () => {
    const module = jest.createMockFromModule<any>('@commercetools/platform-sdk');
    module.createApiBuilderFromCtpClient = jest.fn();
    return module;
});

describe("ctService > getApiRoot", () => {
    it('should be defined', () => {
        jest.spyOn(ctPlatformSdk, 'createApiBuilderFromCtpClient').mockReturnValueOnce({
            withProjectKey: () => {
                return {};
            },
        } as any);
        
        expect(getApiRoot()).toBeDefined();
    }); 
});
