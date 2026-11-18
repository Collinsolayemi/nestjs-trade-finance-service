import * as moment from 'moment-timezone';
import { Mt700MessageData } from '../interfaces';
import { SwiftBICEnum } from '../enums';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';
import formatPaymentDetails from './format-payment-details.util';

export default function generateMt700Message(data: Mt700MessageData): string {
  const {
    formOfDocumentaryCredit,
    documentaryCreditNumber,
    preAdviceReferenceNumber,
    issueDate,
    applicableRules,
    expiryDate,
    expiryPlace,
    applicantBankBicCode,
    applicantName,
    applicantAddress,
    beneficiaryName,
    beneficiaryAddress,
    currencyCode,
    amount,
    minCreditAmountTolerance,
    maxCreditAmountTolerance,
    additionalAmountsCovered,
    creditAvailableBankBicCode,
    creditAvailableCode,
    draftsAt,
    drawee,
    mixedPaymentDetails,
    paymentDate,
    paymentMethod,
    partialShipment,
    transShipment,
    placeOfTakingInChargeOrDispatchFromOrPlaceOfReceipt,
    portOfLoading,
    portOfDischarge,
    placeOfFinalDestinationOrForTransportationToOrPlaceOfDelivery,
    latestDateOfShipment,
    shipmentPeriod,
    descriptionOfGoods,
    documentsRequired,
    additionalConditions,
    specialPaymentConditionsForBeneficiary,
    specialPaymentConditionsForBankOnly,
    charges,
    presentationDays,
    confirmationInstructions,
    requestedConfirmationParty,
    reimbursingBank,
    instructionsToThePayingAcceptingNegotiatingBank,
    adviseThroughBank,
    senderToReceiverInformation,
    senderBIC = SwiftBICEnum.STERLING,
    receiverBIC,
    sessionNumber,
    sequenceNumber,
  } = data;

  const formattedAmount = formatNumberAccordingToRules(amount, currencyCode);
  const formattedIssueDate = moment(issueDate).format('YYMMDD');
  const formattedExpiryDate = moment(expiryDate).format('YYMMDD');
  const formattedPaymentDate = moment(paymentDate).format('YYMMDD');
  const formattedLatestDateOfShipment =
    moment(latestDateOfShipment).format('YYMMDD');
  const formattedMixedPaymentDetails =
    formatPaymentDetails(mixedPaymentDetails);

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I700${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}{4:\r\n` +
    `:27:1/1\r\n`;

  if (formOfDocumentaryCredit) {
    message += `:40A:${formOfDocumentaryCredit.trim().toUpperCase()}\r\n`;
  }

  if (documentaryCreditNumber) {
    message += `:20:${documentaryCreditNumber.trim().toUpperCase()}\r\n`;
  }

  if (preAdviceReferenceNumber) {
    message += `:23:${preAdviceReferenceNumber.trim().toUpperCase()}\r\n`;
  }

  if (formattedIssueDate) {
    message += `:31C:${formattedIssueDate.trim().toUpperCase()}\r\n`;
  }

  if (applicableRules) {
    message += `:40E:${applicableRules.trim().toUpperCase()}\r\n`;
  }

  if (expiryDate && expiryPlace) {
    message += `:31D:${formattedExpiryDate.trim().toUpperCase()} ${expiryPlace.trim().toUpperCase()}\r\n`;
  }

  if (applicantBankBicCode) {
    message += `:51a:${applicantBankBicCode.trim().toUpperCase()}\r\n`;
  }

  if (applicantName) {
    message += `:50:${applicantName.trim().toUpperCase()}`;
    if (applicantAddress) {
      message += `\r\n${applicantAddress.trim().toUpperCase()}`;
    }
    message += '\r\n';
  }

  if (beneficiaryName) {
    message += `:59:${beneficiaryName.trim().toUpperCase()}`;
    if (beneficiaryAddress) {
      message += `\r\n${beneficiaryAddress.trim().toUpperCase()}`;
    }
    message += '\r\n';
  }

  if (currencyCode && formattedAmount) {
    message += `:32B:${currencyCode.trim().toUpperCase()}${formattedAmount.trim().toUpperCase()}\r\n`;
  }

  if (minCreditAmountTolerance && maxCreditAmountTolerance) {
    message += `:39A:${maxCreditAmountTolerance.toString().trim()}/${minCreditAmountTolerance.toString().trim()}\r\n`;
  }

  if (additionalAmountsCovered) {
    message += `:39C:${additionalAmountsCovered.trim().toUpperCase()}\r\n`;
  }

  if (creditAvailableBankBicCode && creditAvailableCode) {
    message += `:41a:${creditAvailableBankBicCode.trim().toUpperCase()}\r\n${creditAvailableCode.trim().toUpperCase()}\r\n`;
  }

  if (draftsAt) {
    message += `:42C:${draftsAt.trim().toUpperCase()}\r\n`;
  }

  if (drawee) {
    message += `:42a:${drawee.trim().toUpperCase()}\r\n`;
  }

  if (Array.isArray(mixedPaymentDetails) && mixedPaymentDetails.length > 0) {
    message += `:42M:${formattedMixedPaymentDetails.trim().toUpperCase()}\r\n`;
  }

  if (paymentDate || paymentMethod) {
    message += `:42P:${formattedPaymentDate.trim().toUpperCase()} ${paymentMethod.trim().toUpperCase()}\r\n`;
  }

  if (partialShipment) {
    message += `:43P:${partialShipment.trim().toUpperCase()}\r\n`;
  }

  if (transShipment) {
    message += `:43T:${transShipment.trim().toUpperCase()}\r\n`;
  }

  if (placeOfTakingInChargeOrDispatchFromOrPlaceOfReceipt) {
    message += `:44A:${placeOfTakingInChargeOrDispatchFromOrPlaceOfReceipt.trim().toUpperCase()}\r\n`;
  }

  if (portOfLoading) {
    message += `:44E:${portOfLoading.trim().toUpperCase()}\r\n`;
  }

  if (portOfDischarge) {
    message += `:44F:${portOfDischarge.trim().toUpperCase()}\r\n`;
  }

  if (placeOfFinalDestinationOrForTransportationToOrPlaceOfDelivery) {
    message += `:44B:${placeOfFinalDestinationOrForTransportationToOrPlaceOfDelivery.trim().toUpperCase()}\r\n`;
  }

  if (latestDateOfShipment) {
    message += `:44C:${formattedLatestDateOfShipment.trim().toUpperCase()}\r\n`;
  }

  if (shipmentPeriod) {
    message += `:44D:${shipmentPeriod.trim().toUpperCase()}\r\n`;
  }

  if (descriptionOfGoods) {
    message += `:45A:${descriptionOfGoods.trim().toUpperCase()}\r\n`;
  }

  if (documentsRequired) {
    message += `:46A:${documentsRequired.trim().toUpperCase()}\r\n`;
  }

  if (additionalConditions) {
    message += `:47A:${additionalConditions.trim().toUpperCase()}\r\n`;
  }

  if (specialPaymentConditionsForBeneficiary) {
    message += `:49G:${specialPaymentConditionsForBeneficiary.trim().toUpperCase()}\r\n`;
  }

  if (specialPaymentConditionsForBankOnly) {
    message += `:49H:${specialPaymentConditionsForBankOnly.trim().toUpperCase()}\r\n`;
  }

  if (charges) {
    message += `:71D:${charges.trim().toUpperCase()}\r\n`;
  }

  if (presentationDays) {
    message += `:48:${presentationDays.trim().toUpperCase()}\r\n`;
  }

  if (confirmationInstructions) {
    message += `:49:${confirmationInstructions.trim().toUpperCase()}\r\n`;
  }

  if (requestedConfirmationParty) {
    message += `:58a:${requestedConfirmationParty.trim().toUpperCase()}\r\n`;
  }

  if (reimbursingBank) {
    message += `:53a:${reimbursingBank.trim().toUpperCase()}\r\n`;
  }

  if (Array.isArray(instructionsToThePayingAcceptingNegotiatingBank)) {
    for (const instruction of instructionsToThePayingAcceptingNegotiatingBank) {
      if (instruction) {
        message += `:78:${instruction.trim().toUpperCase()}\r\n`;
      }
    }
  }

  if (adviseThroughBank) {
    message += `:57a:${adviseThroughBank.trim().toUpperCase()}\r\n`;
  }

  if (senderToReceiverInformation) {
    message += `:72Z:${senderToReceiverInformation.trim().toUpperCase()}\r\n`;
  }

  message += '-}';

  return message;
}
