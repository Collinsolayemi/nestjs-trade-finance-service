import { Mt730MessageData } from '../interfaces';

export default function generateMt730Message(data: Mt730MessageData): string {
  const {
    sessionNumber,
    sequenceNumber,
    senderBIC,
    receiverBIC,
    uniqueID,
    sendersReference,
    receiversReference,
    dateOfMessageBeingAcknowledged,
    accountIdentification,
    amountOfCharges,
    accountWithBankBic,
    accountWithBankAccount,
    charges,
    senderToReceiverInformation,
    narrative,
  } = data;

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I730${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}` +
    `{3:{121:${uniqueID}}}` +
    `{4:\n` +
    `:20:${sendersReference}\n` +
    `:21:${receiversReference}\n`;

  if (accountIdentification) {
    message += `:25:${accountIdentification.trim().toUpperCase()}\n`;
  }

  message += `:30:${dateOfMessageBeingAcknowledged.trim().toUpperCase()}\n`;

  if (amountOfCharges) {
    message += `:32a:${amountOfCharges.trim().toUpperCase()}\n`;
  }

  if (accountWithBankBic) {
    message += `:53A:`;
    if (accountWithBankAccount) {
      message += `/${accountWithBankAccount.trim().toUpperCase()}\r\n`;
    }
    message += `${accountWithBankBic.padEnd(11, 'X')}\r\n`;
  }

  if (charges) {
    message += `:71D:${charges.trim().toUpperCase()}\n`;
  }

  if (senderToReceiverInformation) {
    message += `:72Z:${senderToReceiverInformation.trim().toUpperCase()}\n`;
  }

  if (narrative) {
    message += `:79Z:${narrative.trim().toUpperCase()}\n`;
  }

  message += '-}';

  return message;
}
