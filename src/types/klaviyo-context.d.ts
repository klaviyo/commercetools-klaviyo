import { KlaviyoService } from '../infrastructure/driven/klaviyo/KlaviyoService';
import { OrderMapper } from '../domain/shared/mappers/OrderMapper';
import { CustomerMapper } from '../domain/shared/mappers/CustomerMapper';

type Context = {
    klaviyoService: KlaviyoService;
    orderMapper: OrderMapper;
    customerMapper: CustomerMapper;
};
