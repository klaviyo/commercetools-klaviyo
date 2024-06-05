import { TypedMoney } from '@commercetools/platform-sdk';
import logger from './log';

export const getTypedMoneyAsNumber = (money?: TypedMoney): number => {
    if(!money){
        logger.info('No price found for product.');
        return 0;
    }
    return money.centAmount / Math.pow(10, money.fractionDigits);
};
