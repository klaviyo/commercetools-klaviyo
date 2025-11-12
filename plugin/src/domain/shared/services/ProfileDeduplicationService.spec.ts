import { ProfileDeduplicationService } from './ProfileDeduplicationService';
import { KlaviyoService } from '../../../infrastructure/driven/klaviyo/KlaviyoService';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { GetProfileResponseData } from 'klaviyo-api';
import logger from '../../../utils/log';
import config from 'config';

jest.mock('../../../utils/log');
jest.mock('config');

const mockKlaviyoService: DeepMockProxy<KlaviyoService> = mockDeep<KlaviyoService>();
const deduplicationService = new ProfileDeduplicationService(mockKlaviyoService);

describe('ProfileDeduplicationService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('shouldDeduplicate', () => {
        it('should return true when deduplication is enabled in config', () => {
            (config.has as jest.Mock).mockReturnValue(true);
            (config.get as jest.Mock).mockReturnValue(true);

            const result = deduplicationService.shouldDeduplicate();

            expect(result).toBe(true);
            expect(config.has).toHaveBeenCalledWith('customer.deduplication.enabled');
            expect(config.get).toHaveBeenCalledWith('customer.deduplication.enabled');
        });

        it('should return false when deduplication is disabled in config', () => {
            (config.has as jest.Mock).mockReturnValue(true);
            (config.get as jest.Mock).mockReturnValue(false);

            const result = deduplicationService.shouldDeduplicate();

            expect(result).toBe(false);
        });

        it('should return false when deduplication config does not exist', () => {
            (config.has as jest.Mock).mockReturnValue(false);

            const result = deduplicationService.shouldDeduplicate();

            expect(result).toBe(false);
        });

        it('should return false and log warning when config read fails', () => {
            (config.has as jest.Mock).mockImplementation(() => {
                throw new Error('Config error');
            });

            const result = deduplicationService.shouldDeduplicate();

            expect(result).toBe(false);
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('findExistingProfileByEmail', () => {
        it('should return undefined when email is empty', async () => {
            const result = await deduplicationService.findExistingProfileByEmail('', 'external-id');

            expect(result.existingProfile).toBeUndefined();
            expect(result.needsUpdate).toBe(false);
            expect(result.klaviyoProfileId).toBeUndefined();
            expect(mockKlaviyoService.getKlaviyoProfileByEmail).not.toHaveBeenCalled();
        });

        it('should return undefined when no profile is found', async () => {
            mockKlaviyoService.getKlaviyoProfileByEmail.mockResolvedValue(undefined);

            const result = await deduplicationService.findExistingProfileByEmail('test@example.com', 'external-id');

            expect(result.existingProfile).toBeUndefined();
            expect(result.needsUpdate).toBe(false);
            expect(result.klaviyoProfileId).toBeUndefined();
            expect(mockKlaviyoService.getKlaviyoProfileByEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('should return existing profile when found with matching external_id', async () => {
            const existingProfile: GetProfileResponseData = {
                id: 'klaviyo-profile-id',
                attributes: {
                    email: 'test@example.com',
                    externalId: 'external-id',
                },
            } as GetProfileResponseData;

            mockKlaviyoService.getKlaviyoProfileByEmail.mockResolvedValue(existingProfile);

            const result = await deduplicationService.findExistingProfileByEmail('test@example.com', 'external-id');

            expect(result.existingProfile).toEqual(existingProfile);
            expect(result.needsUpdate).toBe(false);
            expect(result.klaviyoProfileId).toBe('klaviyo-profile-id');
        });

        it('should return existing profile with needsUpdate=true when external_id differs', async () => {
            const existingProfile: GetProfileResponseData = {
                id: 'klaviyo-profile-id',
                attributes: {
                    email: 'test@example.com',
                    externalId: 'old-external-id',
                },
            } as GetProfileResponseData;

            mockKlaviyoService.getKlaviyoProfileByEmail.mockResolvedValue(existingProfile);

            const result = await deduplicationService.findExistingProfileByEmail('test@example.com', 'new-external-id');

            expect(result.existingProfile).toEqual(existingProfile);
            expect(result.needsUpdate).toBe(true);
            expect(result.klaviyoProfileId).toBe('klaviyo-profile-id');
        });

        it('should return existing profile with needsUpdate=true when external_id is missing', async () => {
            const existingProfile: GetProfileResponseData = {
                id: 'klaviyo-profile-id',
                attributes: {
                    email: 'test@example.com',
                    externalId: undefined,
                },
            } as GetProfileResponseData;

            mockKlaviyoService.getKlaviyoProfileByEmail.mockResolvedValue(existingProfile);

            const result = await deduplicationService.findExistingProfileByEmail('test@example.com', 'new-external-id');

            expect(result.existingProfile).toEqual(existingProfile);
            expect(result.needsUpdate).toBe(true);
            expect(result.klaviyoProfileId).toBe('klaviyo-profile-id');
        });

        it('should return existing profile with needsUpdate=false when external_id is not provided', async () => {
            const existingProfile: GetProfileResponseData = {
                id: 'klaviyo-profile-id',
                attributes: {
                    email: 'test@example.com',
                    externalId: 'some-id',
                },
            } as GetProfileResponseData;

            mockKlaviyoService.getKlaviyoProfileByEmail.mockResolvedValue(existingProfile);

            const result = await deduplicationService.findExistingProfileByEmail('test@example.com');

            expect(result.existingProfile).toEqual(existingProfile);
            expect(result.needsUpdate).toBe(false);
            expect(result.klaviyoProfileId).toBe('klaviyo-profile-id');
        });

        it('should handle API errors gracefully and return undefined', async () => {
            mockKlaviyoService.getKlaviyoProfileByEmail.mockRejectedValue(new Error('API Error'));

            const result = await deduplicationService.findExistingProfileByEmail('test@example.com', 'external-id');

            expect(result.existingProfile).toBeUndefined();
            expect(result.needsUpdate).toBe(false);
            expect(result.klaviyoProfileId).toBeUndefined();
            expect(logger.error).toHaveBeenCalled();
        });

        it('should handle null external_id correctly', async () => {
            const existingProfile: GetProfileResponseData = {
                id: 'klaviyo-profile-id',
                attributes: {
                    email: 'test@example.com',
                    externalId: 'existing-id',
                },
            } as GetProfileResponseData;

            mockKlaviyoService.getKlaviyoProfileByEmail.mockResolvedValue(existingProfile);

            const result = await deduplicationService.findExistingProfileByEmail('test@example.com', null as any);

            expect(result.existingProfile).toEqual(existingProfile);
            expect(result.needsUpdate).toBe(false);
        });
    });
});


