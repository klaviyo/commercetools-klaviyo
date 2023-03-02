import { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import logger from '../../../../utils/log';
import { processEvent } from '../../../../domain/eventSync/processEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { SQSBatchItemFailure } from 'aws-lambda/trigger/sqs';
import { KlaviyoSdkService } from "../../../driven/klaviyo/KlaviyoSdkService";

export const lambdaHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    logger.info(`SQS adapter processing event`, event);
    // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
    const itemFailures: SQSBatchItemFailure[] = [];

    for (const record of event.Records) {
        try {
            const result = await processEvent(JSON.parse(record.body) as MessageDeliveryPayload, new KlaviyoSdkService());
            switch (result.status) {
                case 'OK':
                    // all good
                    break;
                case '4xx':
                    //don't want to retry 4xx errors
                    // raise alert, send to DLQ...
                    break;
                default:
                    break;
            }
        } catch (e) {
            // make the failed message visible again in the queue for reprocessing
            itemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    return { batchItemFailures: itemFailures };
};
