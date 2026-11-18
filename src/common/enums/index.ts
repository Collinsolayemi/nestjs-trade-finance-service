/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum RequestStatusEnum {
  APPROVED = 'Approved',
  IN_ISSUE = 'In-Issue',
  IN_REVIEW = 'In-Review',
  DRAFT = 'Draft',
  DELETED = 'Deleted',
}

export enum ApprovalStatusEnum {
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PENDING = 'Pending',
  DRAFT = 'Draft',
  DELETED = 'Deleted',
}

export enum ClauseRequestTypeEnum {
  CREATION = 'Creation',
  MODIFICATION = 'Modification',
  DEACTIVATION = 'Deactivation',
  DELETION = 'Deletion',
}

export enum PermissionEnum {
  ISSUE_LETTER_OF_CREDIT = 'ISSUE_LETTER_OF_CREDIT',
  AMEND_LETTER_OF_CREDIT = 'AMEND_LETTER_OF_CREDIT',
  DOCUMENT_UPLOAD_LETTER_OF_CREDIT = 'DOCUMENT_UPLOAD_LETTER_OF_CREDIT',
  VALIDATE_DOCUMENTS_LETTER_OF_CREDIT = 'VALIDATE_DOCUMENTS_LETTER_OF_CREDIT',
  INITIATE_PAYMENT_LETTER_OF_CREDIT = 'INITIATE_PAYMENT_LETTER_OF_CREDIT',
  SCHEDULE_DEFERRED_PAYMENT_LETTER_OF_CREDIT = 'SCHEDULE_DEFERRED_PAYMENT_LETTER_OF_CREDIT',
  TRANSFER_LETTER_OF_CREDIT = 'TRANSFER_LETTER_OF_CREDIT',
  CANCEL_LETTER_OF_CREDIT = 'CANCEL_LETTER_OF_CREDIT',
  CLOSE_LETTER_OF_CREDIT = 'CLOSE_LETTER_OF_CREDIT',
  GENERATE_AUDIT_REPORT_LETTER_OF_CREDIT = 'GENERATE_AUDIT_REPORT_LETTER_OF_CREDIT',
  MODIFY_PRE_ISSUANCE_LETTER_OF_CREDIT = 'MODIFY_PRE_ISSUANCE_LETTER_OF_CREDIT',
  DOWNLOAD_DRAFT_PRE_ISSUANCE_LETTER_OF_CREDIT = 'DOWNLOAD_DRAFT_PRE_ISSUANCE_LETTER_OF_CREDIT',
  AUTHORISE_LETTER_OF_CREDIT = 'AUTHORISE_LETTER_OF_CREDIT',
  VIEW_ALL_LETTER_OF_CREDIT_RECORDS = 'VIEW_ALL_LETTER_OF_CREDIT_RECORDS',
  VIEW_BRANCH_WIDE_LETTER_OF_CREDIT_RECORDS = 'VIEW_BRANCH_WIDE_LETTER_OF_CREDIT_RECORDS',
  VIEW_ALL_LETTER_OF_CREDIT_REQUESTS = 'VIEW_ALL_LETTER_OF_CREDIT_REQUESTS',
  VIEW_BRANCH_WIDE_LETTER_OF_CREDIT_REQUESTS = 'VIEW_BRANCH_WIDE_LETTER_OF_CREDIT_REQUESTS',
  VIEW_ALL_VALID_FORM_M = 'VIEW_ALL_VALID_FORM_M',
  VIEW_ALL_EXCEPTION_FORM_M = 'VIEW_ALL_EXCEPTION_FORM_M',
  RESOLVE_EXCEPTION_FORM_M = 'RESOLVE_EXCEPTION_FORM_M',

  INITIATE_TRADE_JOURNAL_POSTINGS = 'INITIATE_TRADE_JOURNAL_POSTINGS',

  INITIATE_INTERBRANCH_TRADE_POSTING = 'INITIATE_INTERBRANCH_TRADE_POSTING',
  INITIATE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_INTERNAL_LEDGERS = 'INITIATE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_INTERNAL_LEDGERS',
  INITIATE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_CASA_ACCOUNTS = 'INITIATE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_CASA_ACCOUNTS',
  INITIATE_TRADE_JOURNAL_POSTING_TRANSACTIONS_BETWEEN_CASA_AND_INTERNAL_ACCOUNTS = 'INITIATE_TRADE_JOURNAL_POSTING_TRANSACTIONS_BETWEEN_CASA_AND_INTERNAL_ACCOUNTS',

  APPROVE_INTERBRANCH_TRADE_POSTING = 'APPROVE_INTERBRANCH_TRADE_POSTING',
  APPROVE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_INTERNAL_LEDGERS = 'APPROVE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_INTERNAL_LEDGERS',
  APPROVE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_CASA_ACCOUNTS = 'APPROVE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_CASA_ACCOUNTS',
  APPROVE_TRADE_JOURNAL_POSTING_TRANSACTIONS_BETWEEN_CASA_AND_INTERNAL_ACCOUNTS = 'APPROVE_TRADE_JOURNAL_POSTING_TRANSACTIONS_BETWEEN_CASA_AND_INTERNAL_ACCOUNTS',

  VIEW_ALL_TRADE_JOURNAL_POSTINGS_REQUESTS = 'VIEW_ALL_BRANCH_TRADE_JOURNAL_POSTINGS_REQUESTS',
  VIEW_ALL_TRADE_POSTINGS = 'VIEW_ALL_TRADE_POSTINGS',
  VIEW_ALL_BRANCH_WIDE_TRADE_JOURNAL_POSTINGS_REQUESTS = 'VIEW_ALL_BRANCH_WIDE_TRADE_JOURNAL_POSTINGS_REQUESTS',
  VIEW_BRANCH_WIDE_TRADE_POSTINGS = 'VIEW_BRANCH_WIDE_TRADE_POSTINGS',

  CREATE_CREDIT_LINE = 'ISSUE_LETTER_OF_CREDIT',
  APPROVE_CREDIT_LINE = 'AUTHORISE_LETTER_OF_CREDIT',
}

export enum AuthorizationStatusEnum {
  CREATED_BY_ME = 'createdByMe',
  CREATED_BY_MY_BRANCH = 'createdByMyBranch',
  CREATED_SYSTEM_WIDE = 'createdSystemWide',
  APPROVED_BY_ME = 'approvedByMe',
  APPROVED_BY_MY_BRANCH = 'approvedByMyBranch',
  APPROVED_SYSTEM_WIDE = 'approvedSystemWide',
  INITIATED_BY_ME = 'initiatedByMe',
  INITIATED_BY_MY_BRANCH = 'initiatedByMyBranch',
  INITIATED_SYSTEM_WIDE = 'initiatedSystemWide',
  SENT_TO_ME = 'sentToMe',
  SENT_TO_MY_BRANCH = 'sentToMyBranch',
  SENT_SYSTEM_WIDE = 'sentSystemWide',
  POSTED_BY_ME = 'postedByMe',
  POSTED_BY_MY_BRANCH = 'postedByMyBranch',
}

export enum LetterOfCreditStateEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PRE_ADVISED = 'Pre-Advised',
  EXPIRED = 'Expired',
  DRAFT = 'Draft',
}

export enum BillsForCollectionStateEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  EXPIRED = 'Expired',
  DRAFT = 'Draft',
}

export enum GuaranteesStateEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  EXPIRED = 'Expired',
  DRAFT = 'Draft',
}

export enum LetterOfCreditActionTypeEnum {
  PRE_ISSUANCE = 'Pre-Issuance',
  ISSUANCE = 'Issuance',
  ADJUSTMENT = 'Adjustment',
  AMENDMENT = 'Amendment',
  CANCELLATION = 'Cancellation',
  FREE_FORMAT = 'Free Format',
  EXPIRY = 'Expiry',
  PAYMENT = 'Payment',
  DOCUMENT_LODGEMENT = 'Document Lodgement',
  NEGOTIATION = 'Negotiation',
  VALIDATION = 'Validation',
  ADVISEMENT = 'Advisement',
  FUNDS_TRANSFER = 'Funds Transfer',
  ASSIGNMENT_OF_PROCEED = 'Assignment of Proceed',
}

export enum BillsForCollectionActionTypeEnum {
  BOOKING = 'Booking',
  AMENDMENT = 'Amendment',
  ADJUSTMENT = 'Adjustment',
  RECEIVE_ACKNOWLEDGEMENT = 'Receive Acknowledgement',
  ACCEPTANCE = 'Acceptance',
  NON_ACCEPTANCE_OR_NON_PAYMENT = 'Non-Acceptance/Non-Payment',
  PAYMENT = 'Payment',
  CLOSURE = 'Closure',
  EXPIRY = 'Expiry',
  FREE_FORMAT = 'Free Format',
}

export enum GuaranteesActionTypeEnum {
  ISSUANCE = 'Issuance',
  AMENDMENT = 'Amendment',
  ADJUSTMENT = 'Adjustment',
  RECEIVE_ACKNOWLEDGEMENT = 'Receive Acknowledgement',
  CLAIM_RECEIVED = 'Claim Received',
  DOCUMENTS_PRESENTED = 'Documents Presented',
  CANCELLATION = 'Cancellation',
  FREE_FORMAT = 'Free Format',
}

export enum LetterOfCreditActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum {
  'Issuance' = 'ISSUANCE',
  'Amendment' = 'AMENDMENT',
  'Adjustment' = 'ADJUSTMENT',
  'Cancellation' = 'CANCELLATION',
  'Payment' = 'PAYMENT',
  'Document Lodgement' = 'DOCUMENT_LODGEMENT',
  'Advisement' = 'ADVISEMENT',
  'Free Format' = 'FREE_FORMAT',
}

export enum BillsForCollectionActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum {
  'Booking' = 'BOOKING',
  'Amendment' = 'AMENDMENT',
  'Adjustment' = 'ADJUSTMENT',
  'Receive Acknowledgement' = 'RECEIVE_ACKNOWLEDGEMENT',
  'Acceptance' = 'ACCEPTANCE',
  'Non-Acceptance/Non-Payment' = 'NON_ACCEPTANCE_OR_NON_PAYMENT',
  'Payment' = 'PAYMENT',
  'Closure' = 'CLOSURE',
  'Expiry' = 'EXPIRY',
  'Free Format' = 'FREE_FORMAT',
}

export enum GuaranteesActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum {
  'Issuance' = 'ISSUANCE',
  'Amendment' = 'AMENDMENT',
  'Adjustment' = 'ADJUSTMENT',
  'Receive Acknowledgement' = 'RECEIVE_ACKNOWLEDGEMENT',
  'Claim Received' = 'CLAIM_RECEIVED',
  'Documents Presented' = 'DOCUMENTS_PRESENTED',
  'Cancellation' = 'CANCELLATION',
  'Free Format' = 'FREE_FORMAT',
}

export enum TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum {
  ISSUANCE = 'lcIssuance',
  AMENDMENT = 'lcAmendment',
  ADJUSTMENT = 'lcAdjustment',
  PAYMENT = 'lcPayment',
  DOCUMENT_LODGEMENT = 'lcDocumentLodgement',
  CANCELLATION = 'lcCancellation',
  EXPIRY = 'lcExpiry',
  REISSUANCE = 'lcReissuance',
  JOURNAL_POSTING = 'lcJournalPosting',
  ADVISEMENT = 'lcAdvisement',
  ASSIGNMENT_OF_PROCEED = 'lcAssignmentOfProceed',
  FREE_FORMAT = 'lcFreeFormat',
}

export enum TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum {
  BOOKING = 'bfcBooking',
  AMENDMENT = 'bfcAmendment',
  ADJUSTMENT = 'bfcAdjustment',
  RECEIVE_ACKNOWLEDGEMENT = 'bfcReceiveAcknowledgement',
  ACCEPTANCE = 'bfcAccept',
  NON_ACCEPTANCE_OR_NON_PAYMENT = 'bfcNonAcceptanceNonPayment',
  PAYMENT = 'bfcPayment',
  CLOSURE = 'bfcClosure',
  EXPIRY = 'bfcExpiry',
  FREE_FORMAT = 'bfcFreeFormat',
}

export enum TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum {
  ISSUANCE = 'guaranteeIssuance',
  AMENDMENT = 'guaranteeAmendment',
  ADJUSTMENT = 'guaranteeAdjustment',
  RECEIVE_ACKNOWLEDGEMENT = 'guaranteeReceiveAcknowledgement',
  CLAIM_RECEIVED = 'guaranteeClaimReceived',
  DOCUMENTS_PRESENTED = 'guaranteeDocumentsPresented',
  CANCELLATION = 'guaranteeCancellation',
  FREE_FORMAT = 'guaranteeFreeFormat',
}

export enum ILCProductSubTypeEnum {
  CLEAN_LINE_CONFIRMED = 'Clean Line Confirmed LC',
  UNCONFIRMED = 'Unconfirmed LC',
  CASH_BACKED_CONFIRMED = 'Cash Backed Confirmed LC',
}

export enum ImportLCTypeEnum {
  CLEAN_LINE_CONFIRMED = 'CL',
  UNCONFIRMED = 'U',
  CASH_BACKED_CONFIRMED = 'C',
}

export enum SourceOfFundsEnum {
  DOM_ACCOUNT = 'DOM Account',
  NGN_ACCOUNT = 'NGN Account',
}

export enum FormOfDocumentaryCreditEnum {
  IRREVOCABLE = 'Irrevocable',
  IRREVOCABLE_TRANSFERABLE = 'Irrevocable Transferable',
  REVOCABLE = 'Revocable',
  TRANSFERABLE = 'Transferable',
  IRREVOCABLE_STANDBY = 'Irrevocable Standby',
  IRREVOCABLE_TRANSFERABLE_STANDBY = 'Irrevocable Transferable Standby',
}

export enum ApplicationRulesEnum {
  UCP_LATEST_VERSION = 'UCP Latest Version',
  EUCP_LATEST_VERSION = 'EUCP Latest Version',
  EUCPURR_LATEST_VERSION = 'EUCPURR Latest Version',
  UCPURR_LATEST_VERSION = 'UCPURR Latest Version',
  OTHER = 'Other',
}

export enum SendMessageByEnum {
  SWIFT = 'SWIFT',
  EMAIL = 'Email',
  FAX = 'Fax',
}

export enum ConfirmationInstructionEnum {
  CONFIRM = 'Confirm',
  MAY_ADD = 'May Add',
  WITHOUT = 'Without',
}

export enum RequestedConfirmationPartyEnum {
  OURSELVES = 'Ourselves',
  ISSUING_BANK = 'Issuing Bank',
  ADVISING_BANK = 'Advising Bank',
  ANY_BANK = 'Any Bank',
  ANY_BANK_IN_CITY = 'Any Bank in City',
  ANY_BANK_IN_COUNTRY = 'Any Bank in Country',
  NAMED_BANK = 'Named Bank',
}

export enum PaymentMethodEnum {
  METHOD_PROVIDED = 'Method Provided',
}

export enum DraweeEnum {
  OURSELVES = 'Ourselves',
  ISSUING_BANK = 'Issuing Bank',
  ADVISING_BANK = 'Advising Bank',
  ANY_BANK = 'Any Bank',
  NAMED_BANK = 'Named Bank',
}

export enum DraftModeEnum {
  TENOR = 'Tenor',
  MATURITY = 'Maturity',
}

export enum PurposeOfMessageEnum {
  ADVICE_AND_CONFIRMATION_OF_THE_CREDIT_AMENDMENT = 'Advice and Confirmation of the Credit Amendment',
  ADVICE_OF_THE_CREDIT_AMENDMENT = 'Advice of the Credit Amendment',
  ISSUANCE_OF_THE_CREDIT_AMENDMENT = 'Issuance of the Credit Amendment',
}

export enum AmendmentChargePayableByEnum {
  APPLICANT = 'Applicant',
  BENEFICIARY = 'Beneficiary',
  OTHER_PARTY = 'Other Party',
}

export enum LetterOfCreditAmountChangeEnum {
  NONE = 'None',
  INCREASE = 'Increase',
  DECREASE = 'Decrease',
}

export enum CreditAvailableWithEnum {
  OURSELVES = 'Ourselves',
  ISSUING_BANK = 'Issuing Bank',
  ADVISING_BANK = 'Advising Bank',
  ANY_BANK = 'Any Bank',
  NAMED_BANK = 'Named Bank',
}

export enum CreditAvailableByEnum {
  BY_ACCEPTANCE = 'By Acceptance',
  BY_DEF_PAYMENT = 'By Def Payment',
  BY_MIXED_PAYMENT = 'By Mixed Payment',
  BY_NEGOTIATION = 'By Negotiation',
  BY_SIGHT_PAYMENT = 'By Sight Payment',
}

export enum TenorPeriodEnum {
  DAYS = 'Days',
  WEEKS = 'Weeks',
  MONTHS = 'Months',
  YEAR = 'Year',
}

export enum ShipmentEnum {
  ALLOWED = 'Allowed',
  CONDITIONAL = 'Conditional',
  NOT_ALLOWED = 'Not Allowed',
}

export enum PaymentTransferMethodEnum {
  SWIFT = 'SWIFT',
  PAPPS = 'PAPPS',
}

export enum PaymentActionTypeEnum {
  PAY = 'Pay',
  PAY_WITH_FINANCING = 'Pay with Financing',
  PAY_AT_MATURITY = 'Pay at Maturity',
  REJECT = 'Reject',
  REFUSE_DOCUMENT = 'Refuse Document',
  REJECT_AND_CLAIM_REFUND = 'Reject and Claim Refund',
  SEEK_APPLICANT_APPROVAL = 'Seek Applicant Approval',
}

export enum DocumentDisposalEnum {
  HOLD = 'Hold',
  NOTIFY = 'Notify',
  PREVINST = 'Previnst',
  RETURN = 'Return',
}

export enum NegotiationSourceOfFundsEnum {
  DOM_ACCOUNT = 'Dom Account',
  NGN_ACCOUNT = 'NGN Account',
}

export enum SetTypeEnum {
  CUSTOMER_SET = 'Customer Set',
  BANK_SET = 'Bank Set',
}

export enum ScanningAgentEnum {
  NCS = 'NCS',
}

export enum SectoralClassificationEnum {
  PETROLEUM_PRODUCTS = 'Petroleum Products',
  MACHINERIES = 'Machineries',
  FINISHED_PRODUCTS = 'Finished Products',
  RAW_MATERIALS = 'RAW Materials',
  PHARMACEUTICAL_PRODUCTS = 'Pharmaceutical Products',
}

export enum ProductClassificationEnum {
  OIL = 'Oil',
  NON_OIL = 'Non Oil',
}

export enum ReasonForRejectionEnum {
  DOCUMENTS_MISSING = 'Documents Missing',
  SIGNATURE_MISSING = 'Signature Missing',
  INPUT_ERROR = 'Input Error',
  OTHERS = 'Others',
}

export enum SwiftMessageTypeEnum {
  MT_202 = '202',
  MT_700 = '700',
  MT_707 = '707',
  MT_730 = '730',
  MT_752 = '752',
  MT_799 = '799',
  MT_999 = '999',
}

export enum BidFundTypeEnum {
  RETAIL_BIDS = 'Retail Bids',
  WHOLE_SALE_BIDS = 'Whole Sale Bids',
  FORM_Q = 'Form Q',
  IAND_E_FUNDS = 'I&E Funds',
}

export enum FxCategoryEnum {
  SPOT = 'Spot',
  FORWARD = 'Forward',
}

export enum RateTypeEnum {
  BANK_RATE = 'Bank Rate',
  CUSTOMER_RATE = 'Customer Rate',
}

export enum SwiftMessageJobActionEnum {
  GENERATE_MT_400_AND_UPLOAD = 'generate-mt-400-and-upload',
  GENERATE_MT_410_AND_UPLOAD = 'generate-mt-410-and-upload',
  GENERATE_MT_412_AND_UPLOAD = 'generate-mt-412-and-upload',
  GENERATE_MT_416_AND_UPLOAD = 'generate-mt-416-and-upload',
  GENERATE_MT_420_AND_UPLOAD = 'generate-mt-420-and-upload',
  GENERATE_MT_422_AND_UPLOAD = 'generate-mt-422-and-upload',
  GENERATE_MT_430_AND_UPLOAD = 'generate-mt-430-and-upload',
  GENERATE_MT_754_AND_UPLOAD = 'generate-mt-754-and-upload',
  GENERATE_MT_756_AND_UPLOAD = 'generate-mt-756-and-upload',
  GENERATE_MT_700_AND_UPLOAD = 'generate-mt-700-and-upload',
  GENERATE_MT_707_AND_UPLOAD = 'generate-mt-707-and-upload',
  GENERATE_MT_730_AND_UPLOAD = 'generate-mt-730-and-upload',
  GENERATE_MT_752_AND_UPLOAD = 'generate-mt-752-and-upload',
  GENERATE_MT_799_AND_UPLOAD = 'generate-mt-799-and-upload',
  GENERATE_MT_999_AND_UPLOAD = 'generate-mt-999-and-upload',
  GENERATE_MT_202_AND_UPLOAD = 'generate-mt-202-and-upload',
}

export enum SwiftMessageUploadActionEnum {
  SWIFT_TEXT_FILE_TO_DMS = 'swift-text-file-to-dms',
  SWIFT_TEXT_FILE_TO_SWIFT_SERVER = 'swift-text-file-to-swift-server',
}

export enum TradeGovActionEnum {
  TRADE_GOV_TO_TRADE_API = 'trade-gov-to-trade-api',
}

export enum TrmsActionEnum {
  TRMS_TO_TRADE_API = 'trms-to-trade-api',
}

export enum HttpDataModificationMethod {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export enum HttpRequestMethodEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  CONNECT = 'CONNECT',
}

export enum NonDevelopmentEnvironmentEnum {
  PROD_1 = 'production',
  PROD_2 = 'prod',
  SIM_1 = 'simulation',
  SIM_2 = 'sim',
}

export enum NodeEnvEnum {
  LOCAL = 'local',
  DEV = 'dev',
  PROD = 'prod',
  SIM = 'sim',
}

export enum TradeJournalPostingTypeEnum {
  SINGLE = 'Single',
  SPLIT = 'Split',
}

export enum TradeJournalPostingReversalStatusEnum {
  NONE = 'None',
  PENDING = 'Pending',
  SUCCESSFUL = 'Successful',
  REJECTED = 'Rejected',
}

export enum AccountAccessRestrictionTypeEnum {
  INDIVIDUAL = 'Individual',
  BRANCH = 'Branch',
  CHANNELS = 'Channels',
  DEPARTMENT = 'Department',
  SYSTEM = 'System',
}

export enum AccountCategoryEnum {
  CASA = 0,
  INTERNAL = 1,
  LOAN = 2,
  INVESTMENT = 3,
  TILL = 4,
  VAULT = 5,
  MASTER_TILL = 6,
  OUTWARD_CHEQUE = 7,
}

export enum AccountCategoryTitleEnum {
  CASA = 'CASA',
  INTERNAL = 'Internal',
  TILL = 'Till',
  VAULT = 'Vault',
  MASTER_TILL = 'Master Till',
}

export enum AccountTypeEnum {
  ASSETS = 'ASSETS',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  EXPENSE = 'EXPENSE',
  REVENUE = 'REVENUE',
}

export enum FreezeCodeEnum {
  NO_FREEZE = '000',
  TOTAL_FREEZE = '001',
  DEBIT_FREEZE = '002',
  CREDIT_FREEZE = '003',
}

export enum TaxTypeEnum {
  FIXED_TAX = 'Fixed Tax',
  VARIABLE_TAX = 'Variable Tax',
  COMPARE_TAX = 'Compare Tax',
}

export enum ChargeTypeEnum {
  FIXED_CHARGE = 'Fixed Charge',
  VARIABLE_CHARGE = 'Variable Charge',
  COMPARE_CHARGE = 'Compare Charge',
}

export enum ChargesAndTaxesAmountTypeEnum {
  PERCENT = 'Percent',
  CURRENCY = 'Currency',
}

export enum CompareTaxParameterEnum {
  SMALLEST_OF = 'SmallestOf',
  LARGEST_OF = 'LargestOf',
  AVERAGE_OF = 'AverageOf',
  SUM_OF = 'SumOf',
}

export enum CompareChargeParameterEnum {
  SMALLEST_OF = 'Smallest Of',
  LARGEST_OF = 'Largest Of',
  AVERAGE_OF = 'Average Of',
  SUM_OF = 'Sum Of',
}

export enum TransactionCategoryEnum {
  BI = 0,
  CI = 1,
}

export enum TransactionSourceEnum {
  OVER_THE_COUNTER = 1,
  THIRD_PARTY = 2,
  ATM = 3,
  CHARGES = 4,
  TILL = 5,
  VAULT = 6,
}

export enum TransactionSubSourceEnum {
  CASH_WITHDRAWAL = 1,
  CASH_DEPOSIT = 2,
  CHEQUE_TRANSACTION = 3,
  WITHIN_BANK_TRANSFER = 4,
  OTHER_BANK_TRANSFER = 5,
  INTERNATIONAL = 6,
  BILL_PAYMENT = 7,
  FX_DEAL = 69,
  FX_PLACEMENTS = 70,
  FX_TAKINGS = 71,
  NAIRA_PLACEMENTS = 72,
  NAIRA_TAKINGS = 73,
  TRADE_CROSS_CURRENCY_JOURNAL_POSTING = 74,
  TRADE_SINGLE_JOURNAL_POSTING = 75,
  TRADE_SPLIT_JOURNAL_POSTING = 76,
  TRADE_INFLOW = 77,
}

export enum ThirdPartySourceEnum {
  INTERNAL_CUSTOMER = 'Internal/Customer',
}

export enum IANATimeZoneDatabaseEnum {
  LAGOS = 'Africa/lagos',
}

export enum RegulatoryFormMValidationCheckEnum {
  ACCOUNT_RESTRICTION = 'account-restriction',
  CUSTOMER_ACCOUNT_VALIDATION = 'customer-account-validation',
  BALANCE_ENQUIRY = 'balance-enquiry',
  WATCHLIST = 'watchlist',
}

export enum RegulatoryFormTypeEnum {
  FORM_M = 'form-m',
  FORM_NXP = 'form-nxp',
  FORM_NCX = 'form-ncx',
  FORM_A = 'form-a',
}

export enum RecordsStatusTypeEnum {
  INITIATOR_VIEW = 'initiatorView',
  AUTHORIZER_VIEW = 'authorizerView',
  ACTION_TYPE = 'actionType',
}

export enum LetterOfCreditStatusTypeToColumnMappingEnum {
  initiatorView = 'requestStatus',
  authorizerView = 'approvalStatus',
  actionType = 'letterOfCreditActionType',
}

export enum BillsForCollectionStatusTypeToColumnMappingEnum {
  initiatorView = 'requestStatus',
  authorizerView = 'approvalStatus',
  actionType = 'billsForCollectionActionType',
}

export enum GuaranteesStatusTypeToColumnMappingEnum {
  initiatorView = 'requestStatus',
  authorizerView = 'approvalStatus',
  actionType = 'guaranteesActionType',
}

export enum ClauseRecordsStatusTypeEnum {
  INITIATOR_VIEW = 'initiatorView',
  AUTHORIZER_VIEW = 'authorizerView',
}

export enum ClauseStatusTypeToColumnMappingEnum {
  initiatorView = 'requestStatus',
  authorizerView = 'isActive',
}

export enum CustomerManagementIdTypeEnum {
  BVN = 'bvn',
  NIN = 'nin',
  CERTIFICATE_OF_INCORPORATION = 'certificateofincorporation',
  TAX_IDENTIFICATION_NUMBER = 'taxidentificationnumber',
  CUSTOMER_NUMBER = 'customernumber',
}

export enum StpExceptionTypeEnum {
  CUSTOMER_ACCOUNT_VALIDATION = 'Customer Account Validation',
  ACCOUNT_RESTRICTION = 'Account Restriction',
  BALANCE_ENQUIRY = 'Balance Enquiry',
  WATCHLIST = 'Watchlist',
}

export enum LCClauseTypeEnum {
  RED = 'Red',
  GREEN = 'Green',
}

export enum LCToleranceTypeEnum {
  QUANTITY = 'Quantity',
  AMOUNT = 'Amount',
  QUANTITY_AND_AMOUNT = 'Quantity and Amount',
}

export enum IncotermsEnum {
  FOB = 'FOB',
  CIF = 'CIF',
  EXW = 'EXW',
  FCA = 'FCA',
  FAS = 'FAS',
  CFR = 'CFR',
  CPT = 'CPT',
  CIP = 'CIP',
  DAP = 'DAP',
  DDP = 'DDP',
  DPU = 'DPU',
}

// export enum IncotermsEnum {
//   FOB = 'FOB - Free on Board',
//   CIF = 'CIF - Cost, Insurance and Freight',
//   EXW = 'EXW - Ex Works',
//   FCA = 'FCA - Free Carrier',
//   FAS = 'FAS -Free Alongside Ship',
//   CFR = 'CFR - Cost and Freight',
//   CPT = 'CPT -Carriage Paid To',
//   CIP = 'CIP - Carriage and Insurance Paid To',
//   DAP = 'DAP - Delivered at Place',
//   DDP = 'DDP - Delivered Duty Paid',
//   DPU = 'DPU - Delivered at Place Unloaded',
// }

export enum SettlementAccountTypeEnum {
  INTERNAL = 'Internal',
  EXTERNAL = 'External',
}

export enum CurrencyDecimalPlacesEnum {
  AED = 2,
  AFN = 2,
  ALL = 2,
  AMD = 2,
  ANG = 2,
  AOA = 2,
  ARS = 2,
  AUD = 2,
  AWG = 2,
  AZN = 2,
  BAM = 2,
  BBD = 2,
  BDT = 2,
  BGN = 2,
  BHD = 3,
  BIF = 0,
  BMD = 2,
  BND = 2,
  BOB = 2,
  BRL = 2,
  BSD = 2,
  BTN = 2,
  BWP = 2,
  BYN = 2,
  BZD = 2,
  CAD = 2,
  CDF = 2,
  CHF = 2,
  CLP = 0,
  CNY = 2,
  COP = 2,
  CRC = 2,
  CUP = 2,
  CVE = 2,
  CZK = 2,
  DJF = 0,
  DKK = 2,
  DOP = 2,
  DZD = 2,
  EGP = 2,
  ERN = 2,
  ETB = 2,
  EUR = 2,
  FJD = 2,
  FKP = 2,
  FOK = 2,
  GBP = 2,
  GEL = 2,
  GGP = 2,
  GHS = 2,
  GIP = 2,
  GMD = 2,
  GNF = 0,
  GTQ = 2,
  GYD = 2,
  HKD = 2,
  HNL = 2,
  HRK = 2,
  HTG = 2,
  HUF = 2,
  IDR = 2,
  ILS = 2,
  IMP = 2,
  INR = 2,
  IQD = 3,
  IRR = 2,
  ISK = 0,
  JEP = 2,
  JMD = 2,
  JOD = 3,
  JPY = 0,
  KES = 2,
  KGS = 2,
  KHR = 2,
  KID = 2,
  KMF = 0,
  KRW = 0,
  KWD = 3,
  KYD = 2,
  KZT = 2,
  LAK = 2,
  LBP = 2,
  LKR = 2,
  LRD = 2,
  LSL = 2,
  LYD = 3,
  MAD = 2,
  MDL = 2,
  MGA = 2,
  MKD = 2,
  MMK = 2,
  MNT = 2,
  MOP = 2,
  MRU = 2,
  MUR = 2,
  MVR = 2,
  MWK = 2,
  MXN = 2,
  MYR = 2,
  MZN = 2,
  NAD = 2,
  NGN = 2,
  NIO = 2,
  NOK = 2,
  NPR = 2,
  NZD = 2,
  OMR = 3,
  PAB = 2,
  PEN = 2,
  PGK = 2,
  PHP = 2,
  PKR = 2,
  PLN = 2,
  PYG = 0,
  QAR = 2,
  RON = 2,
  RSD = 2,
  RUB = 2,
  RWF = 0,
  SAR = 2,
  SBD = 2,
  SCR = 2,
  SDG = 2,
  SEK = 2,
  SGD = 2,
  SHP = 2,
  SLL = 2,
  SOS = 2,
  SRD = 2,
  SSP = 2,
  STN = 2,
  SYP = 2,
  SZL = 2,
  THB = 2,
  TJS = 2,
  TMT = 2,
  TND = 3,
  TOP = 2,
  TRY = 2,
  TTD = 2,
  TVD = 2,
  TWD = 2,
  TZS = 2,
  UAH = 2,
  UGX = 2,
  USD = 2,
  UYU = 2,
  UZS = 2,
  VES = 2,
  VND = 0,
  VUV = 0,
  WST = 2,
  XAF = 0,
  XCD = 2,
  XOF = 0,
  XPF = 0,
  YER = 2,
  ZAR = 2,
  ZMW = 2,
  ZWL = 2,
}

export enum GetFormMRecordIdentifierEnum {
  FORM_M_ID = 'formMId',
  APPLICATION_NUMBER = 'applicationNumber',
  FORM_NUMBER = 'formNumber',
}

export enum GetFormNXPRecordIdentifierEnum {
  FORM_NXP_ID = 'formNXPId',
  APPLICATION_NUMBER = 'applicationNumber',
  FORM_NUMBER = 'formNumber',
}

export enum GetFormNCXRecordIdentifierEnum {
  FORM_NCX_ID = 'formNCXId',
  APPLICATION_NUMBER = 'applicationNumber',
}

export enum GetAllFormMRecordsStatusCountIdentifierEnum {
  FORM_M = 'formM',
  FORM_NXP = 'formNXP',
  FORM_NCX = 'formNCX',
  STP_EXCEPTION = 'stpException',
}

export enum StpExceptionResolveTypeEnum {
  RESOLVE = 'Resolve',
  EXEMPT = 'Exempt',
}

export enum LetterOfCreditProductTypeEnum {
  IMPORT = 'Import',
  EXPORT = 'Export',
}

export enum BillsForCollectionProductTypeEnum {
  INWARD = 'Inward',
  OUTWARD = 'Outward',
}

export enum GuaranteesProductTypeEnum {
  ISSUED = 'Issued',
  RECEIVED = 'Received',
}

export enum GuaranteesContractReferenceEnum {
  TEND = 'TEND',
  ORDR = 'ORDR',
  CONT = 'CONT',
  OFFR = 'OFFR',
  PINV = 'PINV',
  PROJ = 'PROJ',
}

export enum GuaranteesRenewOnEnum {
  DONT_RENEW = "Don't Renew",
  EXPIRY = 'Expiry',
  CALENDAR_DATE = 'Calendar Date',
}

export enum GuaranteesClassificationEnum {
  FINANCIAL = 'Financial',
  TRADE_RELATED = 'Trade-Related',
}

export enum GuaranteesApplicableRulesEnum {
  UCP_LATEST_VERSION = 'UCP Latest Version',
  URDG_LATEST_VERSION = 'URDG Latest Version',
  ISP_LATEST_VERSION = 'ISP Latest Version',
  OTHER = 'Others',
}

export enum GuaranteesAvailableByEnum {
  SIGHT = 'Sight',
  ACCEPTANCE = 'Acceptance',
  DEFERRED = 'Deferred',
  NEGOTIATION = 'Negotiation',
  MIXED = 'Mixed',
}

export enum GuaranteesTenorStartBoundaryEnum {
  FROM_ = 'From',
  AFTER_ = 'After',
}

export enum GuaranteesOurChargesPaidByEnum {
  PRINCIPAL = 'Principal',
  BENEFICIARY = 'Beneficiary',
}

export enum GuaranteesOverseasChargesPaidByEnum {
  BENEFICIARY = 'Beneficiary',
  APPLICANT = 'Applicant',
}

export enum GuaranteesTaxPaidByEnum {
  PARTY_LIABLE = 'Party Liable',
  CUSTOMER = 'Customer',
}

export enum GuaranteesReceivedFromEnum {
  BENEFICIARY = 'Beneficiary',
  APPLICANT = 'Applicant',
  PRINCIPAL = 'Principal',
  ADVISING_BANK = 'Advising Bank',
}

export enum GuaranteesPresentersActionEnum {
  REQUEST_AUTHORISATION_TO_PAY = 'Request Authorisation to Pay',
  REQUEST_AUTHORISATION_TO_ACCEPT = 'Request Authorisation to Accept',
  REQUEST_TO_EXTEND_EXPIRY_DATE = 'Request to Extend Expiry Date',
  MAKE_STANDBY_AMENDMENT = 'Make Standby Amendment',
}

export enum GuaranteesPaymentAvailableByEnum {
  ACCEPTANCE = 'Acceptance',
  DEFERRED_PAYMENT = 'Deferred Payment',
  NEGOTIATION = 'Negotiation',
  SIGHT_PAYMENT = 'Sight Payment',
}

export enum BillsForCollectionDraftAgainstEnum {
  DOCUMENT_AGAINST_PAYMENT = 'Document Against Payment',
  DOCUMENT_AGAINST_ACCEPTANCE = 'Document Against Acceptance',
  POUR_AVAL = 'Pour Aval',
  OTHER = 'Other',
}

export enum BillsForCollectionAgainstDocumentTypeEnum {
  BILL_OF_LADING = 'Bill of Lading',
  AIRWAY_BILL = 'Airway Bill',
  INVOICE = 'Invoice',
  PACKING_LIST = 'Packing List',
  INSURANCE_CERTIFICATE = 'Insurance Certificate',
  CERTIFICATE_OF_ORIGIN = 'Certificate of Origin',
}

export enum UploadTypeEnum {
  NEW = 'New',
  REPLACEMENT = 'Replacement',
}

export enum LetterOfCreditDocumentValidationStatusEnum {
  VALIDATED = 'Validated',
  DISCREPANT = 'Discrepant',
}

export enum RequestTypeEnum {
  CREATION = 'Creation',
  MODIFICATION = 'Modification',
  DEACTIVATION = 'Deactivation',
  ACTIVATION = 'Activation',
}

export enum CreditLineStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface IPaginationData {
  count: number;
  rows: object[];
}

export enum SearchKeysEnum {
  CREDIT_LINE_NAME = 'creditLineName',
  CREDIT_LINE_ID = 'creditLineId',
  CREDIT_LINE_CODE = 'creditLineReferenceCode',
  REQUEST_NAME = 'requestName',
  REQUEST_ID = 'requestId',
}

export enum SwiftBICEnum {
  STERLING = 'NAMENGLAXXX',
}

export enum TradeAccountTypeEnum {
  LC_IMPORT_CLIENT = 'LC Import Client',
  LC_REFINANCE = 'LC Refinance',
  STERLING_REFINANCE = 'Sterling Refinance',
  CASH_MARGIN = 'Cash Margin',
  DEFERRED_LC = 'Deferred LC',
}

export enum ChargeAmountFieldEnum {
  LC_AMOUNT = 'LC Amount',
  CONFIRMATION_AMOUNT = 'Confirmation Amount',
  MARGIN_AMOUNT = 'Margin Amount',
  PRE_NEGOTIATION_AMOUNT = 'Pre-Negotiation Amount',
  COLLATERAL_AMOUNT = 'Collateral Amount',
  UNCONFIRMED_AMOUNT = 'Unconfirmed Amount',
  CONFIRMATION_LINE_AMOUNT = 'Confirmation Line Amount',
  INCREASE_LC_AMOUNT = 'Increase LC Amount',
  DECREASE_LC_AMOUNT = 'Decrease LC Amount',
  NEW_LC_AMOUNT = 'New LC Amount',
  MINIMUM_LETTER_OF_CREDIT_AMOUNT = 'Minimum Letter of Credit Amount',
  MAXIMUM_LETTER_OF_CREDIT_AMOUNT = 'Maximum Letter of Credit Amount',
  PRESENTATION_AMOUNT = 'Presentation Amount',
  ADDITIONAL_AMOUNT = 'Additional Amount',
  TOTAL_CLAIMED_AMOUNT = 'Total Claimed Amount',
  CHARGES_ADDED_AMOUNT = 'Charges Added Amount',
  CHARGES_DEDUCTED_AMOUNT = 'Charges Deducted Amount',
  PAY_AMOUNT = 'Pay Amount',
  OUTSTANDING_BALANCE = 'Outstanding Balance',
  DOCUMENT_AMOUNT = 'Document Amount',
  LIABILITY_AMOUNT = 'Liability Amount',
  COLLECTION_AMOUNT = 'Collection Amount',
  DRAFT_AMOUNT = 'Draft Amount',
  BILL_AMOUNT = 'Bill Amount',
  TOTAL_TO_COLLECT_AMOUNT = 'Total To Collect Amount',
  PAYMENT_AMOUNT = 'Payment Amount',
  AMOUNT_ACCEPTED = 'AmountAccepted',
}

export enum PostingAmountFieldEnum {
  LC_AMOUNT = 'LCAmount',
  CONFIRMATION_AMOUNT = 'ConfirmationAmount',
  MARGIN_AMOUNT = 'MarginAmount',
  COLLATERAL_AMOUNT = 'CollateralAmount',
  PRE_NEGOTIATION_AMOUNT = 'PreNegotiationAmount',
  INCREASE_OF_DOCUMENTARY_CREDIT_AMOUNT = 'IncreaseOfDocumentaryCreditAmount',
  PRE_NEGOTIATION_INTEREST_AMOUNT = 'PreNegotiationInterestAmount',
  UNCONFIRMED_AMOUNT = 'UnconfirmedAmount',
  CONFIRMATION_LINE_AMOUNT = 'ConfirmationLineAmount',
  INCREASE_LC_AMOUNT = 'IncreaseLcAmount',
  DECREASE_LC_AMOUNT = 'DecreaseLcAmount',
  NEW_LC_AMOUNT = 'New LC Amount',
  MINIMUM_LETTER_OF_CREDIT_AMOUNT = 'MinimumLetterOfCreditAmount',
  MAXIMUM_LETTER_OF_CREDIT_AMOUNT = 'MaximumLetterOfCreditAmount',
  PRESENTATION_AMOUNT = 'PresentationAmount',
  ADDITIONAL_AMOUNT = 'AdditionalAmount',
  TOTAL_CLAIMED_AMOUNT = 'TotalClaimedAmount',
  CHARGES_ADDED_AMOUNT = 'ChargesAddedAmount',
  CHARGES_DEDUCTED_AMOUNT = 'ChargesDeductedAmount',
  PAY_AMOUNT = 'PayAmount',
  OUTSTANDING_BALANCE = 'OutstandingBalance',
  DOCUMENT_AMOUNT = 'DocumentAmount',
  LIABILITY_AMOUNT = 'LiabilityAmount',
  COLLECTION_AMOUNT = 'CollectionAmount',
  DRAFT_AMOUNT = 'DraftAmount',
  BILL_AMOUNT = 'BillAmount',
  TOTAL_TO_COLLECT_AMOUNT = 'TotalToCollectAmount',
  PAYMENT_AMOUNT = 'PaymentAmount',
  AMOUNT_ACCEPTED = 'AmountAccepted',
}

export enum ValueDateFieldEnum {
  DATE_OF_ISSUE = 'DateOfIssue',
  DATE_OF_AMENDMENT = 'DateOfAmendment',
  EXPIRY_DATE = 'ExpiryDate',
}

export enum EntryPartyEnum {
  APPLICANT = 'Applicant',
  BENEFICIARY = 'Beneficiary',
  ISSUING_BANK = 'Issuing Bank',
  ADVISING_BANK = 'Advising Bank',
  CONFIRMATION_BANK = 'Confirmation Bank',
  CREDIT_AVAILABLE_WITH_BANK = 'Credit Available With Bank',
  REMITTING_BANK = 'Remitting Bank',
  PRESENTING_BANK = 'Presenting Bank',
  DRAWER = 'Drawer',
  DRAWEE = 'Drawee',
}

export enum ContingencyTypeEnum {
  NONE = 'None',
  CONTINGENT = 'Contingent',
  REVERSE_CONTINGENT = 'ReverseContingent',
}

export enum MarginTypeEnum {
  NONE = 'None',
  MARGIN = 'Margin',
  REVERSE_MARGIN = 'ReverseMargin',
}

export enum DocumentTypeEnum {
  LC_APPLICATION_FORM = 'lcApplicationForm',
  CUSTOMER_INSTRUCTION_LETTER = 'customerInstructionLetter',
  IMPORT_LICENSE = 'importLicense',
  COLLATERAL = 'collateral',
  BILL_OF_LADING = 'billOfLading',
  INSURANCE_CERTIFICATE = 'insuranceCertificate',
}

export enum LcProductTypeEnum {
  LC_ISSUANCE = 'lcIssuance',
  LC_AMENDMENT = 'lcAmendment',
  LC_ADJUSTMENT = 'lcAdjustment',
  LC_PAYMENT = 'lcPayment',
  LC_DOCUMENT_LODGEMENT = 'lcDocumentLodgement',
  LC_CANCELLATION = 'lcCancellation',
  LC_EXPIRY = 'lcExpiry',
  LC_REISSUANCE = 'lcReIssuance',
  LC_JOURNAL_POSTING = 'lcJournalPosting',
}

export enum RegulatoryFormRequiredEnum {
  FORM_M = 'Form M',
  NONE = 'None',
}

export enum ChartOfAccountsLedgerTypeEnum {
  PARENT_LEDGER = 'PARENT_LEDGER',
  LEAF_LEDGER = 'LEAF_LEDGER',
}

export enum CipherAlgorithmEnum {
  AES_256_CBC = 'aes-256-cbc',
  AES_128_CBC = 'aes-128-cbc',
}

export enum RegulatoryFormStatusEnum {
  SUBMITTED = 'Submitted',
  VALIDATED = 'Validated',
  REGISTERED = 'Registered',
  QUERY = 'Query',
}

export enum ProductFactoryProductTypeEnum {
  CURRENT = 'Current',
}

export enum CurrencyCodeEnum {
  NGN = 'NGN',
}

export enum EntryTypeEnum {
  DEBIT = 'Debit',
  CREDIT = 'Credit',
}

export enum LetterOfCreditAssignmentOfProceedBankTypeEnum {
  INTERNAL = 'Internal',
  EXTERNAL = 'External',
}

export enum LetterOfCreditFreeFormaSwifttMessageTypeEnum {
  MT_799 = '799',
  MT_999 = '999',
}

export enum BillsForCollectionFreeFormaSwifttMessageTypeEnum {
  MT_499 = '499',
  MT_999 = '999',
}

export enum GuaranteesFreeFormatSwiftMessageTypeEnum {
  MT_499 = '499',
  MT_760 = '760',
  MT_767 = '767',
  MT_768 = '768',
  MT_769 = '769',
  MT_999 = '999',
}

export enum RulesConfigurationAttributeFieldTypeEnum {
  AMOUNT = 'Amount',
  STRING = 'String',
  DATE = 'Date',
  INTEGER = 'Integer',
  FLAG = 'Flag',
  PARTY = 'Party',
}

export enum RulesConfigurationAttributeRelationshipEnum {
  AND = 'And',
  OR = 'Or',
}

export enum RulesConfigurationOperatorEnum {
  EQUALS = '=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  NOT_EQUALS = '!=',
  GREATER_THAN_OR_EQUAL_TO = '>=',
  LESS_THAN_OR_EQUAL_TO = '<=',
}

export enum RulesConfigurationCompareWithEnum {
  SPECIFIC_VALUE = 'Specific Value',
  EVENT_FIELD = 'Event Field',
}

export enum RulesConfigurationProductTypeEnum {
  IMPORT_LETTERS_OF_CREDIT = 'Import Letters of Credit',
  EXPORT_LETTERS_OF_CREDIT = 'Export Letters of Credit',
  GUARANTEES = 'Guarantees',
  BILLS_FOR_COLLECTION = 'Bills for Collection',
}

export enum LoanTenorPeriodEnum {
  DAYS = 'DAYS',
}

export enum LoanMoratoriumPeriodEnum {
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
}

export enum LoanMoratoriumDurationEnum {
  INCLUDED_IN_LOAN = 'INCLUDED_IN_LOAN',
}

export enum LoanGracePeriodEnum {
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
}

export enum LoanDisburseMethodEnum {
  ON_APPROVAL = 'ON_APPROVAL',
}

export enum LoanRepaymentChannelEnum {
  DIRECT_DEBIT = 'Direct Debit',
}

export enum LoanRepaymentSourceEnum {
  CUSTOMER_PRIMARY_ACCOUNT = 'CUSTOMER_PRIMARY_ACCOUNT',
}

export enum LoanStatusEnum {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  DISBURSED = 'DISBURSED',
}

export enum LoanRepaymentFrequencyEnum {
  CUSTOM = 'CUSTOM',
  MONTHLY = 'MONTHLY',
  DAILY = 'DAILY',
}

export enum LoanRepaymentPatternEnum {
  BULLET = 'BULLET',
  REDUCING_BALANCE = 'REDUCING_BALANCE',
}

export enum LoanDisbursementAccountSourceEnum {
  CUSTOMER_REPAYMENT_ACCOUNT = 'CUSTOMER_REPAYMENT_ACCOUNT',
}

export enum LoanInterestAccrualOptionEnum {
  ON_REQUEST_APPROVAL = 'ON_REQUEST_APPROVAL',
}

export enum LoanCustomTenorDurationEnum {
  DAYS = 'DAYS',
}

export enum LoanInterestValueEffectiveDateEnum {
  ON_APPROVAL = 'ON_APPROVAL',
  SCHEDULED_DATE = 'SCHEDULED_DATE',
}

export enum LoanBulletTypeEnum {
  NO_REPAYMENT = 'NO_REPAYMENT',
  PRINCIPAL_REPAYMENT = 'PRINCIPAL_REPAYMENT',
}

export enum LoanRequestTypeEnum {
  BOOKING = 'BOOKING',
}

export enum LoanInterestRateTypeEnum {
  FIXED = 'FIXED',
}

export enum LoanTypeNameEnum {
  CORPORATE = 'CORPORATE',
}

export enum LoanRecordStatusEnum {
  ACTIVE = 'ACTIVE',
}

export enum DocumentReleaseConditionEnum {
  DOCUMENT_AGAINST_PAYMENT = 'Document Against Payment',
  DOCUMENT_AGAINST_ACCEPTANCE = 'Document Against Acceptance',
  POUR_AVAL = 'Pour Aval',
  OTHER = 'Other',
}

export enum AcknowledgementTransmissionEnum {
  NONE = 'None',
  SWIFT = 'Swift',
  MAIL = 'Mail',
  TELEX = 'Telex',
}

export enum AcceptanceOptionsEnum {
  NONE = 'None',
  ADVISE_ACCEPTANCE = 'Advise Acceptance',
  ADVISE_NON_ACCEPTANCE = 'Advise Non-Acceptance',
}

export enum PaymentOptionsEnum {
  NONE = 'None',
  ADVISE_PAYMENT = 'Advise Payment',
  ADVISE_NON_PAYMENT = 'Advise Non-Payment',
}

export enum DocumentCodeEnum {
  BILL_OF_LADING = 'Bill of Lading',
  AIRWAY_BILL = 'Airway Bill',
  INVOICE = 'Invoice',
  PACKING_LIST = 'Packing List',
  INSURANCE_CERTIFICATE = 'Insurance Certificate',
  CERTIFICATE_OF_ORIGIN = 'Certificate of Origin',
  DRAFT = 'Draft',
}

export enum ChargesBorneByEnum {
  DRAWER = 'Drawer',
  DRAWEE = 'Drawee',
}

export enum BillingLevelEnum {
  CUSTOMER = 'Customer',
  TRANSACTION = 'Transaction',
  PRODUCT = 'Product',
}

export enum DeliveryMeansEnum {
  SWIFT = 'Swift',
  FIRST_CLASS_MAIL = 'First Class Mail',
  RECORDED_DELIVERY = 'Recorded Delivery',
  REGISTERED_MAIL = 'Registered Mail',
  AIR_MAIL = 'Air Mail',
  REGISTERED_AIR_MAIL = 'Registered Air Mail',
  HAND_DELIVERY = 'Hand Delivery',
  COURIER = 'Courier',
}

export enum BillsForCollectionAdviseByEnum {
  SWIFT = 'Swift',
  MAIL = 'Mail',
  TELEX = 'Telex',
}

export enum BillsForCollectionTenorStartBoundaryEnum {
  FROM = 'From',
  AFTER = 'After',
}

export enum BillsForCollectionPaymentPartyEnum {
  DRAWEE = 'Drawee',
  DRAWER = 'Drawer',
  COLLECTING_BANK = 'Collecting Bank',
  REMITTING_BANK = 'Remitting Bank',
  PRESENTING_BANK = 'Presenting Bank',
}

export enum BillsForCollectionPaymentActionEnum {
  PAY = 'Pay',
  PAY_WITH_FINANCING = 'Pay with Financing',
}

export enum BillsForCollectionNonAcceptanceOrNonPaymentActionEventTypeEnum {
  NON_ACCEPTANCE = 'Non-Acceptance',
  NON_PAYMENT = 'Non-Payment',
}

export enum BillsForCollectionAcceptanceEnum {
  ACCEPT_AND_HOLD = 'Accept and Hold',
  ACCEPT_AND_RETURN = 'Accept and Return',
  ACCEPT_AND_AVAL = 'Accept and Aval',
}
