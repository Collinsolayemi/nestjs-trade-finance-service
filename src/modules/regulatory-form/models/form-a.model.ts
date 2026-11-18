import {
  AllowNull,
  Column,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'form_a' })
export class FormA extends Model<FormA> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  formAId: string;

  @AllowNull
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull
  @Column(DataType.BIGINT)
  archivedAt: number;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('contact') || null;
    },
  })
  contact: any;

  @AllowNull
  @Column(DataType.INTEGER)
  validForForex: number;

  @AllowNull
  @Column(DataType.INTEGER)
  year: number;

  @Unique
  @Column(DataType.STRING)
  @Index
  applicationNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  lastApplicationNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  formNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  formNumberSerial: string;

  @AllowNull
  @Column(DataType.STRING)
  cancellationNumberSerial: string;

  @AllowNull
  @Column(DataType.BIGINT)
  dateSubmitted: number;

  @AllowNull
  @Column(DataType.STRING)
  sectorCode: string;

  @Column(DataType.STRING)
  status: string;

  @AllowNull
  @Column(DataType.STRING)
  statusCode: string;

  @AllowNull
  @Column(DataType.STRING)
  formType: string;

  @AllowNull
  @Column(DataType.STRING)
  applicantType: string;

  @AllowNull
  @Column(DataType.STRING)
  cciNumber: string;

  @AllowNull
  @Column(DataType.BOOLEAN)
  cancelled: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  cancelledAt: number;

  @AllowNull
  @Column(DataType.BIGINT)
  expireAt: number;

  @AllowNull
  @Column(DataType.INTEGER)
  expiryPeriod: number;

  @Column(DataType.BOOLEAN)
  isDeleted: boolean;

  @AllowNull
  @Column(DataType.STRING)
  processingFeeAccountNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  processingFeeAccountNumberPreAmend: string;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('rejectionStakeholder') || null;
    },
  })
  rejectionStakeholder: any;

  @Column(DataType.BOOLEAN)
  activeProcess: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  currentStageDate: number;

  @AllowNull
  @Column(DataType.BOOLEAN)
  processReset: boolean;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('paymentMode') || null;
    },
  })
  paymentMode: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('paymentModePreAmend') || null;
    },
  })
  paymentModePreAmend: any;

  @AllowNull
  @Column(DataType.FLOAT)
  exchangeRate: number;

  @AllowNull
  @Column(DataType.BIGINT)
  approvedDate: number;

  @AllowNull
  @Column(DataType.STRING)
  applicantName: string;

  @AllowNull
  @Column(DataType.STRING)
  applicantPhone: string;

  @AllowNull
  @Column(DataType.STRING)
  applicantEmail: string;

  @AllowNull
  @Column(DataType.STRING)
  applicantTINBVN: string;

  @AllowNull
  @Column(DataType.STRING)
  applicantRcNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  applicantAddress: string;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('transactionPurpose') || null;
    },
  })
  transactionPurpose: any;

  @AllowNull
  @Column(DataType.STRING)
  transactionPurposeOther: string;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('transactionPurposePreAmend') || null;
    },
  })
  transactionPurposePreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('ted') || null;
    },
  })
  ted: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('branch') || null;
    },
  })
  branch: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('branchPreAmend') || null;
    },
  })
  branchPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('processingBank') || null;
    },
  })
  processingBank: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('processingBankPreAmend') || null;
    },
  })
  processingBankPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('approvingStakeholder') || null;
    },
  })
  approvingStakeholder: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('disbursementStakeholder') || null;
    },
  })
  disbursementStakeholder: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('processingBankBranch') || null;
    },
  })
  processingBankBranch: any;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('processingBankBranchPreAmend') || null;
    },
  })
  processingBankBranchPreAmend: any;

  @AllowNull
  @Column(DataType.BOOLEAN)
  tedApproved: boolean;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('beneficiaries') || [];
    },
  })
  beneficiaries: any[];

  @Column(DataType.BOOLEAN)
  disbursementsCloseOut: boolean;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('endDisbursementsRequests') || [];
    },
  })
  endDisbursementsRequests: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('attachments') || [];
    },
  })
  attachments: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('workflowNotes') || [];
    },
  })
  workflowNotes: any[];

  @AllowNull
  @Column(DataType.STRING)
  preCancellationRequestStatus: string;

  @AllowNull
  @Column(DataType.STRING)
  cancellationNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  cancellationReason: string;

  @Column(DataType.BOOLEAN)
  cancellationInit: boolean;

  @Column(DataType.BOOLEAN)
  cancellationComplete: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  cancellationRequestDate: number;

  @AllowNull
  @Column(DataType.BIGINT)
  cancellationCompletedDate: number;

  @AllowNull
  @Column(DataType.STRING)
  amendmentNumberSerial: string;

  @AllowNull
  @Column(DataType.STRING)
  preAmendmentRequestStatus: string;

  @AllowNull
  @Column(DataType.STRING)
  amendmentNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  amendmentReason: string;

  @Column(DataType.BOOLEAN)
  amendmentInit: boolean;

  @Column(DataType.BOOLEAN)
  amendmentComplete: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  amendmentRequestDate: number;

  @AllowNull
  @Column(DataType.BIGINT)
  amendmentCompletedDate: number;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('amendmentAttachments') || [];
    },
  })
  amendmentAttachments: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('amendmentHistory') || null;
    },
  })
  amendmentHistory: any;

  @AllowNull
  @Column(DataType.STRING)
  extension1PreRequestStatusCode: string;

  @AllowNull
  @Column(DataType.STRING)
  extension1Reason: string;

  @Column(DataType.BOOLEAN)
  extension1Init: boolean;

  @Column(DataType.BOOLEAN)
  extension1Complete: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  extension1DateRequest: number;

  @AllowNull
  @Column(DataType.BIGINT)
  extension1DateCompleted: number;

  @AllowNull
  @Column(DataType.STRING)
  extension2PreRequestStatusCode: string;

  @AllowNull
  @Column(DataType.STRING)
  extension2Reason: string;

  @Column(DataType.BOOLEAN)
  extension2Init: boolean;

  @Column(DataType.BOOLEAN)
  extension2Complete: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  extension2DateRequest: number;

  @AllowNull
  @Column(DataType.BIGINT)
  extension2DateCompleted: number;

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('amendments') || [];
    },
  })
  amendments: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormA): any {
      return this.getDataValue('lockedBy') || null;
    },
  })
  lockedBy: any;

  @AllowNull
  @Column(DataType.BIGINT)
  timeLocked: number;

  @AllowNull
  @Column(DataType.STRING)
  currencyCode: string;

  @Column(DataType.BOOLEAN)
  isChargeTaken: boolean;

  @Column(DataType.BOOLEAN)
  isAccountRestrictionValid: boolean;

  @Column(DataType.BOOLEAN)
  isCustomerAccountValid: boolean;

  @Column(DataType.BOOLEAN)
  isBalanceEnquiryValid: boolean;

  @Column(DataType.BOOLEAN)
  isWatchlistStatusValid: boolean;

  @Column(DataType.INTEGER)
  stpExceptionCount: number;

  @Column(DataType.STRING)
  customerAccount: string;

  @Column(DataType.BOOLEAN)
  isTaken: boolean;

  @Column(DataType.STRING)
  chargesAndTaxesTransactionId: string;
}
