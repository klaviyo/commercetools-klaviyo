import { CTCustomObjectLockService } from './CTCustomObjectLockService';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { ByProjectKeyCustomObjectsRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/custom-objects/by-project-key-custom-objects-request-builder';
import { ByProjectKeyCustomObjectsByContainerByKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/custom-objects/by-project-key-custom-objects-by-container-by-key-request-builder';
import { CustomObject } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/custom-object';
import { ApiRequest } from '@commercetools/platform-sdk/dist/declarations/src/generated/shared/utils/requests-utils';
import { CTErrorResponse } from '../../../test/utils/CTErrorResponse';
import { ClientResponse } from '@commercetools/platform-sdk';

const mockCtApiRoot: DeepMockProxy<ByProjectKeyRequestBuilder> = mockDeep<ByProjectKeyRequestBuilder>();
const customObjectsMock: DeepMockProxy<ByProjectKeyCustomObjectsRequestBuilder> = mockDeep<ByProjectKeyCustomObjectsRequestBuilder>()
mockCtApiRoot.customObjects.mockImplementation(() => customObjectsMock);
const withContainerAndKeyMock: DeepMockProxy<ByProjectKeyCustomObjectsByContainerByKeyRequestBuilder> = mockDeep<ByProjectKeyCustomObjectsByContainerByKeyRequestBuilder>()
customObjectsMock.withContainerAndKey.mockImplementation(() => withContainerAndKeyMock)
const mockGetCustomObjectApiRequest: DeepMockProxy<ApiRequest<CustomObject>> = mockDeep<ApiRequest<CustomObject>>();
const mockDeleteCustomObjectApiRequest: DeepMockProxy<ApiRequest<CustomObject>> = mockDeep<ApiRequest<CustomObject>>();
const mockPostCustomObjectApiRequest: DeepMockProxy<ApiRequest<CustomObject>> = mockDeep<ApiRequest<CustomObject>>();
withContainerAndKeyMock.get.mockImplementation(() => mockGetCustomObjectApiRequest)
withContainerAndKeyMock.delete.mockImplementation(() => mockDeleteCustomObjectApiRequest)
customObjectsMock.post.mockImplementation(() => mockPostCustomObjectApiRequest);


const ctCustomObjectLockService = new CTCustomObjectLockService(mockCtApiRoot);


describe('ctCustomObjectLockService', () => {
  it('should acquire the lock', async () => {
    mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
      throw new CTErrorResponse(404, "not found")
    });

    ctCustomObjectLockService.acquireLock("someKey");

    expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    expect(mockPostCustomObjectApiRequest.execute).toBeCalledTimes(1);
    expect(mockDeleteCustomObjectApiRequest.execute).toBeCalledTimes(0);
  });

  it('should not be able to acquire the lock when is not available', async () => {
    mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce(mock<ClientResponse<CustomObject>>());

    expect(ctCustomObjectLockService.acquireLock("someKey")).rejects.toThrow(Error);

    expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    expect(mockPostCustomObjectApiRequest.execute).toBeCalledTimes(0);
    expect(mockDeleteCustomObjectApiRequest.execute).toBeCalledTimes(0);
  });

  it('should release the lock', async () => {
    mockDeleteCustomObjectApiRequest.execute.mockResolvedValueOnce(mock<ClientResponse<CustomObject>>());

    expect(ctCustomObjectLockService.releaseLock("someKey"));

    expect(mockDeleteCustomObjectApiRequest.execute).toBeCalledTimes(1);
    expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(0);
    expect(mockPostCustomObjectApiRequest.execute).toBeCalledTimes(0);
  });

  it('should throw error when fails to call the CT get custom object API endpoint', async () => {
    mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
      throw new CTErrorResponse(401, "unauthorized")
    });

    expect(ctCustomObjectLockService.acquireLock("someKey")).rejects.toThrow(Error);

    expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    expect(mockPostCustomObjectApiRequest.execute).toBeCalledTimes(0);
    expect(mockDeleteCustomObjectApiRequest.execute).toBeCalledTimes(0);
  });

  it('should throw error when fails to call the CT post custom object API endpoint', async () => {
    mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
      throw new CTErrorResponse(404, "not found")
    });
    mockPostCustomObjectApiRequest.execute.mockImplementation(() => {
      throw new CTErrorResponse(429, "too many requests")
    });

    expect(ctCustomObjectLockService.acquireLock("someKey")).rejects.toThrow(Error);

    expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
    expect(mockPostCustomObjectApiRequest.execute).toBeCalledTimes(1);
    expect(mockDeleteCustomObjectApiRequest.execute).toBeCalledTimes(0);
  });

  it('should throw error when it tries to delete the custom object and it throws error', async () => {
    mockDeleteCustomObjectApiRequest.execute.mockImplementation(() => {
      throw new CTErrorResponse(500, "unknown error")
    });

    expect(ctCustomObjectLockService.releaseLock("someKey")).rejects.toThrow(Error);

    expect(mockDeleteCustomObjectApiRequest.execute).toBeCalledTimes(1);
  });

  it('should check if the lock exists', async () => {
    mockGetCustomObjectApiRequest.execute.mockResolvedValueOnce(mock<ClientResponse<CustomObject>>());

    expect(ctCustomObjectLockService.checkLock("someKey")).rejects.toThrow(Error);

    expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
  });

  it('should throw error when it tries to delete the custom object and it throws error', async () => {
    mockGetCustomObjectApiRequest.execute.mockImplementation(() => {
      throw new CTErrorResponse(500, "unknown error")
    });

    expect(ctCustomObjectLockService.checkLock("someKey")).rejects.toThrow(Error);

    expect(mockGetCustomObjectApiRequest.execute).toBeCalledTimes(1);
  });


});
