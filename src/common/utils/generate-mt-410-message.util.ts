import { SwiftBICEnum } from '../enums';
import { Mt410MessageData } from '../interfaces';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';

export default function generateMt410Message(data: Mt410MessageData): string {
  const {
    sendingBanksTRN,
    relatedReference,
    amountAcknowledged,
    currencyCode,
    senderToReceiverInformation,
    senderBIC = SwiftBICEnum.STERLING,
    receiverBIC,
    sessionNumber,
    sequenceNumber,
  } = data;

  const formattedAmount = formatNumberAccordingToRules(
    amountAcknowledged,
    currencyCode,
  );

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I410${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}{4:\r\n` +
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

  message += '-}';

  return message;
}
