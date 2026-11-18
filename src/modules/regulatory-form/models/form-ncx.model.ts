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

@Table({ modelName: 'form_ncx' })
export class FormNCX extends Model<FormNCX> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  formNCXId: string;

  @AllowNull
  @Column(DataType.INTEGER)
  id: number;

  // @AllowNull
  // @Column(DataType.BIGINT)
  // createdAt: number;

  // @AllowNull
  // @Column(DataType.BIGINT)
  // updatedAt: number;

  @AllowNull
  @Column(DataType.BIGINT)
  archivedAt: number;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('contact') || null;
    },
  })
  contact: any;

  @AllowNull
  @Column(DataType.STRING)
  tin: string;

  @AllowNull
  @Column(DataType.INTEGER)
  year: number;

  @AllowNull
  @Column(DataType.STRING)
  formType: string;

  @AllowNull
  @Column(DataType.STRING)
  statusCode: string;

  @Column(DataType.STRING)
  status: string;

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
  @Column(DataType.STRING)
  extensionNumberSerial: string;

  @AllowNull
  @Column(DataType.BIGINT)
  formNumberAssignedDate: number;

  @AllowNull
  @Column(DataType.STRING)
  amendmentNumberSerial: string;

  @Column(DataType.BOOLEAN)
  amendmentInit: boolean;

  @Column(DataType.BOOLEAN)
  cancelled: boolean;

  @Column(DataType.BOOLEAN)
  isDeleted: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  expireAt: number;

  @AllowNull
  @Column(DataType.INTEGER)
  expiryPeriod: number;

  @AllowNull
  @Column(DataType.BIGINT)
  dateSubmitted: number;

  @Column(DataType.BOOLEAN)
  activeProcess: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  currentStageDate: number;

  @Column(DataType.BOOLEAN)
  processReset: boolean;

  @AllowNull
  @Column(DataType.STRING)
  currentPVSVersion: string;

  @Column(DataType.STRING)
  consigneeName: string;

  @Column(DataType.STRING)
  consigneeEmail: string;

  @Column(DataType.STRING)
  consigneePhone: string;

  @Column(DataType.TEXT)
  consigneeAddressLine1: string;

  @AllowNull
  @Column(DataType.TEXT)
  consigneeAddressLine2: string;

  @Column(DataType.STRING)
  consigneeAddressCity: string;

  @Column(DataType.STRING)
  consigneeAddressState: string;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('consigneeCountry') || null;
    },
  })
  consigneeCountry: any;

  @AllowNull
  @Column(DataType.STRING)
  byOrderOf: string;

  @AllowNull
  @Column(DataType.STRING)
  nepcNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  cacNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  licenseNumber: string;

  @Column(DataType.STRING)
  rcNumber: string;

  @Column(DataType.STRING)
  accountNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  accountNumberPreAmend: string;

  @Column(DataType.STRING)
  processingFeeAccountNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  processingFeeAccountNumberPreAmend: string;

  @Column(DataType.STRING)
  sector: string;

  @AllowNull
  @Column(DataType.INTEGER)
  numOfItemsExpected: number;

  @Column(DataType.DECIMAL(18, 2))
  exchangeRate: number;

  @Column(DataType.DECIMAL(18, 2))
  exchangeRateApplicantCurrency: number;

  @Column(DataType.DECIMAL(18, 2))
  totalNetWeight: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  totalNetWeightExporter: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  ncsTotalNetWeight: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  meaTotalNetWeight: number;

  @Column(DataType.DECIMAL(18, 2))
  totalGrossWeight: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  totalGrossWeightExporter: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  ncsTotalGrossWeight: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  meaTotalGrossWeight: number;

  @Column(DataType.DECIMAL(18, 2))
  totalQuantity: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  totalQuantityExporter: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  ncsTotalQuantity: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  meaTotalQuantity: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  dprTotalQuantity: number;

  @Column(DataType.DECIMAL(18, 2))
  totalCF: number;

  @Column(DataType.DECIMAL(18, 2))
  totalFreightCharges: number;

  @Column(DataType.DECIMAL(18, 2))
  totalFoB: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  totalFoBExporter: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  totalDollarFoBExporter: number;

  @Column(DataType.DECIMAL(18, 2))
  totalDollarFoB: number;

  @Column(DataType.DECIMAL(18, 2))
  nessLevyPayable: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  nessLevyPaymentPercent: number;

  @Column(DataType.BOOLEAN)
  shipmentsCompleted: boolean;

  @Column(DataType.BOOLEAN)
  endShipmentsRequestApproved: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  endShipmentsRequestDate: number;

  @AllowNull
  @Column(DataType.STRING)
  endShipmentsRequestReason: string;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('designatedBank') || null;
    },
  })
  designatedBank: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('designatedBankPreAmend') || null;
    },
  })
  designatedBankPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('processingBank') || null;
    },
  })
  processingBank: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('processingBankPreAmend') || null;
    },
  })
  processingBankPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('processingBankBranch') || null;
    },
  })
  processingBankBranch: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('processingBankBranchPreAmend') || null;
    },
  })
  processingBankBranchPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('country') || null;
    },
  })
  country: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('countryPreAmend') || null;
    },
  })
  countryPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('countryExporter') || null;
    },
  })
  countryExporter: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('inspectionLocation') || null;
    },
  })
  inspectionLocation: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('inspectionLocationPreAmend') || null;
    },
  })
  inspectionLocationPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('transportationMode') || null;
    },
  })
  transportationMode: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('transportationModePreAmend') || null;
    },
  })
  transportationModePreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('portShipment') || null;
    },
  })
  portShipment: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('portShipmentPreAmend') || null;
    },
  })
  portShipmentPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('loadingTerminal') || null;
    },
  })
  loadingTerminal: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('loadingTerminalPreAmend') || null;
    },
  })
  loadingTerminalPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('currency') || null;
    },
  })
  currency: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('currencyPreAmend') || null;
    },
  })
  currencyPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('paymentMode') || null;
    },
  })
  paymentMode: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('paymentModePreAmend') || null;
    },
  })
  paymentModePreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('pia') || null;
    },
  })
  pia: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('piaPreAmend') || null;
    },
  })
  piaPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('ncs') || null;
    },
  })
  ncs: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('ted') || null;
    },
  })
  ted: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('monitoringMea') || null;
    },
  })
  monitoringMea: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('monitoringMeaPreAmend') || null;
    },
  })
  monitoringMeaPreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('tempShippingLine') || null;
    },
  })
  tempShippingLine: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('tempShippingLinePreAmend') || null;
    },
  })
  tempShippingLinePreAmend: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('dpr') || null;
    },
  })
  dpr: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('nonInspectionReasons') || [];
    },
  })
  nonInspectionReasons: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('pvsResponses') || [];
    },
  })
  pvsResponses: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('failedInspections') || [];
    },
  })
  failedInspections: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('permits') || [];
    },
  })
  permits: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('attachments') || [];
    },
  })
  attachments: any[];

  @AllowNull
  @Column(DataType.STRING)
  extension1PreStatusCode: string;

  @AllowNull
  @Column(DataType.BIGINT)
  extension1ExpirationDate: number;

  @AllowNull
  @Column(DataType.STRING)
  extension1Number: string;

  @AllowNull
  @Column(DataType.STRING)
  extension1Reason: string;

  @Column(DataType.BOOLEAN)
  extension1Init: boolean;

  @Column(DataType.BOOLEAN)
  extension1Complete: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  extension1RequestDate: number;

  @AllowNull
  @Column(DataType.BIGINT)
  extension1CompletedDate: number;

  @Column(DataType.BOOLEAN)
  dueExtension1: boolean;

  @AllowNull
  @Column(DataType.STRING)
  extension2PreStatusCode: string;

  @AllowNull
  @Column(DataType.BIGINT)
  extension2ExpirationDate: number;

  @AllowNull
  @Column(DataType.STRING)
  extension2Number: string;

  @AllowNull
  @Column(DataType.STRING)
  extension2Reason: string;

  @Column(DataType.BOOLEAN)
  extension2Init: boolean;

  @Column(DataType.BOOLEAN)
  extension2Complete: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  extension2RequestDate: number;

  @AllowNull
  @Column(DataType.BIGINT)
  extension2CompletedDate: number;

  @Column(DataType.BOOLEAN)
  dueExtension2: boolean;

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

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('initialShipment') || null;
    },
  })
  initialShipment: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('shipmentTmp') || null;
    },
  })
  shipmentTmp: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('shipments') || [];
    },
  })
  shipments: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('lockedBy') || null;
    },
  })
  lockedBy: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('amendments') || [];
    },
  })
  amendments: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('workflowNotes') || [];
    },
  })
  workflowNotes: any[];

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
  amendmentComplete: boolean;

  @AllowNull
  @Column(DataType.BIGINT)
  amendmentRequestDate: number;

  @AllowNull
  @Column(DataType.BIGINT)
  amendmentCompletedDate: number;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any[] {
      return this.getDataValue('amendmentAttachments') || [];
    },
  })
  amendmentAttachments: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('amendmentHistory') || null;
    },
  })
  amendmentHistory: any;

  @Column({
    type: DataType.JSON,
    get(this: FormNCX): any {
      return this.getDataValue('einvoice') || null;
    },
  })
  einvoice: any;

  @Column(DataType.BOOLEAN)
  oilExport: boolean;

  // Additional fields for internal use
  @Column(DataType.DATE)
  dateCreated: Date;

  @AllowNull
  @Column(DataType.STRING)
  stage: string;

  @AllowNull
  @Column(DataType.STRING)
  nairaAccountNumber: string;

  @Column(DataType.DECIMAL(18, 2))
  fob: number;

  @Column(DataType.STRING)
  exporterName: string;

  @Column(DataType.STRING)
  exporterTIN: string;

  @Column(DataType.STRING)
  exporterRCNumber: string;

  @Column(DataType.STRING)
  exporterEmail: string;

  @Column(DataType.STRING)
  exporterPhone: string;

  @Column(DataType.TEXT)
  exporterAddress: string;

  @Column(DataType.STRING)
  nepcRegistrationNumber: string;

  @Column(DataType.STRING)
  modeOfTransportation: string;

  @Column(DataType.STRING)
  portOfShipment: string;

  @Column(DataType.STRING)
  destinationCountry: string;

  @Column(DataType.STRING)
  partOfDestination: string;

  @Column(DataType.STRING)
  mea: string;

  @Column(DataType.STRING)
  temporaryShippingLine: string;

  @Column(DataType.STRING)
  piaName: string;

  @Column(DataType.STRING)
  piaInspectionLocation: string;

  @AllowNull
  @Column(DataType.STRING)
  currencyCode: string;

  @AllowNull
  @Column(DataType.INTEGER)
  applicantId: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  initialShipmentNessLevyPayable: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  initialShipmentTotalQuantity: number;

  @AllowNull
  @Column(DataType.DECIMAL(18, 2))
  initialShipmentTotalDollarFoB: number;

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
