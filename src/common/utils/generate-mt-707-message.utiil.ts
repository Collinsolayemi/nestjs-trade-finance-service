import * as moment from 'moment-timezone';
import { Mt707MessageData } from '../interfaces';
import { SwiftBICEnum } from '../enums';
import formatPaymentDetails from './format-payment-details.util';
import formatNumberAccordingToRules from './format-number-according-to-rules.util';

export default function generateMt707Message(data: Mt707MessageData): string {
  const {
    senderReference,
    receiverReference,
    issuingBankReference,
    dateOfIssue,
    numberOfAmendment,
    dateOfAmendment,
    purposeOfMessage,
    issuingBank,
    nonBankIssuer,
    cancellationRequest,
    formOfDocumentaryCredit,
    applicableRules,
    expiryDate,
    expiryPlace,
    applicantBankBicCode,
    applicantName,
    applicantAddress,
    beneficiaryName,
    beneficiaryAddress,
    currencyCode,
    increaseOfDocumentaryCreditAmount,
    decreaseOfDocumentaryCreditAmount,
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
    partialShipments,
    transhipment,
    placeOfTakingInChargeDispatchFromPlaceOfReceipt,
    portOfLoadingAirportOfDeparture,
    portOfDischargeAirportOfDestination,
    placeOfFinalDestinationForTransportationToPlaceOfDelivery,
    latestDateOfShipment,
    shipmentPeriod,
    descriptionOfGoodsAndOrServices,
    documentsRequired,
    additionalConditions,
    specialPaymentConditionsForBeneficiary,
    specialPaymentConditionsForBankOnly,
    charges,
    amendmentChargePayableBy,
    periodForPresentationInDays,
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

  const formattedIssueDate = moment(dateOfIssue).format('YYMMDD');
  const formattedAmendmentDate = dateOfAmendment
    ? moment(dateOfAmendment).format('YYMMDD')
    : null;
  const formattedExpiryDate = moment(expiryDate).format('YYMMDD');
  const formattedPaymentDate = moment(paymentDate).format('YYMMDD');
  const formattedLatestDateOfShipment = latestDateOfShipment
    ? moment(latestDateOfShipment).format('YYMMDD')
    : null;
  const formattedMixedPaymentDetails =
    formatPaymentDetails(mixedPaymentDetails);
  const amount =
    increaseOfDocumentaryCreditAmount ?? decreaseOfDocumentaryCreditAmount;
  const formattedAmount = amount
    ? formatNumberAccordingToRules(amount, currencyCode)
    : null;

  let message =
    `{1:F01${senderBIC.padEnd(12, 'X')}${sessionNumber}${sequenceNumber}}` +
    `{2:I707${receiverBIC.replace(/\s+/g, '').padEnd(12, 'X')}N}{4:\r\n` +
    `:27:1/1\r\n`;

  if (senderReference) {
    message += `:20:${senderReference.trim().toUpperCase()}\r\n`;
  }

  if (receiverReference) {
    message += `:21:${receiverReference.trim().toUpperCase()}\r\n`;
  }

  if (issuingBankReference) {
    message += `:23:${issuingBankReference.trim().toUpperCase()}\r\n`;
  }

  if (formattedIssueDate) {
    message += `:31C:${formattedIssueDate}\r\n`;
  }

  if (purposeOfMessage) {
    message += `:22A:${purposeOfMessage.trim().toUpperCase()}\r\n`;
  }

  if (numberOfAmendment) {
    message += `:26E:${numberOfAmendment.trim().toUpperCase()}\r\n`;
  }

  if (formattedAmendmentDate) {
    message += `:30:${formattedAmendmentDate.trim().toUpperCase()}\r\n`;
  }

  if (issuingBank) {
    message += `:52A:${issuingBank.trim().toUpperCase()}\r\n`;
  }

  if (nonBankIssuer) {
    message += `:50B:${nonBankIssuer.trim().toUpperCase()}\r\n`;
  }

  if (cancellationRequest) {
    message += `:23S:${cancellationRequest.trim().toUpperCase()}\r\n`;
  }

  if (formOfDocumentaryCredit) {
    message += `:40A:${formOfDocumentaryCredit.trim().toUpperCase()}\r\n`;
  }

  if (applicableRules) {
    message += `:40E:${applicableRules.trim().toUpperCase()}\r\n`;
  }

  if (expiryDate && expiryPlace) {
    message += `:31D:${formattedExpiryDate.trim().toUpperCase()} ${expiryPlace.trim().toUpperCase()}\r\n`;
  }

  if (applicantBankBicCode) {
    message += `:51A:${applicantBankBicCode.trim().toUpperCase()}\r\n`;
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

  if (increaseOfDocumentaryCreditAmount) {
    message += `:32B:${currencyCode.trim().toUpperCase()}${formattedAmount.trim().toUpperCase()}\r\n`;
  }

  if (decreaseOfDocumentaryCreditAmount) {
    message += `:33B:${currencyCode.toUpperCase()}${formattedAmount}\r\n`;
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

  if (partialShipments) {
    message += `:43P:${partialShipments.trim().toUpperCase()}\r\n`;
  }

  if (transhipment) {
    message += `:43T:${transhipment.trim().toUpperCase()}\r\n`;
  }

  if (placeOfTakingInChargeDispatchFromPlaceOfReceipt) {
    message += `:44A:${placeOfTakingInChargeDispatchFromPlaceOfReceipt.trim().toUpperCase()}\r\n`;
  }

  if (portOfLoadingAirportOfDeparture) {
    message += `:44E:${portOfLoadingAirportOfDeparture.trim().toUpperCase()}\r\n`;
  }

  if (portOfDischargeAirportOfDestination) {
    message += `:44F:${portOfDischargeAirportOfDestination.trim().toUpperCase()}\r\n`;
  }

  if (placeOfFinalDestinationForTransportationToPlaceOfDelivery) {
    message += `:44B:${placeOfFinalDestinationForTransportationToPlaceOfDelivery.trim().toUpperCase()}\r\n`;
  }

  if (formattedLatestDateOfShipment) {
    message += `:44C:${formattedLatestDateOfShipment}\r\n`;
  }

  if (shipmentPeriod) {
    message += `:44D:${shipmentPeriod.trim().toUpperCase()}\r\n`;
  }

  if (descriptionOfGoodsAndOrServices) {
    message += `:45B:${descriptionOfGoodsAndOrServices.trim().toUpperCase()}\r\n`;
  }

  if (documentsRequired) {
    message += `:46B:${documentsRequired.trim().toUpperCase()}\r\n`;
  }

  if (additionalConditions) {
    message += `:47B:${additionalConditions.trim().toUpperCase()}\r\n`;
  }

  if (specialPaymentConditionsForBeneficiary) {
    message += `:49M:${specialPaymentConditionsForBeneficiary.trim().toUpperCase()}\r\n`;
  }

  if (specialPaymentConditionsForBankOnly) {
    message += `:49N:${specialPaymentConditionsForBankOnly.trim().toUpperCase()}\r\n`;
  }

  if (charges) {
    message += `:71D:${charges.trim().toUpperCase()}\r\n`;
  }

  if (amendmentChargePayableBy) {
    message += `:71N:${amendmentChargePayableBy.trim().toUpperCase()}\r\n`;
  }

  if (periodForPresentationInDays) {
    message += `:48:${periodForPresentationInDays.trim().toUpperCase()}\r\n`;
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
