import { SwiftBICEnum } from '../enums';
import { Mt756MessageData } from '../interfaces';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';

export default function generateMt756Message(data: Mt756MessageData): string {
  const {
    senderReference,
    presentingBankReference,
    totalAmountClaimedCurrency,
    totalAmountClaimed,
    amountReimbursedOrPaidCurrency,
    amountReimbursedOrPaid,
    sendersCorrespondentAccount,
    sendersCorrespondentBIC,
    receiversCorrespondentAccount,
    receiversCorrespondentBIC,
    senderToReceiverInformation,
    narrative,
    senderBIC = SwiftBICEnum.STERLING,
    receiverBIC,
    sessionNumber,
    sequenceNumber,
  } = data;

  const formattedTotalAmountClaimed = formatNumberAccordingToRules(
    totalAmountClaimed,
    totalAmountClaimedCurrency,
  );
  const formattedAmountReimbursedOrPaid = formatNumberAccordingToRules(
    amountReimbursedOrPaid,
    amountReimbursedOrPaidCurrency,
  );

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I756${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}{4:\r\n` +
    `:27:1/1\r\n`;

  if (senderReference) {
    message += `:20:${senderReference.trim().toUpperCase()}\r\n`;
  }

  if (presentingBankReference) {
    message += `:21:${presentingBankReference.trim().toUpperCase()}\r\n`;
  }

  if (totalAmountClaimed && totalAmountClaimedCurrency) {
    message += `:32B:${totalAmountClaimedCurrency}${formattedTotalAmountClaimed}\r\n`;
  }

  if (amountReimbursedOrPaid && amountReimbursedOrPaidCurrency) {
    message += `:33A:${amountReimbursedOrPaidCurrency}${formattedAmountReimbursedOrPaid}\r\n`;
  }

  if (sendersCorrespondentBIC && sendersCorrespondentAccount) {
    message += `:53a:${sendersCorrespondentAccount.trim().toUpperCase()}/${sendersCorrespondentBIC.padEnd(11, 'X')}\r\n`;
  }

  if (receiversCorrespondentBIC && receiversCorrespondentAccount) {
    message += `:54a:${receiversCorrespondentAccount.trim().toUpperCase()}/${receiversCorrespondentBIC.padEnd(11, 'X')}\r\n`;
  }

  if (senderToReceiverInformation) {
    message += `:72Z:${senderToReceiverInformation.trim().toUpperCase()}\r\n`;
  }

  if (narrative) {
    message += `:79Z:${narrative.trim().toUpperCase()}\r\n`;
  }

  message += '-}';

  return message;
}
