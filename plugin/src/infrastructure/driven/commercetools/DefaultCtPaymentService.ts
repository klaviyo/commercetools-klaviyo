import { Payment } from '@commercetools/platform-sdk';
import logger from '../../../utils/log';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { CtPaymentService } from "./CtPaymentService";
import { StatusError } from '../../../types/errors/StatusError';
import { getApiRoot } from './ctService';

export class DefaultCtPaymentService implements CtPaymentService{
    constructor(private readonly ctApiRoot: ByProjectKeyRequestBuilder, private readonly limit = 20) {}

    getPaymentById = async (paymentId: string): Promise<Payment> => {
		logger.info(`Getting payment ${paymentId} in commercetools`);
		let ctPayment: Payment;

		try {
			ctPayment = (await getApiRoot().payments().withId({ ID: paymentId }).get().execute()).body;
		} catch (error: any) {
			logger.error(`Error getting payment in CT with id ${paymentId}, status: ${error.statusCode}`, error);
			throw new StatusError(
				error.statusCode,
				`CT get payment api returns failed with status code ${error.statusCode}, msg: ${error.message}`,
			);
		}

		return ctPayment;
	};

}
