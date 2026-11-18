import { Mt202MessageData } from '../interfaces';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';

export default function generateMt202Message(data: Mt202MessageData): string {
  const {
    sessionNumber,
    sequenceNumber,
    senderBIC,
    receiverBIC,
    uniqueID,
    transactionReference,
    valueDate,
    currencyCode,
    amount,
    orderingInstituionAccount,
    orderingInstituionBicCode,
    sendersCorrespondentAccount,
    sendersCorrespondentBicCode,
    receiversCorrespondentAccount,
    receiversCorrespondentBicCode,
    intermediaryAccount,
    intermediaryBicCode,
    accountWithInstituitionAccount,
    accountWithInstituitionBicCode,
    beneficiaryAccount,
    beneficiaryBankSwiftCode,
    senderToReceiverInformation,
  } = data;

  const formattedAmount = formatNumberAccordingToRules(amount, currencyCode);

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I202${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}` +
    `{3:{121:${uniqueID}}}{4:\r\n` +
    `:20:${transactionReference}\r\n` +
    `:21:NON REF\r\n` +
    `:32A:${valueDate}${currencyCode}${formattedAmount}\r\n`;

  if (orderingInstituionAccount && orderingInstituionBicCode) {
    message += `:52A:/${orderingInstituionAccount.trim().toUpperCase()}\r\n${orderingInstituionBicCode.padEnd(11, 'X').trim().toUpperCase()}\r\n`;
  }

  if (sendersCorrespondentAccount && sendersCorrespondentBicCode) {
    message += `:53A:/${sendersCorrespondentAccount.trim().toUpperCase()}\r\n${sendersCorrespondentBicCode.padEnd(11, 'X').trim().toUpperCase()}\r\n`;
  }

  if (receiversCorrespondentAccount && receiversCorrespondentBicCode) {
    message += `:54A:/${receiversCorrespondentAccount.trim().toUpperCase()}\r\n${receiversCorrespondentBicCode.padEnd(11, 'X').trim().toUpperCase()}\r\n`;
  }

  if (intermediaryAccount && intermediaryBicCode) {
    message += `:56A:/${intermediaryAccount.trim().toUpperCase()}\r\n${intermediaryBicCode.padEnd(11, 'X').trim().toUpperCase()}\r\n`;
  }

  if (accountWithInstituitionAccount && accountWithInstituitionBicCode) {
    message += `:57A:/${accountWithInstituitionAccount.trim().toUpperCase()}\r\n${accountWithInstituitionBicCode.padEnd(11, 'X').trim().toUpperCase()}\r\n`;
  }

  if (beneficiaryAccount && beneficiaryBankSwiftCode) {
    message += `:58A:/${beneficiaryAccount.trim().toUpperCase()}\r\n${beneficiaryBankSwiftCode.padEnd(11, 'X').trim().toUpperCase()}\r\n`;
  }

  if (senderToReceiverInformation) {
    message += `:72:${senderToReceiverInformation.trim().toUpperCase()}\r\n`;
  }

  message += '-}';

  return message;
}
