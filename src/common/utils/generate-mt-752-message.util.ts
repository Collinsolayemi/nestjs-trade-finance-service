import { Mt752MessageData } from '../interfaces';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';
import * as moment from 'moment-timezone';

export default function generateMt752Message(data: Mt752MessageData): string {
  const {
    sessionNumber,
    sequenceNumber,
    senderBIC,
    receiverBIC,
    uniqueID,
    documentaryCreditNumber,
    presentingBankReference,
    furtherIdentification,
    dateOfAdviceOfDiscrepancyOrMailing,
    totalAmountAdvisedCurrency,
    totalAmountAdvised,
    chargesDeductedCurrency,
    chargesDeductedAmount,
    netAmountCurrency,
    netAmount,
    paymentDueDate,
    sendersCorrespondentAccount,
    sendersCorrespondentBIC,
    receiversCorrespondentAccount,
    receiversCorrespondentBIC,
    senderToReceiverInformation,
    narrative,
  } = data;

  const formattedPaymentDueDate = moment(paymentDueDate).format('YYMMDD');

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I752${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}` +
    `{3:{121:${uniqueID}}}{4:\r\n`;

  message += `:20:${documentaryCreditNumber}\r\n`;

  message += `:21:${presentingBankReference}\r\n`;

  message += `:23:${furtherIdentification}\r\n`;

  message += `:30:${dateOfAdviceOfDiscrepancyOrMailing}\r\n`;

  if (totalAmountAdvised && totalAmountAdvisedCurrency) {
    const formattedAmount = formatNumberAccordingToRules(
      totalAmountAdvised,
      totalAmountAdvisedCurrency,
    );
    message += `:32B:${totalAmountAdvisedCurrency}${formattedAmount}\r\n`;
  }

  if (chargesDeductedAmount && chargesDeductedCurrency) {
    const formattedAmount = formatNumberAccordingToRules(
      chargesDeductedAmount,
      chargesDeductedCurrency,
    );
    message += `:34B:${chargesDeductedCurrency}${formattedAmount}\r\n`;
  }

  if (netAmount && netAmountCurrency) {
    const formattedAmount = formatNumberAccordingToRules(
      netAmount,
      netAmountCurrency,
    );
    message += `:33a:${formattedPaymentDueDate}${netAmountCurrency}${formattedAmount}\r\n`;
  }

  if (sendersCorrespondentBIC) {
    message += `:53a:`;
    if (sendersCorrespondentAccount) {
      message += `/${sendersCorrespondentAccount}\r\n`;
    }
    message += `${sendersCorrespondentBIC.padEnd(11, 'X')}\r\n`;
  }

  if (receiversCorrespondentBIC) {
    message += `:54a:`;
    if (receiversCorrespondentAccount) {
      message += `/${receiversCorrespondentAccount}\r\n`;
    }
    message += `${receiversCorrespondentBIC.padEnd(11, 'X')}\r\n`;
  }

  if (senderToReceiverInformation) {
    message += `:72Z:${senderToReceiverInformation.trim().toUpperCase()}\r\n`;
  }

  if (narrative) {
    message += `:79:${narrative.trim().toUpperCase()}\r\n`;
  }

  message += '-}';

  return message;
}
