import { Payment } from '@commercetools/platform-sdk';

export interface CtPaymentService {
  getPaymentById (orderId: string): Promise<Payment>;
}
