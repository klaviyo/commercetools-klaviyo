import { KlaviyoService } from "../infrastructure/driven/klaviyo/KlaviyoService";
import { CurrencyService } from "../domain/shared/services/CurrencyService";
import { OrderMapper } from "../domain/shared/mappers/OrderMapper";

type Context = {
  klaviyoService: KlaviyoService;
  orderMapper: OrderMapper;
};

