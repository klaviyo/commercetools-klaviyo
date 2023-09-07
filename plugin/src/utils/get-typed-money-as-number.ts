import { TypedMoney } from '@commercetools/platform-sdk';

export const getTypedMoneyAsNumber = (money: TypedMoney): number => {
    return money.centAmount / Math.pow(10, money.fractionDigits);
};
