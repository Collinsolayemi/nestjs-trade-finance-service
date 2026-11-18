import { SwiftBICEnum } from '../enums';
import { Mt422MessageData } from '../interfaces';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';

export default function generateMt422Message(data: Mt422MessageData): string {
  const {
    sendingBanksTRN,
    relatedReference,
    amountOfCollection,
    currencyCode,
    queries,
    answers,
    senderToReceiverInformation,
    senderBIC = SwiftBICEnum.STERLING,
    receiverBIC,
    sessionNumber,
    sequenceNumber,
  } = data;

  const formattedAmount = formatNumberAccordingToRules(
    amountOfCollection,
    currencyCode,
  );

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I422${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}{4:\r\n` +
    `:27:1/1\r\n`;

  if (sendingBanksTRN) {
    message += `:20:${sendingBanksTRN.trim().toUpperCase()}\r\n`;
  }

  if (relatedReference) {
    message += `:21:${relatedReference.trim().toUpperCase()}\r\n`;
  }

  if (formattedAmount) {
    message += `:32a:${currencyCode.trim().toUpperCase()}${formattedAmount.trim().toUpperCase()}\r\n`;
  }

  if (senderToReceiverInformation) {
    message += `:72:${senderToReceiverInformation.trim().toUpperCase()}\r\n`;
  }

  if (queries) {
    message += `:75:${queries.trim().toUpperCase()}\r\n`;
  }

  if (answers) {
    message += `:76:${answers.trim().toUpperCase()}\r\n`;
  }

  message += '-}';

  return message;
}
