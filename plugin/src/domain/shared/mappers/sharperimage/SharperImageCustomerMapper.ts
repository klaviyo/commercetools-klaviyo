import { Address } from '@commercetools/platform-sdk';
import { DefaultCustomerMapper } from '../DefaultCustomerMapper';

export interface SharperImageCustomerMapper extends DefaultCustomerMapper {
    mapCtAddressToCustomerContact(address?: Address): Profile | null;
}