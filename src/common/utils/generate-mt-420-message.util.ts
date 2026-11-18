import { Mt420MessageData } from '../interfaces';
import { SwiftBICEnum } from '../enums';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';
import * as moment from 'moment-timezone';

export default function generateMt420Message(data: Mt420MessageData): string {
  const {
    sendingBanksTRN,
    relatedReference,
    amountTraced,
    currencyCode,
    dateOfCollectionInstruction,
    senderToReceiverInformation,
    senderBIC = SwiftBICEnum.STERLING,
    receiverBIC,
    sessionNumber,
    sequenceNumber,
  } = data;

  const formattedAmount = formatNumberAccordingToRules(
    amountTraced,
    currencyCode,
  );
  const formattedDateOfCollectionInstruction = moment(
    dateOfCollectionInstruction,
  ).format('YYMMDD');

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I420${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}{4:\r\n` +
    `:27:1/1\r\n`;

  if (sendingBanksTRN) {
    message += `:20:${sendingBanksTRN.trim().toUpperCase()}\r\n`;
  }

  if (relatedReference) {
    message += `:21:${relatedReference.trim().toUpperCase()}\r\n`;
  }

  if (formattedAmount) {
    message += `:32a:${formattedDateOfCollectionInstruction}${currencyCode.trim().toUpperCase()}${formattedAmount.trim().toUpperCase()}\r\n`;
  }

  if (senderToReceiverInformation) {
    message += `:72:${senderToReceiverInformation.trim().toUpperCase()}\r\n`;
  }

  message += '-}';

  return message;
}
