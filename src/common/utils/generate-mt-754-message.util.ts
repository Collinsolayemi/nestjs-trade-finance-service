import { SwiftBICEnum } from '../enums';
import { Mt754MessageData } from '../interfaces';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';

export default function generateMt754Message(data: Mt754MessageData): string {
  const {
    senderReference,
    relatedReference,
    principalAmountPaidAcceptedNegotiated,
    currencyCode,
    additionalAmounts,
    chargesDeductedAmount,
    chargesDeductedCurrency,
    chargesAddedAmount,
    chargesAddedCurrency,
    totalAmountClaimed,
    totalAmountClaimedCurrency,
    reimbursingBankBicCode,
    reimbursingBankAccount,
    accountWithBankBicCode,
    accountWithBankAccount,
    beneficiaryBankBicCode,
    beneficiaryBankAccount,
    senderToReceiverInformation,
    narrative,
    senderBIC = SwiftBICEnum.STERLING,
    receiverBIC,
    sessionNumber,
    sequenceNumber,
  } = data;

  const formattedPrincipalAmountPaidAcceptedNegotiated =
    formatNumberAccordingToRules(
      principalAmountPaidAcceptedNegotiated,
      currencyCode,
    );
  const formattedAdditionalAmounts = formatNumberAccordingToRules(
    additionalAmounts,
    currencyCode,
  );
  const formattedChargesDeductedAmount = formatNumberAccordingToRules(
    chargesDeductedAmount,
    chargesDeductedCurrency,
  );
  const formattedChargesAddedAmount = formatNumberAccordingToRules(
    chargesAddedAmount,
    chargesAddedCurrency,
  );
  const formattedTotalAmountClaimed = formatNumberAccordingToRules(
    totalAmountClaimed,
    totalAmountClaimedCurrency,
  );

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I754${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}{4:\r\n` +
    `:27:1/1\r\n`;

  if (senderReference) {
    message += `:20:${senderReference.trim().toUpperCase()}\r\n`;
  }

  if (relatedReference) {
    message += `:21:${relatedReference.trim().toUpperCase()}\r\n`;
  }

  if (formattedPrincipalAmountPaidAcceptedNegotiated) {
    message += `:32a:${currencyCode.trim().toUpperCase()}${formattedPrincipalAmountPaidAcceptedNegotiated.trim().toUpperCase()}\r\n`;
  }

  if (formattedAdditionalAmounts) {
    message += `:33B:${currencyCode.trim().toUpperCase()}${formattedAdditionalAmounts.trim().toUpperCase()}\r\n`;
  }

  if (formattedChargesDeductedAmount) {
    message += `:71D:${chargesDeductedCurrency.trim().toUpperCase()}${formattedChargesDeductedAmount.trim().toUpperCase()}\r\n`;
  }

  if (formattedChargesAddedAmount) {
    message += `:73A:${chargesAddedCurrency.trim().toUpperCase()}${formattedChargesAddedAmount.trim().toUpperCase()}\r\n`;
  }

  if (formattedTotalAmountClaimed) {
    message += `:34a:${totalAmountClaimedCurrency.trim().toUpperCase()}${formattedTotalAmountClaimed.trim().toUpperCase()}\r\n`;
  }

  if (reimbursingBankBicCode && reimbursingBankAccount) {
    message += `:53a:${reimbursingBankAccount.trim().toUpperCase()}/${reimbursingBankBicCode.padEnd(11, 'X')}\r\n`;
  }

  if (accountWithBankBicCode && accountWithBankAccount) {
    message += `:57a:${accountWithBankAccount.trim().toUpperCase()}/${accountWithBankBicCode.padEnd(11, 'X')}\r\n`;
  }

  if (beneficiaryBankBicCode && beneficiaryBankAccount) {
    message += `:58a:${beneficiaryBankAccount.trim().toUpperCase()}/${beneficiaryBankBicCode.padEnd(11, 'X')}\r\n`;
  }

  if (senderToReceiverInformation) {
    message += `:72Z:${senderToReceiverInformation.trim().toUpperCase()}\r\n`;
  }

  if (narrative) {
    message += `:77:${narrative.trim().toUpperCase()}\r\n`;
  }

  message += '-}';

  return message;
}
