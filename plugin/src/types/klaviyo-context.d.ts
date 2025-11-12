import { KlaviyoService } from '../infrastructure/driven/klaviyo/KlaviyoService';
import { OrderMapper } from '../domain/shared/mappers/OrderMapper';
import { CustomerMapper } from '../domain/shared/mappers/CustomerMapper';
import { CategoryMapper } from '../domain/shared/mappers/CategoryMapper';
import { ProductMapper } from '../domain/shared/mappers/ProductMapper';
import { CtCustomerService } from '../infrastructure/driven/commercetools/CtCustomerService';
import { CtProductService } from '../infrastructure/driven/commercetools/CtProductService';
import { CtCategoryService } from '../infrastructure/driven/commercetools/CtCategoryService';
import { CtPaymentService } from '../infrastructure/driven/commercetools/CtPaymentService';
import { CtOrderService } from '../infrastructure/driven/commercetools/CtOrderService';
import { ProfileDeduplicationService } from '../domain/shared/services/ProfileDeduplicationService';

type Context = {
    klaviyoService: KlaviyoService;
    orderMapper: OrderMapper;
    customerMapper: CustomerMapper;
    categoryMapper: CategoryMapper;
    productMapper: ProductMapper;
    ctCustomerService: CtCustomerService;
    ctProductService: CtProductService;
    ctCategoryService: CtCategoryService;
    ctPaymentService: CtPaymentService;
    ctOrderService: CtOrderService;
    profileDeduplicationService: ProfileDeduplicationService;
};
