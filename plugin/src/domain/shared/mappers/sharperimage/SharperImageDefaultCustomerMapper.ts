import { DefaultCustomerMapper } from '../DefaultCustomerMapper';
import { SharperImageCustomerMapper } from './SharperImageCustomerMapper';
import { Address } from '@commercetools/platform-sdk';

export class SharperImageDefaultCustomerMapper extends DefaultCustomerMapper implements SharperImageCustomerMapper {
  mapCtAddressToCustomerContact(address?: Address): Profile | null {
    if(!address){
      return null;
    }

    return {
      first_name: address.firstName,
      last_name: address.lastName,
      phone_number: address.phone,
    };
  }
}