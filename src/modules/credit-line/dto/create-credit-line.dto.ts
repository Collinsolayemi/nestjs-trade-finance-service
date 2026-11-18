import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { RequestTypeEnum } from 'src/common/enums';
import { uuidv7 } from 'uuidv7';

export class CreateCreditLineDto {
  @IsEnum(RequestTypeEnum)
  @IsNotEmpty()
  requestType: RequestTypeEnum;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.requestType !== RequestTypeEnum.CREATION)
  creditLineId: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.requestType === RequestTypeEnum.CREATION)
  creditLineName: string;

  @ApiProperty({ example: 'NGN' })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.requestType === RequestTypeEnum.CREATION)
  currencyCode: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.requestType === RequestTypeEnum.CREATION)
  counterparty: string;

  @ApiProperty({ example: 0.0 })
  @IsNumber()
  @IsDefined()
  @ValidateIf((o) => o.requestType === RequestTypeEnum.CREATION)
  confirmationLineAmount: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsDefined()
  @ValidateIf((o) => o.requestType === RequestTypeEnum.CREATION)
  costOfFundRate: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsDefined()
  @ValidateIf((o) => o.requestType === RequestTypeEnum.CREATION)
  marginRate: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsDefined()
  @ValidateIf((o) => o.requestType === RequestTypeEnum.CREATION)
  totalInterestRate: number;
}

export class RequestTypes {
  static creation = {
    requestType: 'Creation',
    creditLineName: '',
    currencyCode: 'NGN',
    counterparty: '',
    confirmationLineAmount: 0,
    costOfFundRate: 0,
    marginRate: 0,
    totalInterestRate: 0,
  };
  static modification = {
    creditLineId: uuidv7(),
    ...this.creation,
    requestType: 'Modification',
  };
  static deactivation = {
    requestType: 'Deactivation',
    creditLineId: uuidv7(),
    supportingDocumentUrl: 'https://',
    reasonForDeactivation: 'Deactivating because...',
  };
  static activation = { requestType: 'Activation', creditLineId: uuidv7() };
}

export class CreditLineDto {
  @Expose()
  creditLineName: string;

  @Expose()
  currencyCode: string;

  @Expose()
  counterparty: string;

  @Expose()
  confirmationLineAmount: number;

  @Expose()
  costOfFundRate: number;

  @Expose()
  marginRate: number;

  @Expose()
  totalInterestRate: number;

  @Expose()
  initiator?: string;

  @Expose()
  initiatorId?: string;

  @Expose()
  initiatorBranchCode?: string;

  @Expose()
  initiatorDepartment?: string;

  @Expose()
  approver?: string;

  @Expose()
  approverId?: string;

  @Expose()
  approverBranchCode?: string;

  @Expose()
  approverDepartment?: string;
}
