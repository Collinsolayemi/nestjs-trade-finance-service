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
import { Item, Log } from 'src/common/interfaces';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'form_m' })
export class FormM extends Model<FormM> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  formMId: string;

  @Column(DataType.STRING)
  typeOfFormX: string;

  @Column(DataType.BOOLEAN)
  validForex: boolean;

  @Column(DataType.INTEGER)
  year: number;

  @Unique
  @Column(DataType.STRING)
  @Index
  applicationNumber: string;

  @Unique
  @Column(DataType.STRING)
  formNumber: string;

  @Column(DataType.STRING)
  prefix: string;

  @Column(DataType.DATE)
  validUntil: Date;

  @Column(DataType.STRING)
  bankCode: string;

  @Column(DataType.STRING)
  bankBranchCode: string;

  @Column(DataType.STRING)
  bankNumbering: string;

  @Column(DataType.STRING)
  applicantName: string;

  @Column(DataType.TEXT)
  applicantAddress: string;

  @Column(DataType.STRING)
  applicantStateCode: string;

  @Column(DataType.STRING)
  applicantCity: string;

  @Column(DataType.STRING)
  applicantPhone: string;

  @Column(DataType.STRING)
  applicantFax: string;

  @Column(DataType.STRING)
  applicantMail: string;

  @Column(DataType.STRING)
  applicantRCNumber: string;

  @Column(DataType.STRING)
  applicantTINNumber: string;

  @Column(DataType.STRING)
  applicantNepcNumber: string;

  @AllowNull
  @Column(DataType.STRING)
  applicantPassportNumber: string;

  @Column(DataType.STRING)
  beneficiaryName: string;

  @Column(DataType.TEXT)
  beneficiaryAddress: string;

  @Column(DataType.STRING)
  beneficiaryPhone: string;

  @Column(DataType.STRING)
  beneficiaryFax: string;

  @Column(DataType.STRING)
  beneficiaryMail: string;

  @Column(DataType.STRING)
  beneficiaryCountryCode: string;

  @Column(DataType.STRING)
  beneficiaryByOrder: string;

  @Column(DataType.TEXT)
  goodsDescription: string;

  @Column(DataType.FLOAT)
  goodsNetWeight: number;

  @Column(DataType.INTEGER)
  totalNumberOfItems: number;

  @Column(DataType.FLOAT)
  totalFOBValue: number;

  @Column(DataType.FLOAT)
  totalTotalAncillaryCharges: number;

  @Column(DataType.STRING)
  currencyCode: string;

  @Column(DataType.FLOAT)
  currencyExchangeRate: number;

  @Column(DataType.FLOAT)
  insuranceCosts: number;

  @Column(DataType.FLOAT)
  totalCAndF: number;

  @Column(DataType.STRING)
  sourceOfFunds: string;

  @Column(DataType.STRING)
  proformaInvoiceNumber: string;

  @Column(DataType.DATE)
  proformaInvoiceDate: Date;

  @Column(DataType.STRING)
  termsOfDelivery: string;

  @Column(DataType.STRING)
  modeOfPaymentCode: string;

  @Column(DataType.DATE)
  paymentDate: Date;

  @Column(DataType.STRING)
  modeOfTransferCode: string;

  @Column(DataType.STRING)
  countryOfOrigin: string;

  @Column(DataType.STRING)
  countryOfSupply: string;

  @Column(DataType.STRING)
  modeOfTransport: string;

  @Column(DataType.STRING)
  portOfDischarge: string;

  @Column(DataType.STRING)
  portOfDestination: string;

  @Column(DataType.STRING)
  cuoCode: string;

  @Column(DataType.STRING)
  airTicketNumber: string;

  @Column(DataType.STRING)
  airline: string;

  @Column(DataType.DATE)
  shipmentDate: Date;

  @Column(DataType.STRING)
  route: string;

  @Column(DataType.STRING)
  scanningCompany: string;

  @Column(DataType.STRING)
  designatedBank: string;

  @Column(DataType.STRING)
  endorsementApplicantRepresentative: string;

  @Column(DataType.DATE)
  applicantEndorsementDate: Date;

  @Column(DataType.STRING)
  endorsementAuthorizedDealer: string;

  @Column(DataType.DATE)
  authorizedDealersEndorsementDate: Date;

  @Column(DataType.STRING)
  status: string;

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

  @Column({
    type: DataType.JSON,
    get(this: FormM): Item[] {
      return this.getDataValue('items') || [];
    },
  })
  items: Item[];

  @Column({
    type: DataType.JSON,
    get(this: FormM): any[] {
      return this.getDataValue('attachments') || [];
    },
  })
  attachments: any[];

  @Column({
    type: DataType.JSON,
    get(this: FormM): Log[] {
      return this.getDataValue('logs') || [];
    },
  })
  logs: Log[];

  @Column(DataType.STRING)
  chargesAndTaxesTransactionId: string;
}
