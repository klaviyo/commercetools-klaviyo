import { KlaviyoService } from '../../../infrastructure/driven/klaviyo/KlaviyoService';
import { GetProfileResponseData } from 'klaviyo-api';
import logger from '../../../utils/log';
import config from 'config';

export interface DeduplicationResult {
    existingProfile: GetProfileResponseData | undefined;
    needsUpdate: boolean;
    klaviyoProfileId: string | undefined;
}

export class ProfileDeduplicationService {
    constructor(private readonly klaviyoService: KlaviyoService) {}

    /**
     * Check if deduplication is enabled in configuration
     */
    public shouldDeduplicate(): boolean {
        try {
            return config.has('customer.deduplication.enabled')
                ? config.get<boolean>('customer.deduplication.enabled')
                : false;
        } catch (e) {
            logger.warn('Error reading deduplication config, defaulting to disabled', e);
            return false;
        }
    }

    /**
     * Find existing profile by email and check if it needs to be updated with external_id
     * @param email - Email address to search for
     * @param externalId - External ID (Commercetools customer ID) that should be set on the profile
     * @returns DeduplicationResult with existing profile info and whether update is needed
     */
    public async findExistingProfileByEmail(
        email: string,
        externalId?: string,
    ): Promise<DeduplicationResult> {
        if (!email) {
            return {
                existingProfile: undefined,
                needsUpdate: false,
                klaviyoProfileId: undefined,
            };
        }

        try {
            const existingProfile = await this.klaviyoService.getKlaviyoProfileByEmail(email);

            if (!existingProfile) {
                return {
                    existingProfile: undefined,
                    needsUpdate: false,
                    klaviyoProfileId: undefined,
                };
            }

            const klaviyoProfileId = existingProfile.id;
            const existingExternalId = existingProfile.attributes?.externalId;

            // Check if profile needs to be updated with external_id
            const needsUpdate =
                externalId !== undefined &&
                externalId !== null &&
                existingExternalId !== externalId;

            if (needsUpdate) {
                logger.info(
                    `Found existing profile for email ${email} but external_id mismatch. Existing: ${existingExternalId}, New: ${externalId}. Profile will be updated.`,
                );
            }

            return {
                existingProfile,
                needsUpdate,
                klaviyoProfileId: klaviyoProfileId ?? undefined,
            };
        } catch (e) {
            logger.error(`Error searching for existing profile by email`, e);
            // On error, return undefined to allow normal flow to continue
            // This prevents deduplication failures from breaking profile creation
            return {
                existingProfile: undefined,
                needsUpdate: false,
                klaviyoProfileId: undefined,
            };
        }
    }
}


