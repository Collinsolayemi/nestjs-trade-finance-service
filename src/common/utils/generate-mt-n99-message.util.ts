import { Mtn99MessageData } from '../interfaces';

export default function generateMtn99Message(data: Mtn99MessageData): string {
  const {
    sessionNumber,
    sequenceNumber,
    senderBIC,
    receiverBIC,
    uniqueID,
    transactionReference,
    relatedReference,
    narrative,
    swiftMessageType,
  } = data;

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I${swiftMessageType}${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}` +
    `{3:{121:${uniqueID}}}` +
    `{4:\r\n` +
    `:20:${transactionReference}\r\n` +
    `:21:${relatedReference}\r\n`;

  if (Array.isArray(narrative)) {
    for (const entry of narrative) {
      if (entry) {
        message += `:79:${entry.trim().toUpperCase()}\r\n`;
      }
    }
  }

  message += '-}';

  return message;
}
