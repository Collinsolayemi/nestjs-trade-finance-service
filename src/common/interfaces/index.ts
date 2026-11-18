import { Request } from 'express';
import {
  AccountAccessRestrictionTypeEnum,
  RulesConfigurationAttributeRelationshipEnum,
  ChargesAndTaxesAmountTypeEnum,
  TaxTypeEnum,
  CompareTaxParameterEnum,
  ChargeTypeEnum,
  TransactionSubSourceEnum,
  ChargeAmountFieldEnum,
  EntryPartyEnum,
  TradeAccountTypeEnum,
  MarginTypeEnum,
  ContingencyTypeEnum,
  PostingAmountFieldEnum,
  LetterOfCreditFreeFormaSwifttMessageTypeEnum,
  BillsForCollectionFreeFormaSwifttMessageTypeEnum,
  RulesConfigurationAttributeFieldTypeEnum,
  RulesConfigurationOperatorEnum,
  RulesConfigurationCompareWithEnum,
  RulesConfigurationProductTypeEnum,
} from '../enums';
import { MixedPaymentDto } from 'src/modules/letter-of-credit/dto/mixed-payment.dto';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    firstname: string;
    lastname: string;
    branch: string;
    tenant: string;
    department: string;
    user_permissions: [];
  };
}

export interface Mt202MessageData {
  sessionNumber: string;
  sequenceNumber: string;
  senderBIC: string;
  receiverBIC: string;
  uniqueID: string;
  transactionReference: string;
  valueDate: string;
  currencyCode: string;
  amount: number;
  orderingInstituionAccount?: string;
  orderingInstituionBicCode?: string;
  sendersCorrespondentAccount?: string;
  sendersCorrespondentBicCode?: string;
  receiversCorrespondentAccount?: string;
  receiversCorrespondentBicCode?: string;
  intermediaryAccount?: string;
  intermediaryBicCode?: string;
  accountWithInstituitionAccount?: string;
  accountWithInstituitionBicCode?: string;
  beneficiaryAccount?: string;
  beneficiaryBankSwiftCode?: string;
  senderToReceiverInformation?: string;
}

export interface Mt730MessageData {
  sessionNumber: string;
  sequenceNumber: string;
  senderBIC: string;
  receiverBIC: string;
  uniqueID: string;
  sendersReference: string;
  receiversReference: string;
  dateOfMessageBeingAcknowledged: string;
  accountIdentification?: string;
  amountOfCharges?: string;
  accountWithBankBic?: string;
  accountWithBankAccount?: string;
  charges?: string;
  senderToReceiverInformation?: string;
  narrative?: string;
}

export interface Mt752MessageData {
  sessionNumber: string;
  sequenceNumber: string;
  senderBIC: string;
  receiverBIC: string;
  uniqueID: string;
  documentaryCreditNumber: string;
  presentingBankReference: string;
  furtherIdentification: string;
  dateOfAdviceOfDiscrepancyOrMailing: string;
  totalAmountAdvisedCurrency?: string;
  totalAmountAdvised?: number;
  chargesDeductedCurrency?: string;
  chargesDeductedAmount?: number;
  netAmountCurrency?: string;
  netAmount?: number;
  paymentDueDate?: Date;
  sendersCorrespondentAccount?: string;
  sendersCorrespondentBIC?: string;
  receiversCorrespondentAccount?: string;
  receiversCorrespondentBIC?: string;
  senderToReceiverInformation?: string;
  narrative?: string;
}

export interface Mtn99MessageData {
  sessionNumber: string;
  sequenceNumber: string;
  senderBIC: string;
  receiverBIC: string;
  swiftMessageType:
    | LetterOfCreditFreeFormaSwifttMessageTypeEnum
    | BillsForCollectionFreeFormaSwifttMessageTypeEnum;
  uniqueID: string;
  transactionReference: string;
  relatedReference: string;
  narrative: string[];
}

export interface Mt700MessageData {
  formOfDocumentaryCredit: string;
  documentaryCreditNumber: string;
  preAdviceReferenceNumber: string;
  issueDate: Date;
  applicableRules: string;
  expiryDate: Date;
  expiryPlace: string;
  applicantBankBicCode: string;
  applicantName: string;
  applicantAddress: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  currencyCode: string;
  amount: number;
  minCreditAmountTolerance: number;
  maxCreditAmountTolerance: number;
  additionalAmountsCovered: string;
  creditAvailableBankBicCode: string;
  creditAvailableCode: string;
  draftsAt?: string;
  drawee?: string;
  mixedPaymentDetails?: MixedPaymentDto[];
  paymentDate?: Date;
  paymentMethod?: string;
  partialShipment: string;
  transShipment: string;
  placeOfTakingInChargeOrDispatchFromOrPlaceOfReceipt?: string;
  portOfLoading: string;
  portOfDischarge: string;
  placeOfFinalDestinationOrForTransportationToOrPlaceOfDelivery?: string;
  latestDateOfShipment: Date;
  shipmentPeriod: string;
  descriptionOfGoods: string;
  documentsRequired: string;
  additionalConditions: string;
  specialPaymentConditionsForBeneficiary?: string;
  specialPaymentConditionsForBankOnly?: string;
  charges: string;
  presentationDays: string;
  confirmationInstructions: string;
  requestedConfirmationParty: string;
  reimbursingBank: string;
  instructionsToThePayingAcceptingNegotiatingBank: string[];
  adviseThroughBank: string;
  senderToReceiverInformation: string;
  senderBIC?: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}

export interface Mt707MessageData {
  senderReference: string;
  receiverReference: string;
  issuingBankReference: string;
  dateOfIssue: Date;
  numberOfAmendment?: string;
  dateOfAmendment: Date;
  purposeOfMessage: string;
  issuingBank?: string;
  nonBankIssuer?: string;
  cancellationRequest?: string;
  formOfDocumentaryCredit?: string;
  applicableRules?: string;
  expiryDate?: Date;
  expiryPlace?: string;
  applicantBankBicCode?: string;
  applicantName?: string;
  applicantAddress?: string;
  beneficiaryName?: string;
  beneficiaryAddress?: string;
  currencyCode?: string;
  amount?: string;
  increaseOfDocumentaryCreditAmount?: number;
  decreaseOfDocumentaryCreditAmount?: number;
  minCreditAmountTolerance?: string;
  maxCreditAmountTolerance?: string;
  additionalAmountsCovered?: string;
  creditAvailableBankBicCode?: string;
  creditAvailableCode?: string;
  draftsAt?: string;
  drawee?: string;
  mixedPaymentDetails?: MixedPaymentDto[];
  paymentDate?: Date;
  paymentMethod?: string;
  partialShipments?: string;
  transhipment?: string;
  placeOfTakingInChargeDispatchFromPlaceOfReceipt?: string;
  portOfLoadingAirportOfDeparture?: string;
  portOfDischargeAirportOfDestination?: string;
  placeOfFinalDestinationForTransportationToPlaceOfDelivery?: string;
  latestDateOfShipment?: Date;
  shipmentPeriod?: string;
  descriptionOfGoodsAndOrServices?: string;
  documentsRequired?: string;
  additionalConditions?: string;
  specialPaymentConditionsForBeneficiary?: string;
  specialPaymentConditionsForBankOnly?: string;
  charges?: string;
  amendmentChargePayableBy?: string;
  periodForPresentationInDays?: string;
  confirmationInstructions?: string;
  requestedConfirmationParty?: string;
  reimbursingBank?: string;
  instructionsToThePayingAcceptingNegotiatingBank?: string[];
  adviseThroughBank?: string;
  senderToReceiverInformation?: string;
  senderBIC?: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}

export interface Mt410MessageData {
  sendingBanksTRN: string;
  relatedReference: string;
  amountAcknowledged: number;
  currencyCode: string;
  senderToReceiverInformation: string;
  senderBIC: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}
export interface Mt412MessageData {
  sendingBanksTRN: string;
  relatedReference: string;
  maturityDate: Date;
  currencyCode: string;
  amountAccepted: number;
  senderToReceiverInformation: string;
  senderBIC: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}

export interface Mt416MessageData {
  sendingBanksTRN: string;
  relatedReference: string;
  currencyCode: string;
  amountAccepted: number;
  senderToReceiverInformation: string;
  senderBIC: string;
  receiverBIC: string;
}

export interface Mt420MessageData {
  sendingBanksTRN: string;
  relatedReference: string;
  amountTraced: number;
  currencyCode: string;
  dateOfCollectionInstruction: Date;
  senderToReceiverInformation: string;
  senderBIC: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}

export interface Mt422MessageData {
  sendingBanksTRN: string;
  relatedReference: string;
  amountOfCollection: number;
  currencyCode: string;
  queries: string;
  answers: string;
  senderToReceiverInformation: string;
  senderBIC: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}

export interface Mt430MessageData {
  sendingBanksTRN: string;
  relatedReference: string;
  currencyCode: string;
  amountAccepted: number;
  senderToReceiverInformation: string;
  senderBIC: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}

export interface Mt754MessageData {
  senderReference: string;
  relatedReference: string;
  principalAmountPaidAcceptedNegotiated: number;
  currencyCode: string;
  additionalAmounts: number;
  chargesDeductedAmount: number;
  chargesDeductedCurrency: string;
  chargesAddedAmount: number;
  chargesAddedCurrency: string;
  totalAmountClaimed: number;
  totalAmountClaimedCurrency: string;
  reimbursingBankBicCode: string;
  reimbursingBankAccount: string;
  accountWithBankBicCode: string;
  accountWithBankAccount: string;
  beneficiaryBankBicCode: string;
  beneficiaryBankAccount: string;
  senderToReceiverInformation: string;
  narrative: string;
  senderBIC: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}

export interface Mt756MessageData {
  senderReference: string;
  presentingBankReference: string;
  totalAmountClaimedCurrency: string;
  totalAmountClaimed: number;
  amountReimbursedOrPaidCurrency: string;
  amountReimbursedOrPaid: number;
  sendersCorrespondentAccount: string;
  sendersCorrespondentBIC: string;
  receiversCorrespondentAccount: string;
  receiversCorrespondentBIC: string;
  senderToReceiverInformation: string;
  narrative: string;
  senderBIC: string;
  receiverBIC: string;
  sessionNumber: string;
  sequenceNumber: string;
}
export interface AccountRestriction {
  accessType: AccountAccessRestrictionTypeEnum;
  accessValuesList: { name: string; id: string }[];
}

export interface AccountRestrictionResponse {
  filtered: number;
  firstPage: string;
  nextPage: string | null;
  previousPage: string | null;
  lastPage: string;
  total: number;
  totalPages: number;
  value: AccountRestriction[];
  requestId: string | null;
  errorMessage: string | null;
  errors: Record<string, any>;
  hasError: boolean;
  responseCode: string;
  responseDescription: string;
  requestTime: string;
  responseTime: string;
  activityTime: number;
  isSuccess: boolean;
}

export interface AccountEnquiry {
  accountId: number;
  accountUUID: string;
  sweepAccount: string;
  sweepFrequencyPeriod: string;
  sweepFrequencyValue: number;
  isContraAccount: boolean;
  relatedLedgerForContraAccount: string;
  customerId: string;
  jointSignatories: any[];
  isJointAccount: boolean;
  accountCode: string;
  accountName: string;
  accountNo: string;
  accountNoAlias: string;
  postedBy: string;
  accountDescription: string | null;
  nin: string;
  isLocked: boolean;
  accountNoAliasIndex: number;
  accountStatus: number;
  isVault: boolean;
  accountCategory: number;
  dateOpened: string;
  dateClosed: string | null;
  branchCode: string;
  availableBalance: number;
  ledgerBalance: number;
  email: string;
  unClearedBalance: number;
  clearedBalance: number;
  lienAmount: number;
  offBalanceSheet: boolean;
  availableToAllBranches: boolean;
  phoneNumber: string;
  bvn: string;
  overDraftLimit: number;
  isReplicated: boolean;
  accountGroup: string;
  freezeCode: string;
  currencyCode: string;
  tenantId: string;
  initiator: string;
  approvedBy: string;
  isReplicable: boolean;
  isReplicate: boolean;
  isRestricted: boolean;
  replicatedFrom: string;
  branchCodeOfInitiator: string;
  branchCodeOfApprover: string;
  isProductLedger: boolean;
  isSystemEntryOnly: boolean;
  enableSmsAlert: boolean;
  enableEmailAlert: boolean;
  enableMonthlyStatement: boolean;
  enableAnnualStatement: boolean;
  currentInterestRate: number;
  lastModifiedDate: string;
  transactionNote: string;
  lcyBalance: number;
  lastModifiedTime: string;
  accountPosition: any | null;
  subLedgerCode: string;
  hasConcession: boolean;
  productId: string;
  accountType: string;
  hasBreach: boolean;
  subLedgerId: string;
  parentLedgerCode: string;
  parentLedgerId: string;
  primaryRelationshipManager: string;
  secondaryRelationshipManager: string;
  parentLedgerName: string;
  isCollectionAccount: boolean;
  isHighVolumeTransation: boolean;
  isOfficeAccount: boolean;
  minBalance: number;
  maxBalance: number;
  maxDailyCredit: number;
  maxDailyDebit: number;
  maxOneTimeDebit: number;
  channelId: string;
  accountFactor: string;
}

export interface AccountEnquiryResponse {
  totalCount: number | null;
  accountTypesCount: null;
  totalBalance: null;
  value: AccountEnquiry;
  requestId: string | null;
  errorMessage: string | null;
  message: string;
  hasError: boolean;
  responseCode: string;
  responseDescription: string;
  requestTime: string;
  responseTime: string;
  activityTime: number;
  isSuccess: boolean;
  pageNumber: number | null;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PostJournal {
  requestId: string;
  currencyCode: string;
  initiatedBy: string;
  approvedBy: string;
  initiatedByBranchCode: string;
  approvedByBranchCode: string;
  approvedDate: string;
  initiatedDate: string;
  multipleDebit: number;
  valueDate: string;
  isChequeClearing?: boolean;
  reconciliationRemarks: string;
  isoReference?: string;
  isFuture: boolean;
  exchangeRate?: number;
  isCrossCurrency: boolean;
  contractId?: string;
  iswReference?: string;
  maskedPan?: string;
  authorizationCode?: string;
  daoCode?: string;
  transactionCategory: number;
  transactionSource: number;
  transactionSubSource: number;
  thirdPartySource: string;
  waveCharge?: boolean;
  channelId?: string;
  creditEntries: CreditEntry[];
  debitEntries: DebitEntry[];
}

export interface CreditEntry {
  creditAccountNumber: string;
  creditAmount: number;
  creditNarration: string;
}

export interface DebitEntry {
  debitAccountNumber: string;
  debitAmount: number;
  debitNarration: string;
}

export interface PostJournalReversal {
  transactionId: string;
  modifiedBy: string;
}

export interface PostBulkJournalReversal {
  batchId: string;
  modifiedBy: string;
  transactions: TransactionReversal[];
}

export interface TransactionReversal {
  transactionId: string;
}

export interface TaxValue {
  created_by_id: string;
  created_by: string;
  last_modified_by_id: string | null;
  last_modified_by: string | null;
  deleted_at: string | null;
  tenant_id: string | null;
  branch: string | null;
  tax_value_id: string;
  tax_id: string;
  tax_type: TaxTypeEnum;
  tax_amount: string;
  tax_interval: boolean;
  tax_interval_value: string;
  tax_amount_type: ChargesAndTaxesAmountTypeEnum;
  compare_tax_parameter: CompareTaxParameterEnum | null;
  minimum_transaction_value: string | null;
  maximum_transaction_value: string | null;
  compare_tax_percentage_value: string | null;
  compare_tax_currency_value: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxImpactedLedger {
  created_by_id: string;
  created_by: string;
  last_modified_by_id: string | null;
  last_modified_by: string | null;
  deleted_at: string | null;
  tenant_id: string | null;
  branch: string | null;
  tax_impacted_ledger_id: string;
  tax_id: string;
  gl_class: string;
  ledger_id: string;
  ledger_name: string;
  ledger_code: string;
  balance_impact: string;
  allocation: string;
  created_at: string;
  updated_at: string;
}

export interface TaxData {
  created_by_id: string;
  created_by: string;
  last_modified_by_id: string | null;
  last_modified_by: string | null;
  deleted_at: string | null;
  tenant_id: string;
  branch: string;
  tax_id: string;
  tax: number | null;
  tax_request_id: string;
  name: string;
  code: string;
  abbreviation: string;
  currency: string;
  currency_id: string;
  description: string;
  state: string;
  hasPendingRequest: boolean;
  justification: string | null;
  supporting_document_key: string | null;
  team_name: string | null;
  team_id: string | null;
  approver_name: string;
  approver_id: string;
  approver_branch: string | null;
  created_at: string;
  updated_at: string;
  tax_values: TaxValue[];
  tax_impacted_ledgers: TaxImpactedLedger[];
}

export interface TaxEntry {
  tax_name: string;
  tax: number;
  tax_impacted_ledgers: TaxImpactedLedger | TaxImpactedLedger[];
}

export interface ChargeValue {
  created_by_id: string;
  created_by: string;
  last_modified_by_id: string | null;
  last_modified_by: string | null;
  deleted_at: string | null;
  tenant_id: string | null;
  branch: string | null;
  charge_value_id: string;
  charge_type: ChargeTypeEnum;
  charge_amount: string;
  charge_interval: boolean;
  charge_interval_value: string;
  charge_amount_type: ChargesAndTaxesAmountTypeEnum;
  compare_charge_parameter: string | null;
  minimum_transaction_value: string | null;
  maximum_transaction_value: string | null;
  compare_charge_percentage_value: string | null;
  compare_charge_currency_value: string | null;
  created_at: string;
  updated_at: string;
  charge_id: string;
}

export interface ChargeImpactedLedger {
  created_by_id: string;
  created_by: string;
  last_modified_by_id: string | null;
  last_modified_by: string | null;
  deleted_at: string | null;
  tenant_id: string | null;
  branch: string | null;
  charge_impacted_ledger_id: string;
  ledger_reporting_method: string | null;
  charge_collection_method: string | null;
  charge_impacted_ledgers: any | null;
  capitalization_period: string | null;
  custom_period: string | null;
  custom_period_value: string | null;
  charge_accural_ledgers: any | null;
  charge_capitalization_ledgers: any | null;
  is_expense: boolean | null;
  charge_expense_ledgers: any | null;
  created_at: string;
  updated_at: string;
  charge_id: string;
}

export interface ChargeApplicableTax {
  tax_id: string;
}

export interface ChargeData {
  created_by_id: string;
  created_by: string;
  last_modified_by_id: string | null;
  last_modified_by: string | null;
  deleted_at: string | null;
  tenant_id: string;
  branch: string;
  charge_id: string;
  name: string;
  code: string;
  justification: string | null;
  currency_id: string;
  currency: string;
  multi_currency: string | null;
  recently_updated_column: string | null;
  description: string;
  state: string;
  hasPendingRequest: boolean;
  approver: string;
  approver_id: string;
  approver_branch: string | null;
  effective_date_isConfigured: boolean;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
  request_id: string;
  charge_value: ChargeValue[];
  charge_impacted_ledgers: ChargeImpactedLedger[];
  charge_applicable_tax: ChargeApplicableTax[];
}

export interface ChargeObject {
  charge_name: string;
  charge: number;
  charge_impacted_ledger: any;
  charge_applicable_tax: any[];
  code: string;
  charge_value: ChargeValue;
  chargeApplicableTaxLedgerEntries?: any[];
}

export interface ChargeLedger {
  ledger: string;
  ledger_code: string;
  amount: number;
  tax_name?: string;
}

export interface ApplicableTaxLedgerEntry {
  chargeApplicableTaxDebitLedgers: ChargeLedger[];
  chargeApplicableTaxCreditLedgers: ChargeLedger[];
}

export interface CreateJournalPostingRequestBody {
  debitAccount?: string;
  transactionAmount?: number;
  creditAccount?: string;
  userId: string;
  branchCode: string;
  currencyShortCode: string;
  isCrossCurrency?: boolean;
  daoCode?: string | null;
  requestId: string;
  reconciliationRemarks?: string | null;
  creditEntries: CreditEntry[];
  debitEntries: DebitEntry[];
  initiatedBy: string;
  approvedByBranchCode: string;
  narration?: string | null;
  transactionSubSource?: TransactionSubSourceEnum;
  waveCharge?: boolean;
  exchangeRate?: number;
}

export interface CreateLoanBookingRequestBody {
  accountForPrincipal: string;
  accountForInterest?: string;
  currencyCode: string;
  dealDate: Date | string;
  valueDate: Date | string;
  initiator?: string;
  initiatorBranchCode: string;
  interestRate: number;
  productId: string;
  productName?: string;
  principalAmount: number;
  purpose: string;
  tenantId: string;
  tenor: number;
  accountName: string;
  accountNo: string;
  customerId: string;
}

export interface Currency {
  id: string;
  name: string;
  abbreviation: string;
  exchange_rate: string;
}

export interface GetAllCurrenciesResponse {
  success: boolean;
  detail: string;
  data: {
    id: string;
    name: string;
    abbreviation: string;
    exchange_rate: string;
    [key: string]: any;
  }[];
}

export interface GetRecordsResponse {
  page: number;
  totalPages: number;
  totalRecords: number;
  size: number;
}

export interface TradeGovSingleWindowResponse {
  data?: FormMDocument[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface TrmsFormNXPApplicationResponse {
  content: TrmsFormNXPApplication[];
  pageable: TrmsPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  sort: TrmsSort;
  numberOfElements: number;
  size: number;
  number: number;
}

export interface TrmsFormNCXApplicationResponse {
  content: TrmsFormNCXApplication[];
  pageable: TrmsPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  sort: TrmsSort;
  numberOfElements: number;
  size: number;
  number: number;
}

export interface TrmsFormAApplicationResponse {
  content: TrmsFormAApplication[];
  pageable: TrmsPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  sort: TrmsSort;
  numberOfElements: number;
  size: number;
  number: number;
}

export interface TrmsFormNXPApplication {
  statusCode: string;
  currencyCode: string | null;
  status: string | null;
  applicationNumber: string;
  formNumber: string | null;
  currentStageDate: number;
  exchangeRateApplicantCurrency: number | null;
  createdAt: number;
  exchangeRate: number | null;
  updatedAt: number;
  processingBankCode: string | null;
  designatedBankCode: string | null;
  applicantName: string;
  applicantId: number;
  initialShipmentNessLevyPayable: number | null;
  initialShipmentTotalQuantity: number | null;
  initialShipmentTotalDollarFoB: number | null;
  processingBankId: number | null;
  processingBankName: string | null;
  designatedBankId: number | null;
  designatedBankName: string | null;
  processingBankBranchName: string;
  id: number;
}
export interface TrmsFormNCXApplication {
  statusCode: string;
  currencyCode: string | null;
  status: string | null;
  applicationNumber: string;
  formNumber: string | null;
  currentStageDate: number;
  exchangeRateApplicantCurrency: number | null;
  createdAt: number;
  exchangeRate: number | null;
  updatedAt: number;
  processingBankCode: string | null;
  designatedBankCode: string | null;
  applicantName: string;
  applicantId: number;
  initialShipmentNessLevyPayable: number | null;
  initialShipmentTotalQuantity: number | null;
  initialShipmentTotalDollarFoB: number | null;
  processingBankId: number | null;
  processingBankName: string | null;
  designatedBankId: number | null;
  designatedBankName: string | null;
  processingBankBranchName: string;
  id: number;
}

export interface TrmsFormAApplication {
  currencyCode: string;
  statusCode: string;
  id: number;
  status: string | null;
  formNumber: string | null;
  currentStageDate: number;
  applicationNumber: string;
  amendmentInit: boolean | null;
  createdAt: number;
  totalAmountDisbursed: number | null;
  updatedAt: number;
  formNumberSerial: string | null;
  transactionPurposeCode: string | null;
  applicantName: string;
  applicantId: number;
  processingBankBranchName: string;
  approvingStakeholderId: number | null;
  approvingStakeholderCode: string | null;
  approvingStakeholderName: string | null;
}

export interface TrmsPageable {
  sort: TrmsSort;
  pageSize: number;
  pageNumber: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface TrmsSort {
  sorted: boolean;
  unsorted: boolean;
}

export interface TrmsFormNXPDetails {
  id: number;
  createdAt: number;
  updatedAt: number;
  archivedAt: number | null;
  contact: {
    id: number;
    name: string;
    emailAddress: string | null;
    phone: string | null;
    address: string | null;
    taxIdentificationNumber: string | null;
    rcNumber: string | null;
  };
  tin: string | null;
  year: number;
  formType: string;
  statusCode: string;
  status: string;
  applicationNumber: string;
  lastApplicationNumber: string | null;
  formNumber: string | null;
  formNumberSerial: string | null;
  cancellationNumberSerial: string | null;
  extensionNumberSerial: string | null;
  formNumberAssignedDate: number | null;
  amendmentNumberSerial: string | null;
  amendmentInit: boolean;
  cancelled: boolean;
  isDeleted: boolean;
  expireAt: number;
  expiryPeriod: number;
  dateSubmitted: number;
  activeProcess: boolean;
  currentStageDate: number | null;
  processReset: boolean;
  currentPVSVersion: string | null;
  consigneeName: string;
  consigneeEmail: string;
  consigneePhone: string;
  consigneeAddressLine1: string;
  consigneeAddressLine2: string | null;
  consigneeAddressCity: string;
  consigneeAddressState: string;
  consigneeCountry: {
    id: number;
    name: string;
    code: string;
    code3: string | null;
  };
  byOrderOf: string | null;
  nepcNumber: string | null;
  cacNumber: string | null;
  licenseNumber: string | null;
  rcNumber: string;
  accountNumber: string;
  accountNumberPreAmend: string | null;
  processingFeeAccountNumber: string;
  processingFeeAccountNumberPreAmend: string | null;
  sector: string;
  numOfItemsExpected: number;
  exchangeRate: number;
  exchangeRateApplicantCurrency: number;
  totalNetWeight: number;
  totalNetWeightExporter: number | null;
  ncsTotalNetWeight: number | null;
  meaTotalNetWeight: number | null;
  totalGrossWeight: number;
  totalGrossWeightExporter: number | null;
  ncsTotalGrossWeight: number | null;
  meaTotalGrossWeight: number | null;
  totalQuantity: number;
  totalQuantityExporter: number | null;
  ncsTotalQuantity: number | null;
  meaTotalQuantity: number | null;
  dprTotalQuantity: number | null;
  totalCF: number;
  totalFreightCharges: number;
  totalFoB: number;
  totalFoBExporter: number | null;
  totalDollarFoBExporter: number | null;
  totalDollarFoB: number;
  nessLevyPayable: number;
  nessLevyPaymentPercent: number | null;
  shipmentsCompleted: boolean;
  endShipmentsRequestApproved: boolean;
  endShipmentsRequestDate: number | null;
  endShipmentsRequestReason: string | null;
  designatedBank: {
    id: number;
    name: string;
    code: string;
  } | null;
  designatedBankPreAmend: any | null;
  processingBank: {
    id: number;
    name: string;
    code: string;
  } | null;
  processingBankPreAmend: any | null;
  processingBankBranch: {
    id: number;
    code: string;
    name: string;
    emailAddress: string | null;
    phone: string | null;
    bankCode: string | null;
  } | null;
  processingBankBranchPreAmend: any | null;
  country: {
    id: number;
    name: string;
    code: string;
    code3: string | null;
  } | null;
  countryPreAmend: any | null;
  countryExporter: any | null;
  inspectionLocation: {
    id: number;
    code: string;
    name: string;
    description: string | null;
  } | null;
  inspectionLocationPreAmend: any | null;
  transportationMode: {
    id: number;
    code: string;
    name: string;
    description: string | null;
  } | null;
  transportationModePreAmend: any | null;
  portShipment: {
    id: number;
    code: string;
    name: string;
    location: string | null;
    transportationMode: any | null;
  } | null;
  portShipmentPreAmend: any | null;
  loadingTerminal: any | null;
  loadingTerminalPreAmend: any | null;
  currency: {
    id: number;
    code: string;
    name: string;
    sellRate: number;
    buyRate: number | null;
    description: string | null;
    exchangeRateDate: number | null;
    currencyMarket: number;
    midRevalRate: number;
    country: any | null;
    exchangeRate: number | null;
    exchangeRateApplicantCurrency: number | null;
  } | null;
  currencyPreAmend: any | null;
  paymentMode: {
    id: number;
    code: string;
    name: string;
  } | null;
  paymentModePreAmend: any | null;
  pia: {
    id: number;
    name: string;
    code: string;
  } | null;
  piaPreAmend: any | null;
  ncs: {
    id: number;
    name: string;
    code: string;
    address: string | null;
  } | null;
  ted: {
    id: number;
    name: string;
    code: string;
    address: string | null;
  } | null;
  monitoringMea: {
    id: number;
    name: string;
    code: string;
    emailAddress: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  monitoringMeaPreAmend: any | null;
  tempShippingLine: {
    id: number;
    name: string;
    code: string;
  } | null;
  tempShippingLinePreAmend: any | null;
  dpr: {
    id: number;
    name: string;
    code: string;
    address: string | null;
  } | null;
  nonInspectionReasons: any[];
  pvsResponses: any[];
  failedInspections: any[];
  permits: Array<{
    id: number;
    permitNumber: string;
    permit: {
      id: number;
      name: string;
      description: string | null;
      stakeholder: any | null;
      deleted: boolean;
    };
    file: {
      id: number;
      fileId: string;
      fileName: string;
      diskFileName: string;
      label: string | null;
      mimeType: string;
      deleted: boolean;
    } | null;
    validationStatus: string | null;
    formId: number;
    deleted: boolean;
  }>;
  attachments: Array<{
    id: number;
    entity: string | null;
    entityId: number | null;
    file: {
      id: number;
      fileId: string;
      fileName: string;
      diskFileName: string;
      label: string | null;
      mimeType: string;
      deleted: boolean;
    };
  }>;
  extension1PreStatusCode: string | null;
  extension1ExpirationDate: number | null;
  extension1Number: string | null;
  extension1Reason: string | null;
  extension1Init: boolean;
  extension1Complete: boolean;
  extension1RequestDate: number | null;
  extension1CompletedDate: number | null;
  dueExtension1: boolean;
  extension2PreStatusCode: string | null;
  extension2ExpirationDate: number | null;
  extension2Number: string | null;
  extension2Reason: string | null;
  extension2Init: boolean;
  extension2Complete: boolean;
  extension2RequestDate: number | null;
  extension2CompletedDate: number | null;
  dueExtension2: boolean;
  preCancellationRequestStatus: string | null;
  cancellationNumber: string | null;
  cancellationReason: string | null;
  cancellationInit: boolean;
  cancellationComplete: boolean;
  cancellationRequestDate: number | null;
  cancellationCompletedDate: number | null;
  initialShipment: {
    id: number;
    totalNetWeight: number;
    totalGrossWeight: number;
    totalQuantity: number;
    totalCF: number;
    totalFreightCharges: number;
    totalFoB: number;
    totalDollarFoB: number;
    portDestination: {
      id: number;
      name: string;
      code: string;
      country: {
        id: number;
        name: string;
        code: string;
        code3: string | null;
      };
    } | null;
    items: Array<{
      id: number;
      unitPrice: number;
      quantity: number;
      netWeight: number;
      grossWeight: number;
      foB: number;
      dollarFoB: number;
      frightCharge: number;
      description: string;
      hsCode: {
        id: number;
        code: string;
        name: string;
        description: string | null;
        sector: string | null;
        subCategory: string | null;
        permits: any[];
        banned: boolean;
      } | null;
      unitOfMeasurement: {
        id: number;
        code: string;
        name: string;
      } | null;
      packagingMode: {
        id: number;
        code: string;
        name: string;
        description: string | null;
      } | null;
      sectoralPurpose: {
        id: number;
        code: string;
        name: string;
      } | null;
    }>;
  } | null;
  shipmentTmp: any | null;
  shipments: any[];
  lockedBy: any | null;
  amendments: any[];
  workflowNotes: Array<{
    id: number;
    applicationStatusCode: string;
    noteTitle: string | null;
    noteDescription: string | null;
    deleted: boolean;
  }>;
  preAmendmentRequestStatus: string | null;
  amendmentNumber: string | null;
  amendmentReason: string | null;
  amendmentComplete: boolean;
  amendmentRequestDate: number | null;
  amendmentCompletedDate: number | null;
  amendmentAttachments: any[];
  amendmentHistory: any | null;
  einvoice: any | null;
  oilExport: boolean;
}

export interface TrmsFormNCXDetails {
  id: number;
  createdAt: number;
  updatedAt: number;
  archivedAt: number | null;
  contact: {
    id: number;
    name: string;
    emailAddress: string | null;
    phone: string | null;
    address: string | null;
    taxIdentificationNumber: string | null;
    rcNumber: string | null;
  };
  tin: string | null;
  year: number;
  formType: string;
  statusCode: string;
  status: string;
  applicationNumber: string;
  lastApplicationNumber: string | null;
  formNumber: string | null;
  formNumberSerial: string | null;
  cancellationNumberSerial: string | null;
  extensionNumberSerial: string | null;
  formNumberAssignedDate: number | null;
  amendmentNumberSerial: string | null;
  amendmentInit: boolean;
  cancelled: boolean;
  isDeleted: boolean;
  expireAt: number;
  expiryPeriod: number;
  dateSubmitted: number;
  activeProcess: boolean;
  currentStageDate: number | null;
  processReset: boolean;
  currentPVSVersion: string | null;
  consigneeName: string;
  consigneeEmail: string;
  consigneePhone: string;
  consigneeAddressLine1: string;
  consigneeAddressLine2: string | null;
  consigneeAddressCity: string;
  consigneeAddressState: string;
  consigneeCountry: {
    id: number;
    name: string;
    code: string;
    code3: string | null;
  };
  byOrderOf: string | null;
  nepcNumber: string | null;
  cacNumber: string | null;
  licenseNumber: string | null;
  rcNumber: string;
  accountNumber: string;
  accountNumberPreAmend: string | null;
  processingFeeAccountNumber: string;
}

export interface TrmsFormAStakeholderContact {
  id: number;
  createdAt: number | null;
  updatedAt: number | null;
  archivedAt: number | null;
  name: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  code: string | null;
  description: string | null;
  enabled: boolean;
  underEmbargo: boolean;
  licenseExpiryDate: number | null;
  licenseStatus: string | null;
  deleted: boolean;
  emailAddress: string | null;
  emailAddress2: string | null;
  phone: string | null;
  address: string | null;
  passportNumber: string | null;
  bvn: string | null;
  rcNumber: string | null;
  licenseNumber: string | null;
  nepcRegistrationNumber: string | null;
  taxIdentificationNumber: string | null;
  jobRole: string | null;
  type: string | null;
  organizationType: string | null;
  accountCategory: string | null;
  designatedBank: boolean;
  contactOrganization: any | null;
  user: any | null;
  lga: any | null;
  createdBy: any | null;
  sector: any | null;
}

export interface TrmsFormADetails {
  id: number;
  createdAt: number;
  updatedAt: number | null;
  archivedAt: number | null;
  contact: TrmsFormAStakeholderContact;
  validForForex: number;
  year: number;
  applicationNumber: string;
  lastApplicationNumber: string | null;
  formNumber: string | null;
  formNumberSerial: string | null;
  cancellationNumberSerial: string | null;
  dateSubmitted: number;
  sectorCode: string | null;
  status: string;
  statusCode: string;
  formType: string;
  applicantType: string;
  cciNumber: string | null;
  cancelled: boolean | null;
  cancelledAt: number | null;
  expireAt: number;
  expiryPeriod: number | null;
  isDeleted: boolean;
  processingFeeAccountNumber: string;
  processingFeeAccountNumberPreAmend: string | null;
  rejectionStakeholder: any | null;
  activeProcess: boolean;
  currentStageDate: number | null;
  processReset: boolean | null;
  paymentMode: {
    id: number;
    createdAt: number | null;
    updatedAt: number | null;
    archivedAt: number | null;
    code: string;
    name: string;
  } | null;
  paymentModePreAmend: any | null;
  exchangeRate: number | null;
  approvedDate: number | null;
  applicantName: string;
  applicantPhone: string | null;
  applicantEmail: string;
  applicantTINBVN: string;
  applicantRcNumber: string | null;
  applicantAddress: string;
  transactionPurpose: {
    id: number;
    createdAt: number | null;
    updatedAt: number | null;
    archivedAt: number | null;
    code: string;
    name: string;
    typeId: number;
    description: string | null;
    beneficiaryType: string;
    limitAmount: number | null;
    attachments: any | null;
    tradeCategory: {
      id: number;
      createdAt: number | null;
      updatedAt: number | null;
      archivedAt: number | null;
      code: string;
      name: string;
      description: string | null;
    };
  } | null;
  transactionPurposeOther: string | null;
  transactionPurposePreAmend: any | null;
  doctorName: string | null;
  doctorNamePreAmend: string | null;
  referringHospitalName: string | null;
  referringHospitalNamePreAmend: string | null;
  referringHospitalCity: string | null;
  referringHospitalCityPreAmend: string | null;
  referringHospitalPhone: string | null;
  referringHospitalPhonePreAmend: string | null;
  referringHospitalEmail: string | null;
  referringHospitalEmailPreAmend: string | null;
  referringHospitalAddress: string | null;
  referringHospitalAddressPreAmend: string | null;
  referredHospitalName: string | null;
  referredHospitalNamePreAmend: string | null;
  referredHospitalState: string | null;
  referredHospitalStatePreAmend: string | null;
  referredHospitalCity: string | null;
  referredHospitalCityPreAmend: string | null;
  referredHospitalPhone: string | null;
  referredHospitalPhonePreAmend: string | null;
  referredHospitalEmail: string | null;
  referredHospitalEmailPreAmend: string | null;
  referredHospitalAddress: string | null;
  referredHospitalAddressPreAmend: string | null;
  referringHospitalState: string | null;
  referringHospitalStatePreAmend: string | null;
  referredHospitalCountry: any | null;
  referredHospitalCountryPreAmend: any | null;
  ted: TrmsFormAStakeholderContact | null;
  branch: any | null;
  branchPreAmend: any | null;
  processingBank: TrmsFormAStakeholderContact | null;
  processingBankPreAmend: any | null;
  approvingStakeholder: any | null;
  disbursementStakeholder: any | null;
  processingBankBranch: {
    id: number;
    createdAt: number | null;
    updatedAt: number | null;
    archivedAt: number | null;
    code: string;
    name: string;
    emailAddress: string | null;
    phone: string | null;
    bankCode: string | null;
  } | null;
  processingBankBranchPreAmend: any | null;
  tedApproved: boolean | null;
  beneficiaries: Array<{
    id: number;
    createdAt: number | null;
    updatedAt: number | null;
    archivedAt: number | null;
    disbursements: any[];
    disbursementCompleted: boolean;
    bvn: string | null;
    bvnPreAmend: string | null;
    name: string;
    namePreAmend: string | null;
    phone: string | null;
    phonePreAmend: string | null;
    email: string | null;
    emailPreAmend: string | null;
    city: string | null;
    cityPreAmend: string | null;
    state: string | null;
    statePreAmend: string | null;
    addressLine1: string | null;
    addressLine1PreAmend: string | null;
    addressLine2: string | null;
    addressLine2PreAmend: string | null;
    passportNumber: string | null;
    passportNumberPreAmend: string | null;
    country: {
      id: number;
      createdAt: number | null;
      updatedAt: number | null;
      archivedAt: number | null;
      name: string;
      code: string;
      code3: string | null;
    } | null;
    countryPreAmend: any | null;
    amountRequested: number;
    amountRequestedPreAmend: number | null;
    currency: {
      id: number;
      createdAt: number | null;
      updatedAt: number | null;
      archivedAt: number | null;
      code: string;
      name: string;
      sellRate: number;
      buyRate: number | null;
      description: string | null;
      exchangeRateDate: number | null;
      currencyMarket: number;
      midRevalRate: number;
      country: any | null;
      exchangeRate: number | null;
      exchangeRateApplicantCurrency: number | null;
      currency: any | null;
    } | null;
    currencyPreAmend: any | null;
    airline: string | null;
    airlinePreAmend: string | null;
    airlineOther: string | null;
    airlineOtherPreAmend: string | null;
    airTicketNumber: string | null;
    airTicketNumberPreAmend: string | null;
    route: string | null;
    routePreAmend: string | null;
    studentName: string | null;
    studentNamePreAmend: string | null;
    studentPassportNo: string | null;
    studentPassportNoPreAmend: string | null;
    bankAccountName: string | null;
    bankAccountNamePreAmend: string | null;
    bankAccountAddress: string | null;
    bankAccountAddressPreAmend: string | null;
    bankAccountIban: string | null;
    bankAccountIbanPreAmend: string | null;
    bankAccountSwiftCode: string | null;
    bankAccountSwiftCodePreAmend: string | null;
    bankAccountNumber: string | null;
    bankAccountNumberPreAmend: string | null;
    bankAccountCorrespondenceBankName: string | null;
    bankAccountCorrespondenceBankNamePreAmend: string | null;
    bankAccountCorrespondenceBankAddress: string | null;
    bankAccountCorrespondenceBankAddressPreAmend: string | null;
    bankAccountCorrespondenceBankSwiftCode: string | null;
    bankAccountCorrespondenceBankSwiftCodePreAmend: string | null;
  }>;
  disbursementsCloseOut: boolean;
  endDisbursementsRequests: any[];
  attachments: Array<{
    id: number;
    createdAt: number | null;
    updatedAt: number | null;
    archivedAt: number | null;
    entity: string | null;
    entityId: number | null;
    file: {
      id: number;
      createdAt: number;
      updatedAt: number | null;
      archivedAt: number | null;
      fileId: string;
      fileName: string;
      diskFileName: string;
      label: string;
      mimeType: string;
      deleted: boolean;
    };
  }>;
  workflowNotes: any[];
  preCancellationRequestStatus: string | null;
  cancellationNumber: string | null;
  cancellationReason: string | null;
  cancellationInit: boolean;
  cancellationComplete: boolean;
  cancellationRequestDate: number | null;
  cancellationCompletedDate: number | null;
  amendmentNumberSerial: string | null;
  preAmendmentRequestStatus: string | null;
  amendmentNumber: string | null;
  amendmentReason: string | null;
  amendmentInit: boolean;
  amendmentComplete: boolean;
  amendmentRequestDate: number | null;
  amendmentCompletedDate: number | null;
  amendmentAttachments: any[];
  amendmentHistory: any | null;
  extension1PreRequestStatusCode: string | null;
  extension1Reason: string | null;
  extension1Init: boolean;
  extension1Complete: boolean;
  extension1DateRequest: number | null;
  extension1DateCompleted: number | null;
  extension2PreRequestStatusCode: string | null;
  extension2Reason: string | null;
  extension2Init: boolean;
  extension2Complete: boolean;
  extension2DateRequest: number | null;
  extension2DateCompleted: number | null;
  amendments: any[];
  lockedBy: any | null;
  timeLocked: number | null;
}

export interface FormMDocument {
  typeOfFormX: string;
  validForex: boolean;
  year: number | null;
  applicationNumber: string;
  formNumber: string | null;
  prefix: string;
  validUntil: string | null;
  bankCode: string;
  bankBranchCode: string;
  bankNumbering: string;
  applicantName: string;
  applicantAddress: string;
  applicantStateCode: string;
  applicantCity: string;
  applicantPhone: string | null;
  applicantFax: string | null;
  applicantMail: string;
  applicantRCNumber: string | null;
  applicantTINNumber: string;
  applicantNepcNumber: string | null;
  applicantPassportNumber: string | null;
  beneficiaryName: string;
  beneficiaryAddress: string;
  beneficiaryPhone: string;
  beneficiaryFax: string | null;
  beneficiaryMail: string;
  beneficiaryCountryCode: string;
  beneficiaryByOrder: string | null;
  goodsDescription: string;
  goodsNetWeight: number;
  totalNumberOfItems: number;
  totalFOBValue: number;
  totalTotalAncillaryCharges: number | null;
  currencyCode: string;
  currencyExchangeRate: number;
  insuranceCosts: number;
  totalCAndF: number;
  sourceOfFunds: string;
  proformaInvoiceNumber: string;
  proformaInvoiceDate: string;
  termsOfDelivery: string;
  modeOfPaymentCode: string;
  paymentDate: string | null;
  modeOfTransferCode: string;
  countryOfOrigin: string;
  countryOfSupply: string;
  modeOfTransport: string;
  portOfDischarge: string;
  portOfDestination: string | null;
  cuoCode: string;
  airTicketNumber: string | null;
  airline: string | null;
  shipmentDate: string | null;
  route: string | null;
  scanningCompany: string;
  designatedBank: string;
  endorsementApplicantRepresentative: string;
  applicantEndorsementDate: string;
  endorsementAuthorizedDealer: string | null;
  authorizedDealersEndorsementDate: string | null;
  status: string;
  items: Item[];
  attachments: any[];
  logs: Log[];
}

export interface Item {
  itemNumber: number;
  numberOfPackages: number;
  fobValue: number;
  freightCharges: number;
  unitPrice: number;
  grossWeight: number | null;
  netWeight: number | null;
  quantity: number;
  hsCode: string;
  sectoralPurposeCode: string;
  stateOfGoods: string;
  typeOfPackageCode: string;
  typeOfPackageName: string;
  descriptionOfGoods: string;
  unitCode: string;
  countryOfOrigin: string;
}

export interface Log {
  date: string;
  message: string | null;
  operation: string;
  user: string;
  endStatus: string;
  comments: Comment[];
}

export interface Comment {
  code: string;
  message: string;
}

export interface IQueryObject {
  userId: string;
  userBranchCode: string;
  authorizationStatus: string;
  userDepartment: string;
  status: string;
  searchKey: string;
  searchValue: string;
  startDate: string;
  endDate: string;
  page: string;
  pageSize: string;
  counterparties: string;
  initiators: string;
  requestType: string;
  requestStatus: string;
}

export interface IUser {
  id: string;
  branch: string;
  department: string;
  firstname: string;
  lastname: string;
  username: string;
}

export interface IInitiatorObject {
  initiator: string;
  initiatorId: string;
  initiatorBranchCode: string;
  initiatorDepartment: string;
  lastModifiedBy: string;
  lastModifiedById: string;
}

export interface IApproverObject {
  approver: string;
  approverId: string;
  approverBranchCode: string;
  approverDepartment: string;
  lastModifiedBy: string;
  lastModifiedById: string;
}

export interface Document {
  type: string;
  name: string;
  isCompulsory: boolean;
}

export interface RequiredDocument {
  type: string;
  name: string;
  documents: Document[];
}

export interface ImpactedLedger {
  ledgerCode: string;
  allocation: string;
}

export interface ApplicableRule {
  id: string;
  name: string;
  code: string;
}

export interface ApplicableCharge {
  id: string;
  name: string;
  amount: string;
  currency: string;
  chargeType: string;
  chargeAmountType?: string;
  charge_amount_type?: string;
  chargeAmountField?: ChargeAmountFieldEnum;
  impactedLedgers: ImpactedLedger[];
  applicableRule?: ApplicableRule;
}

export interface ApplicableTax {
  id: string;
  name: string;
  amount: string;
  currency: string;
  taxType: string;
  impactedLedgers: ImpactedLedger[];
  applicableRule?: ApplicableRule;
}

export interface ChargeAndTax {
  type: string;
  name: string;
  applicableCharges: ApplicableCharge[];
  applicableTaxes: ApplicableTax[];
}

export interface PostingEntry {
  postingAmountField: PostingAmountFieldEnum;
  valueDate: string;
  debitPostingName: string;
  creditPostingName: string;
  debitEntryParty: EntryPartyEnum;
  creditEntryParty: EntryPartyEnum;
  debitEntryAccountType: TradeAccountTypeEnum;
  creditEntryAccountType: TradeAccountTypeEnum;
  contingencyType: ContingencyTypeEnum;
  marginType: MarginTypeEnum;
  applicableRule?: ApplicableRule;
}

export interface AccountingEntry {
  name: string;
  type: string;
  postingEntries: PostingEntry[];
}

export interface TradeProductData {
  productId: string;
  productName: string;
  productCode: string;
  productType: string;
  slogan: string;
  description: string;
  baseCurrency: string;
  localCurrency: string;
  productStartDate: string;
  productEndDate: string;
  requiredDocuments: RequiredDocument[];
  regulatoryFormRequired: string;
  initiator: string;
  initiatorId: string;
  initiatorBranchCode: string;
  initiatorDepartment: string | null;
  approver: string;
  approverId: string;
  approverBranchCode: string;
  approverDepartment: string | null;
  chargesAndTaxes: ChargeAndTax[];
  accountingEntries: AccountingEntry[];
  status: string;
  isExpired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiredAt: string | null;
  deletedAt: string | null;
}

export interface CounterPartyAccount {
  currencyCode: string;
  nuban: string;
  nubanAccountType: string;
  nostro: string;
}

export interface TradeAccount {
  referenceId?: string | null;
  customerName?: string | null;
  customerId?: string | null;
  customerMgtId?: string | null;
  parentLedgerId?: string | null;
  currencyCode?: string | null;
  accountType?: string | null;
  accountNumber?: string | null;
  daoCode?: string | null;
  daoName?: string | null;
}

export interface CorrespondentBank {
  currencyCode: string;
  correspondentBank: string;
  inhouseCounterPartyCode: string;
  correspondentBankSwiftCode: string;
  correspondentBankAccounNumber: string;
}

export interface CounterParty {
  name: string | null;
  description: string | null;
  initiator: string | null;
  initiatorId: string;
  approver: string | null;
  approverId: string;
  team: string | null;
  teamId: string | null;
  initiatorBranchCode: string;
  approverBranchCode: string;
  initiatorDepartment: string | null;
  approverDepartment: string | null;
  approvedDate: string | null;
  lastModifiedBy: string | null;
  lastModifiedById: string | null;
  status: string | null;
  statusDescription: string | null;
  tenantId: string;
  prunedgeData: any | null;
  requestId: string;
  referenceId: string;
  customerId: string;
  swiftBIC: string;
  bankName: string;
  bankAddress: string | null;
  bankEmail: string | null;
  bankCode: string;
  phoneNumber: string | null;
  isDepository: boolean;
  currencyCode: string | null;
  accounts: CounterPartyAccount[];
  correspondentBank: string | null;
  correspondentBanks: CorrespondentBank[];
  requestStatus: string;
  approvalStatus: string;
  isRerouted: boolean | null;
  reasonForRejection: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GLClass {
  id: string;
  name: string;
  code: string;
  debit_impact_on_balance: string;
  credit_impact_on_balance: string;
}

export interface GetLedgerByIdResponse {
  id: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  is_parent: boolean;
  name: string;
  description: string;
  currency: string | null;
  branch: string;
  allow_replication: boolean;
  available_to_all_branches: boolean;
  off_balance_sheet: boolean;
  is_specific_branch: boolean;
  identifier: string;
  class_ledger_code: string | null;
  parent_ledger_code: string | null;
  sequential_ledger_code: string | null;
  sub_ledger_sequencing_start: number;
  increment: number;
  sub_ledger_sequencing_stop: number | null;
  sub_ledger_sequencing_type: string;
  sub_ledger_sequencing_type_number: number;
  level: number;
  is_vault: boolean;
  initiator: string;
  approved_by: string;
  created_date: string;
  updated_date: string;
  created_time: string;
  updated_time: string;
  is_nuban: boolean;
  is_default: boolean;
  state: string;
  is_locked: boolean;
  group_id: string;
  ledger_code: string;
  leaf_sequence_number: number | null;
  latest_sequential_code: number;
  parent_sequential_count: number | null;
  replicated: boolean;
  is_replicated_ledger: boolean;
  balance: number;
  jp_transaction_count: number | null;
  product_code: string | null;
  eoc_date: string | null;
  temp_balance: string;
  closing_balance: string;
  opening_balance: string;
  total_credit: string;
  total_debit: string;
  related_ledger_for_contra_account: string | null;
  ledger_type: string;
  trial_balance_purpose_type: string | null;
  lft: number;
  rght: number;
  tree_id: number;
  gl_class: GLClass;
  parent_ledger: any | null;
  ledger_rules: any | null;
  children_count: number;
  replicated_children_count: number;
  available: string;
  transaction_count: number;
}

export interface CustomerProfile {
  customerProfileId: string;
  customerId: string;
  title: string | null;
  firstName: string | null;
  surname: string | null;
  companyNameBusiness: string | null;
  customerNumber: string;
  bvn: string | null;
  emailAddress: string | null;
  nin: string | null;
  taxIdentificationNumber: string | null;
  certificateOfIncorporation: string | null;
  mobileNumber: string | null;
}

export interface CustomerProduct {
  [key: string]: any;
}

export interface Customer {
  customerId: string;
  status: string;
  branch: string;
  approverBranch: string;
  customerType: string;
  categoryOfCustomer: string;
  categoryOfBusiness: string | null;
  initiator: string;
  initiatorId: string;
  approver: string;
  approverId: string;
  updatedAt: string;
  customer_profiles: CustomerProfile[];
  customer_products: CustomerProduct[];
}

export interface CustomerSearchData {
  customers: Customer[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface CustomerSearchResponse {
  status: string;
  message: string;
  data: CustomerSearchData;
  responseCode: number;
}

export interface ConcessionGroupTransactionValueRange {
  min: number;
  max: number;
  chargeAmountType?: string;
  concessionValue: number;
}

export interface ConcessionGroupConfigurationItem {
  chargeId: string;
  concessionValue?: number;
  chargeType?: string;
  chargeAmountType?: string;
  transactionValueRanges?: ConcessionGroupTransactionValueRange[];
  concessionPercentageCompareValue?: number;
  concessionCurrencyCompareValue?: number;
}

export interface ConcessionGroupApplicableProduct {
  productIds: string[];
  productCategory: string;
}

export interface ConcessionGroupCustomerAssignment {
  id: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  concessionGroupGroupId: string;
  customerId: string;
  customerName: string;
  concessionGroup: string;
}

export interface ConcessionGroup {
  id: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  groupName: string;
  groupId: string;
  groupDescription: string;
  startDate: string;
  endDate: string;
  customerGroupCategory: string;
  individualCustomerAgeGroupMin: number | null;
  individualCustomerAgeGroupMax: number | null;
  corporateCustomerType: string[];
  documentationRequired: string[];
  applicableProducts: ConcessionGroupApplicableProduct[];
  configuration: ConcessionGroupConfigurationItem[];
  active: boolean;
  customerAssignments: ConcessionGroupCustomerAssignment[];
}

export interface ConcessionGroupByChargeApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ConcessionGroup[];
}

export interface RuleAttributes {
  attributeRelationship?: RulesConfigurationAttributeRelationshipEnum;
  fieldType: RulesConfigurationAttributeFieldTypeEnum;
  eventField: string;
  eventFieldKey: string;
  operator?: RulesConfigurationOperatorEnum;
  compareWith?: RulesConfigurationCompareWithEnum;
  specificValue?: string | boolean | number | null;
  eventFieldToCompareWith?: string;
}

export interface RulesConfiguration {
  id?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  code: string;
  lcProductType: RulesConfigurationProductTypeEnum;
  attributes: RuleAttributes[];
  active: boolean;
}
