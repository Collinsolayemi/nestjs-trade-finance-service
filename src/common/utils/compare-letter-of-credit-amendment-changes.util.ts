import { LetterOfCreditAmendment } from 'src/modules/letter-of-credit/models/letter-of-credit-amendment.model';
import { Mt707MessageData } from '../interfaces';
import { LetterOfCredit } from 'src/modules/letter-of-credit/models/letter-of-credit.model';
import {
  CreditAvailableWithEnum,
  DraftModeEnum,
  DraweeEnum,
  IANATimeZoneDatabaseEnum,
  LetterOfCreditAmountChangeEnum,
  SwiftBICEnum,
} from '../enums';
import * as moment from 'moment-timezone';
import generateRandomNumberWithDigits from './generate-random-number-with-digits.util';
import { AmendLetterOfCreditDto } from 'src/modules/letter-of-credit/dto/amend-letter-of-credit.dto';

function formatLcCalendarDateForCompare(
  value: Date | string | null | undefined,
): string | null {
  if (value == null || value === '') {
    return null;
  }
  const m = moment.tz(value, IANATimeZoneDatabaseEnum.LAGOS);
  if (!m.isValid()) {
    return null;
  }
  return m.format('YYYY-MM-DD');
}

function lcCalendarDatesDiffer(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
): boolean {
  return (
    formatLcCalendarDateForCompare(a) !== formatLcCalendarDateForCompare(b)
  );
}

export default function compareLetterOfCreditAmendmentChanges(
  letterOfCreditAmendment: LetterOfCreditAmendment | AmendLetterOfCreditDto,
  matchingLetterOfCredit: LetterOfCredit | Partial<LetterOfCredit>,
): Mt707MessageData {
  const mt707MessageData: Mt707MessageData = {
    sessionNumber: generateRandomNumberWithDigits(4),
    sequenceNumber: generateRandomNumberWithDigits(6),
    senderReference: letterOfCreditAmendment?.lcReferenceNumber,
    receiverReference: letterOfCreditAmendment?.receiversReference,
    receiverBIC: letterOfCreditAmendment?.advisingBankBicCode,
    issuingBankReference: letterOfCreditAmendment?.issuingBanksReference,
    issuingBank: SwiftBICEnum.STERLING,
    dateOfIssue: matchingLetterOfCredit?.issueDate,
    dateOfAmendment: letterOfCreditAmendment?.dateOfAmendment,
    purposeOfMessage: letterOfCreditAmendment?.purposeOfMessage,
    amendmentChargePayableBy: letterOfCreditAmendment?.amendmentChargePayableBy,
    currencyCode: letterOfCreditAmendment?.lcCurrencyCode,
  };

  if (
    letterOfCreditAmendment?.formOfDocumentaryCredit !==
    matchingLetterOfCredit?.formOfDocumentaryCredit
  ) {
    mt707MessageData.formOfDocumentaryCredit =
      letterOfCreditAmendment?.formOfDocumentaryCredit;
  }

  if (
    letterOfCreditAmendment?.applicableRules !==
    matchingLetterOfCredit?.applicableRules
  ) {
    mt707MessageData.applicableRules = letterOfCreditAmendment?.applicableRules;
  }

  if (
    lcCalendarDatesDiffer(
      letterOfCreditAmendment?.expiryDate,
      matchingLetterOfCredit?.expiryDate,
    ) ||
    letterOfCreditAmendment?.expiryPlace !== matchingLetterOfCredit?.expiryPlace
  ) {
    mt707MessageData.expiryDate = letterOfCreditAmendment?.expiryDate;
    mt707MessageData.expiryPlace = letterOfCreditAmendment?.expiryPlace;
  }

  if (
    letterOfCreditAmendment?.applicantBankBicCode !==
    matchingLetterOfCredit?.applicantBankBicCode
  ) {
    mt707MessageData.applicantBankBicCode =
      letterOfCreditAmendment?.applicantBankBicCode;
  }

  if (
    letterOfCreditAmendment?.applicantName !==
      matchingLetterOfCredit?.applicantName ||
    letterOfCreditAmendment?.applicantAddress !==
      matchingLetterOfCredit?.applicantAddress
  ) {
    mt707MessageData.applicantName = letterOfCreditAmendment?.applicantName;
    mt707MessageData.applicantAddress =
      letterOfCreditAmendment?.applicantAddress;
  }

  if (
    letterOfCreditAmendment?.lcAmountChange &&
    letterOfCreditAmendment?.lcAmountChange !==
      LetterOfCreditAmountChangeEnum.NONE
  ) {
    if (
      letterOfCreditAmendment?.lcAmountChange ===
      LetterOfCreditAmountChangeEnum.INCREASE
    ) {
      mt707MessageData.increaseOfDocumentaryCreditAmount =
        letterOfCreditAmendment?.lcChangeAmount;
    } else if (
      letterOfCreditAmendment?.lcAmountChange ===
      LetterOfCreditAmountChangeEnum.DECREASE
    ) {
      mt707MessageData.decreaseOfDocumentaryCreditAmount =
        letterOfCreditAmendment?.lcChangeAmount;
    }
  }

  if (
    letterOfCreditAmendment?.beneficiaryName !==
      matchingLetterOfCredit?.beneficiaryName ||
    letterOfCreditAmendment?.beneficiaryAddress !==
      matchingLetterOfCredit?.beneficiaryAddress
  ) {
    mt707MessageData.beneficiaryName = letterOfCreditAmendment?.beneficiaryName;
    mt707MessageData.beneficiaryAddress =
      letterOfCreditAmendment?.beneficiaryAddress;
  }

  if (
    letterOfCreditAmendment?.maxCreditAmountTolerance !==
      matchingLetterOfCredit?.maxCreditAmountTolerance ||
    letterOfCreditAmendment?.minCreditAmountTolerance !==
      matchingLetterOfCredit?.minCreditAmountTolerance
  ) {
    mt707MessageData.maxCreditAmountTolerance = String(
      letterOfCreditAmendment?.maxCreditAmountTolerance,
    );
    mt707MessageData.minCreditAmountTolerance = String(
      letterOfCreditAmendment?.minCreditAmountTolerance,
    );
  }

  if (
    letterOfCreditAmendment?.additionalAmount !==
    matchingLetterOfCredit?.additionalAmount
  ) {
    mt707MessageData.additionalAmountsCovered =
      letterOfCreditAmendment?.additionalAmount;
  }

  if (
    letterOfCreditAmendment?.creditAvailableWith !==
    matchingLetterOfCredit?.creditAvailableWith
  ) {
    mt707MessageData.creditAvailableBankBicCode =
      letterOfCreditAmendment?.creditAvailableWith ===
      CreditAvailableWithEnum.NAMED_BANK
        ? letterOfCreditAmendment?.creditAvailableWithBankSwiftCode
        : SwiftBICEnum.STERLING;
    mt707MessageData.creditAvailableCode =
      letterOfCreditAmendment?.creditAvailableBy;
  }

  if (
    letterOfCreditAmendment?.draftMode !== matchingLetterOfCredit?.draftMode &&
    (letterOfCreditAmendment?.tenorPeriod !==
      matchingLetterOfCredit?.tenorPeriod ||
      letterOfCreditAmendment?.tenorPeriodType !==
        matchingLetterOfCredit?.tenorPeriodType ||
      letterOfCreditAmendment?.maturityDate !==
        matchingLetterOfCredit?.maturityDate)
  ) {
    mt707MessageData.draftsAt =
      letterOfCreditAmendment?.draftMode === DraftModeEnum.TENOR
        ? `${letterOfCreditAmendment?.tenorPeriod} ${letterOfCreditAmendment?.tenorPeriodType}`
        : moment(letterOfCreditAmendment?.maturityDate).format('D MMMM, YYYY');
  }

  if (
    matchingLetterOfCredit?.drawee &&
    letterOfCreditAmendment?.drawee !== matchingLetterOfCredit?.drawee
  ) {
    mt707MessageData.drawee =
      letterOfCreditAmendment?.drawee === DraweeEnum.NAMED_BANK
        ? letterOfCreditAmendment?.draweeBankAddress
        : SwiftBICEnum.STERLING;
  }

  if (
    letterOfCreditAmendment?.mixedPaymentDetails !==
    matchingLetterOfCredit?.mixedPaymentDetails
  ) {
    mt707MessageData.mixedPaymentDetails =
      letterOfCreditAmendment?.mixedPaymentDetails;
  }

  if (
    letterOfCreditAmendment?.paymentDate !==
      matchingLetterOfCredit?.paymentDate ||
    letterOfCreditAmendment?.paymentMethod !==
      matchingLetterOfCredit?.paymentMethod
  ) {
    mt707MessageData.paymentDate = letterOfCreditAmendment?.paymentDate;
    mt707MessageData.paymentMethod = letterOfCreditAmendment?.paymentMethod;
  }

  if (
    letterOfCreditAmendment?.partialShipment !==
    matchingLetterOfCredit?.partialShipment
  ) {
    mt707MessageData.partialShipments =
      letterOfCreditAmendment?.partialShipment;
  }

  if (
    letterOfCreditAmendment?.transShipment !==
    matchingLetterOfCredit?.transShipment
  ) {
    mt707MessageData.transhipment = letterOfCreditAmendment?.transShipment;
  }

  if (
    letterOfCreditAmendment?.placeOfChargeTaken !==
    matchingLetterOfCredit?.placeOfChargeTaken
  ) {
    mt707MessageData.placeOfTakingInChargeDispatchFromPlaceOfReceipt =
      letterOfCreditAmendment?.placeOfChargeTaken;
  }

  if (
    letterOfCreditAmendment?.portOfLoading !==
    matchingLetterOfCredit?.portOfLoading
  ) {
    mt707MessageData.portOfLoadingAirportOfDeparture =
      letterOfCreditAmendment?.portOfLoading;
  }

  if (
    letterOfCreditAmendment?.portOfDischarge !==
    matchingLetterOfCredit?.portOfDischarge
  ) {
    mt707MessageData.portOfDischargeAirportOfDestination =
      letterOfCreditAmendment?.portOfDischarge;
  }

  if (
    letterOfCreditAmendment?.finalDestination !==
    matchingLetterOfCredit?.finalDestination
  ) {
    mt707MessageData.placeOfFinalDestinationForTransportationToPlaceOfDelivery =
      letterOfCreditAmendment?.finalDestination;
  }

  if (
    lcCalendarDatesDiffer(
      letterOfCreditAmendment?.latestShipmentDate,
      matchingLetterOfCredit?.latestShipmentDate,
    )
  ) {
    mt707MessageData.latestDateOfShipment =
      letterOfCreditAmendment?.latestShipmentDate;
  }

  if (
    letterOfCreditAmendment?.shipmentPeriod !==
    matchingLetterOfCredit?.shipmentPeriod
  ) {
    mt707MessageData.shipmentPeriod = letterOfCreditAmendment?.shipmentPeriod;
  }

  if (
    letterOfCreditAmendment?.descriptionOfGoods !==
    matchingLetterOfCredit?.descriptionOfGoods
  ) {
    mt707MessageData.descriptionOfGoodsAndOrServices =
      letterOfCreditAmendment?.descriptionOfGoods;
  }

  if (
    letterOfCreditAmendment?.documentsRequired !==
    matchingLetterOfCredit?.documentsRequired
  ) {
    mt707MessageData.documentsRequired =
      letterOfCreditAmendment?.documentsRequired;
  }

  if (
    letterOfCreditAmendment?.additionalConditions !==
    matchingLetterOfCredit?.additionalConditions
  ) {
    mt707MessageData.additionalConditions =
      letterOfCreditAmendment?.additionalConditions;
  }

  if (
    letterOfCreditAmendment?.specialPaymentConditionsForBeneficiary !==
    matchingLetterOfCredit?.specialPaymentConditionsForBeneficiary
  ) {
    mt707MessageData.specialPaymentConditionsForBeneficiary =
      letterOfCreditAmendment?.specialPaymentConditionsForBeneficiary;
  }

  if (
    letterOfCreditAmendment?.specialPaymentConditionsForBank !==
    matchingLetterOfCredit?.specialPaymentConditionsForBank
  ) {
    mt707MessageData.specialPaymentConditionsForBankOnly =
      letterOfCreditAmendment?.specialPaymentConditionsForBank;
  }

  if (letterOfCreditAmendment?.charges !== matchingLetterOfCredit?.charges) {
    mt707MessageData.charges = letterOfCreditAmendment?.charges;
  }

  if (
    letterOfCreditAmendment?.presentationDays !==
    matchingLetterOfCredit?.presentationDays
  ) {
    mt707MessageData.periodForPresentationInDays =
      letterOfCreditAmendment?.presentationDays;
  }

  if (
    letterOfCreditAmendment?.confirmationInstruction !==
    matchingLetterOfCredit?.confirmationInstruction
  ) {
    mt707MessageData.confirmationInstructions =
      letterOfCreditAmendment?.confirmationInstruction;
  }

  if (
    letterOfCreditAmendment?.requestedConfirmationParty !==
    matchingLetterOfCredit?.requestedConfirmationParty
  ) {
    mt707MessageData.requestedConfirmationParty =
      letterOfCreditAmendment?.requestedConfirmationParty;
  }

  if (
    letterOfCreditAmendment?.reimbursingBankName !==
    matchingLetterOfCredit?.reimbursingBankName
  ) {
    mt707MessageData.reimbursingBank =
      letterOfCreditAmendment?.reimbursingBankBicCode;
  }

  if (
    JSON.stringify(
      letterOfCreditAmendment?.instructionsToThePayingOrAcceptingOrNegotiatingBank ??
        [],
    ) !==
    JSON.stringify(
      matchingLetterOfCredit?.instructionsToThePayingOrAcceptingOrNegotiatingBank ??
        [],
    )
  ) {
    mt707MessageData.instructionsToThePayingAcceptingNegotiatingBank =
      letterOfCreditAmendment?.instructionsToThePayingOrAcceptingOrNegotiatingBank;
  }

  if (
    letterOfCreditAmendment?.adviseThroughBankName !==
    matchingLetterOfCredit?.adviseThroughBankName
  ) {
    mt707MessageData.adviseThroughBank =
      letterOfCreditAmendment?.adviseThroughBankBicCode;
  }

  if (
    letterOfCreditAmendment?.senderToReceiverInformation !==
    matchingLetterOfCredit?.senderToReceiverInformation
  ) {
    mt707MessageData.senderToReceiverInformation =
      letterOfCreditAmendment?.senderToReceiverInformation;
  }

  return mt707MessageData;
}
