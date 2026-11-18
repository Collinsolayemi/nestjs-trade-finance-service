import { BillsForCollectionService } from './bills-for-collection.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseUUIDPipe,
  Param,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
  Patch,
  Delete,
  ParseEnumPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookBillsForCollectionDto } from './dto/book-bills-for-collection.dto';
import { AuthenticatedRequest } from 'src/common/interfaces';
import { BillsForCollectionResponseDto } from './dto/bills-for-collection-response.dto';
import { AmendBillsForCollectionDto } from './dto/amend-bills-for-collection.dto';
import { AdjustBillsForCollectionDto } from './dto/adjust-bills-for-collection.dto';
import { AcceptBillsForCollectionDto } from './dto/accept-bills-for-collection.dto';
import { NonAcceptanceOrNonPaymentBillsForCollectionDto } from './dto/non-acceptance-or-non-payment-bills-for-collection.dto';
import { PayBillsForCollectionDto } from './dto/pay-bills-for-collection.dto';
import { ReceiveAcknowledgementBillsForCollectionDto } from './dto/receive-acknowledgement-bills-for-collection.dto';
import { AuthorizeBillsForCollectionDto } from './dto/authorize-bills-for-collection.dto';
import { GetBillsForCollectionRecordsDto } from './dto/get-bills-for-collection-records.dto';
import { GetRecordsStatusCountDto } from 'src/common/dto/get-records-status-count.dto';
import {
  BillsForCollectionProductTypeEnum,
  RequestStatusEnum,
} from 'src/common/enums';
import { BillsForCollectionFreeFormatMessageDto } from './dto/bills-for-collection-free-format-message.dto';
import { CloseBillsForCollectionDto } from './dto/close-bills-for-collection.dto';

@Controller('bills-for-collection')
@ApiTags('bills-for-collection')
export class BillsForCollectionController {
  constructor(
    private readonly billsForCollectionService: BillsForCollectionService,
  ) {}

  @Post('/get-debit-and-credit-entries')
  @ApiBody({ type: Object })
  async getDebitAndCreditEntries(
    @Body() body: any,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;

    const debitAndCreditEntries =
      await this.billsForCollectionService.getDebitAndCreditEntries(
        body,
        token,
      );

    return {
      statusCode: HttpStatus.CREATED,
      data: debitAndCreditEntries,
      message:
        'Bills For Collection Debit and Credit Entries Calculated Successfully',
    };
  }

  @Post('draft')
  @ApiBody({ type: Object })
  async saveBillsForCollectionAsDraft(
    @Body() body: any,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const billsForCollectionDraftRequest =
      await this.billsForCollectionService.saveBillsForCollectionAsDraft({
        initiatorId,
        initiator: `${firstname} ${lastname}`,
        initiatorBranchCode,
        tenantId,
        initiatorDepartment,
        userPermissions,
        ...body,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionDraftRequest,
      message: `Bills For Collection Request Saved as Draft by ${firstname} ${lastname}`,
      requestId: billsForCollectionDraftRequest?.requestId,
    };
  }

  @Post('book')
  @ApiBody({ type: BookBillsForCollectionDto })
  async bookBillsForCollectionRequest(
    @Body() body: BookBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const billsForCollectionRequestData =
      await this.billsForCollectionService.bookBillsForCollectionRequest({
        ...body,
        initiatorId,
        initiator: `${firstname} ${lastname}`,
        initiatorBranchCode,
        tenantId,
        initiatorDepartment,
        userPermissions,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionRequestData,
      message: `Bills For Collection Booking Request ${billsForCollectionRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Post('amend')
  @ApiBody({ type: AmendBillsForCollectionDto })
  async amendBillsForCollectionRequest(
    @Body() body: AmendBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const billsForCollectionRequestData =
      await this.billsForCollectionService.amendBillsForCollection({
        ...body,
        ...userData,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionRequestData,
      message: `Bills For Collection Amendment Request ${billsForCollectionRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Post('adjust')
  @ApiBody({ type: AdjustBillsForCollectionDto })
  async adjustBillsForCollectionRequest(
    @Body() body: AdjustBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const billsForCollectionRequestData =
      await this.billsForCollectionService.adjustBillsForCollection({
        ...body,
        ...userData,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionRequestData,
      message: `Bills For Collection Adjustment Request ${billsForCollectionRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Post('accept')
  @ApiBody({ type: AcceptBillsForCollectionDto })
  async acceptBillsForCollectionRequest(
    @Body() body: AcceptBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const billsForCollectionRequestData =
      await this.billsForCollectionService.acceptBillsForCollection({
        ...body,
        ...userData,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionRequestData,
      message: `Bills For Collection Acceptance Request ${billsForCollectionRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Post('non-acceptance-or-non-payment')
  @ApiBody({ type: NonAcceptanceOrNonPaymentBillsForCollectionDto })
  async nonAcceptanceOrNonPaymentBillsForCollectionRequest(
    @Body() body: NonAcceptanceOrNonPaymentBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const billsForCollectionRequestData =
      await this.billsForCollectionService.nonAcceptanceOrNonPaymentBillsForCollection(
        {
          ...body,
          ...userData,
          token,
        },
      );

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionRequestData,
      message: `Bills For Collection Non Acceptance Or Non Payment Request ${billsForCollectionRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Post('pay')
  @ApiBody({ type: PayBillsForCollectionDto })
  async payBillsForCollectionRequest(
    @Body() body: PayBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const billsForCollectionRequestData =
      await this.billsForCollectionService.payBillsForCollection({
        ...body,
        ...userData,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionRequestData,
      message: `Bills For Collection Payment Request ${billsForCollectionRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Post('receive-acknowledgement')
  @ApiBody({ type: ReceiveAcknowledgementBillsForCollectionDto })
  async receiveAcknowledgementBillsForCollectionRequest(
    @Body() body: ReceiveAcknowledgementBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const billsForCollectionRequestData =
      await this.billsForCollectionService.receiveAcknowledgementBillsForCollection(
        {
          ...body,
          ...userData,
          token,
        },
      );

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionRequestData,
      message: `Bills For Collection Receive Acknowledgement Request ${billsForCollectionRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Post('free-format')
  @ApiBody({ type: BillsForCollectionFreeFormatMessageDto })
  async freeFormat(
    @Body() body: BillsForCollectionFreeFormatMessageDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const billsForCollectionFreeFormatData =
      await this.billsForCollectionService.freeFormat({
        initiatorId,
        initiator: `${firstname} ${lastname}`,
        initiatorBranchCode,
        tenantId,
        initiatorDepartment,
        userPermissions,
        token,
        ...body,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionFreeFormatData,
      message: `Bills For Collection Free Format Request ${billsForCollectionFreeFormatData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: billsForCollectionFreeFormatData?.requestId,
    };
  }

  @Post('close')
  @ApiBody({ type: CloseBillsForCollectionDto })
  async closeBillsForCollectionRequest(
    @Body() body: CloseBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const billsForCollectionRequestData =
      await this.billsForCollectionService.closeBillsForCollection({
        ...body,
        ...userData,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: billsForCollectionRequestData,
      message: `Bills For Collection Closure Request ${billsForCollectionRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Patch(':id/authorize')
  @ApiBody({ type: AuthorizeBillsForCollectionDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AuthorizeBillsForCollectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const token = req?.headers?.authorization;
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
    } = req.user;

    const billsForCollectionRequestData =
      await this.billsForCollectionService.authorize({
        id,
        ...body,
        approver: `${firstname} ${lastname}`,
        approverId,
        approverBranchCode,
        approverDepartment,
        token,
      });

    return {
      statusCode: HttpStatus.OK,
      data: billsForCollectionRequestData,
      message: `Bills For Collection ${billsForCollectionRequestData?.billsForCollectionActionType.toLowerCase()} Request ${body?.approvalStatus.toLowerCase()} by ${firstname} ${lastname}`,
      requestId: billsForCollectionRequestData?.requestId,
    };
  }

  @Patch(':id/withdraw')
  async withdraw(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const { id: initiatorId, firstname, lastname } = req.user;

    const billsForCollectionWithdrawalData =
      await this.billsForCollectionService.withdraw(id, initiatorId);

    return {
      statusCode: HttpStatus.OK,
      data: billsForCollectionWithdrawalData,
      message: `Bills For Collection Request Withdrawn by ${firstname} ${lastname}`,
      requestId: billsForCollectionWithdrawalData?.requestId,
    };
  }

  @Delete(':id/delete')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const { id: initiatorId, firstname, lastname } = req.user;

    const billsForCollectionDeletionData =
      await this.billsForCollectionService.delete(id, initiatorId);

    return {
      statusCode: HttpStatus.OK,
      data: billsForCollectionDeletionData,
      message: `Bills For Collection Request Deleted by ${firstname} ${lastname}`,
      requestId: id,
    };
  }

  @Get('status-count')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecordsStatusCount(
    @Query() query: GetRecordsStatusCountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { statusType, recordScope, requestStatus } = query;
    const { id, branch } = req.user;

    const recordsStatusCount =
      await this.billsForCollectionService.getRecordsStatusCount(
        id,
        branch,
        statusType,
        recordScope,
        requestStatus,
      );

    return {
      statusCode: HttpStatus.OK,
      data: recordsStatusCount,
      message:
        'Bills For Collection Records Status Count Fetched Successfully.',
    };
  }

  @Get('records')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBillsForCollectionRecords(
    @Query() query: GetBillsForCollectionRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      recordScope,
      bfcProductType,
      bfcState,
      billCode,
      applicantName,
    } = query;
    const { id, branch } = req.user;

    const billsForCollectionRecords =
      await this.billsForCollectionService.getBillsForCollectionRecords({
        id,
        branch,
        page,
        size,
        startDate,
        endDate,
        recordScope,
        bfcProductType,
        bfcState,
        billCode,
        applicantName,
      });

    return {
      statusCode: HttpStatus.OK,
      data: billsForCollectionRecords,
      message: 'Bills For Collection Records Fetched Successfully.',
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBillsForCollectionRequests(
    @Query() query: GetBillsForCollectionRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<BillsForCollectionResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
      approvalStatus,
      bfcStatus,
      bfcProductType,
      bfcState,
      billCode,
      applicantName,
    } = query;
    const { id, branch } = req.user;

    const billsForCollectionRecords =
      await this.billsForCollectionService.getBillsForCollectionRequests({
        id,
        branch,
        page,
        size,
        startDate,
        endDate,
        requestStatus,
        recordScope,
        isAuthorizer,
        approvalStatus,
        bfcStatus,
        bfcProductType,
        bfcState,
        billCode,
        applicantName,
      });

    return {
      statusCode: HttpStatus.OK,
      data: billsForCollectionRecords,
      message: 'Bills For Collection Requests Fetched Successfully.',
    };
  }

  private extractRequesterDetails(req: AuthenticatedRequest) {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    return {
      initiatorId,
      initiator: `${firstname} ${lastname}`,
      initiatorBranchCode,
      tenantId,
      initiatorDepartment,
      userPermissions,
    };
  }

  @Get('reference-number')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBillsForCollectionRecordByReferenceNumber(
    @Query('referenceNumber') referenceNumber: string,
  ): Promise<BillsForCollectionResponseDto> {
    const billsForCollection =
      await this.billsForCollectionService.getBillsForCollectionRecordByReferenceNumber(
        referenceNumber,
      );

    return {
      statusCode: HttpStatus.OK,
      data: billsForCollection,
      message: 'Bills For Collection Record Fetched Successfully.',
    };
  }

  @Get('application-number')
  @ApiQuery({
    name: 'billsForCollectionProductType',
    enum: BillsForCollectionProductTypeEnum,
    required: true,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async validateRegulatoryFormForBillsForCollectionRequestInitiation(
    @Query('applicationNumber') applicationNumber: string,
    @Query(
      'billsForCollectionProductType',
      new ParseEnumPipe(BillsForCollectionProductTypeEnum),
    )
    billsForCollectionProductType: BillsForCollectionProductTypeEnum,
  ): Promise<BillsForCollectionResponseDto> {
    const validationResult =
      await this.billsForCollectionService.validateRegulatoryFormForBillsForCollectionRequestInitiation(
        applicationNumber,
        billsForCollectionProductType,
      );

    return {
      statusCode: HttpStatus.OK,
      data: validationResult,
      message:
        'Form M Validation for Bills For Collection Issuance Successful.',
    };
  }

  @Get('get-by-id/:id')
  @ApiQuery({
    name: 'isRecord',
    required: false,
    type: Boolean,
    description: 'When true, load the issued record; otherwise the request',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBillsForCollectionByRequestId(
    @Param('id') requestId: string,
    @Query('isRecord', new ParseBoolPipe({ optional: true }))
    isRecord?: boolean,
  ): Promise<BillsForCollectionResponseDto> {
    const billsForCollection =
      await this.billsForCollectionService.getBillsForCollectionByRequestId(
        requestId,
        isRecord,
      );

    return {
      statusCode: HttpStatus.OK,
      data: billsForCollection,
      message: `Bills For Collection ${isRecord ? 'Record' : 'Request'} Fetched Successfully.`,
    };
  }

  @Get(':regulatoryFormNumber')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBillsForCollectionByRegulatoryFormNumber(
    @Param('regulatoryFormNumber') regulatoryFormNumber: string,
  ): Promise<BillsForCollectionResponseDto> {
    const billsForCollection =
      await this.billsForCollectionService.getBillsForCollectionByRegulatoryFormNumber(
        regulatoryFormNumber,
      );

    return {
      statusCode: HttpStatus.OK,
      data: billsForCollection,
      message: 'Bills For Collection Record Fetched Successfully.',
    };
  }
}
