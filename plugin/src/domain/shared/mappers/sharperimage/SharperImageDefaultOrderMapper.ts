import { Order, Product, LineItem } from '@commercetools/platform-sdk';
import { CurrencyService } from '../../services/CurrencyService';
import { DefaultOrderMapper } from '../DefaultOrderMapper';
import { SharperImageDefaultCustomerMapper } from './SharperImageDefaultCustomerMapper';
import { getCustomerProfileFromOrderSharperImage } from '../../../../utils/sharperimage/get-customer-profile-from-order';

export class SharperImageDefaultOrderMapper extends DefaultOrderMapper {
  private sharperImageCustomerMapper: SharperImageDefaultCustomerMapper;

  constructor(currencyService: CurrencyService, customerMapper: SharperImageDefaultCustomerMapper) {
    super(currencyService, customerMapper);
    this.sharperImageCustomerMapper = customerMapper;
  }

    public mapCtOrderToKlaviyoEvent(
      order: Order,
      orderProducts: Product[],
      metric: string,
      updateAdditionalProfileProperties: boolean,
      time?: string,
    ): EventRequest {
      const baseData = super.mapCtOrderToKlaviyoEvent(order, orderProducts, metric, updateAdditionalProfileProperties, time);
      const sharperImageProfileData = getCustomerProfileFromOrderSharperImage(order, this.sharperImageCustomerMapper, true);

      return {
        ...baseData,
        data: {
          ...baseData.data,
          attributes: {
            ...baseData.data.attributes,
            profile: {
              ...baseData.data.attributes.profile,
              ...sharperImageProfileData,
            },
          },
        },
      };
    }

    public mapCtRefundedOrderToKlaviyoEvent(
        order: Order,
        orderProducts: Product[],
        metric: string,
        time?: string,
    ): EventRequest {
      const baseData = super.mapCtRefundedOrderToKlaviyoEvent(order, orderProducts, metric, time);
      const sharperImageProfileData = getCustomerProfileFromOrderSharperImage(order, this.sharperImageCustomerMapper, true);

      return {
        ...baseData,
        data: {
          ...baseData.data,
          attributes: {
            ...baseData.data.attributes,
            profile: {
              ...baseData.data.attributes.profile,
              ...sharperImageProfileData,
            },
          },
        },
      };
    }

    public mapOrderLineToProductOrderedEvent(lineItem: LineItem, order: Order, time?: string): EventRequest {
      const baseData = super.mapOrderLineToProductOrderedEvent(lineItem, order, time);
      const sharperImageProfileData = getCustomerProfileFromOrderSharperImage(order, this.sharperImageCustomerMapper, true);

      return {
        ...baseData,
        data: {
          ...baseData.data,
          attributes: {
            ...baseData.data.attributes,
            profile: {
              ...baseData.data.attributes.profile,
              ...sharperImageProfileData,
            },
          },
        },
      };
    }
}