import { SQSBatchResponse, SQSEvent } from 'aws-lambda';
import logger from '../../../../utils/log';
import { processEvent } from '../../../../domain/eventSync/processEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { SQSBatchItemFailure } from 'aws-lambda/trigger/sqs';
import { KlaviyoSdkService } from "../../../driven/klaviyo/KlaviyoSdkService";

export const lambdaHandler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
    // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
    const itemFailures: SQSBatchItemFailure[] = [];

    for (const record of event.Records) {
        try {
            const result = await processEvent(JSON.parse(record.body) as MessageDeliveryPayload, new KlaviyoSdkService());
            // Introduce logic here for status handling. Check `result.status`.
        } catch (e) {
            // make the failed message visible again in the queue for reprocessing
            itemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    return { batchItemFailures: itemFailures };
};
