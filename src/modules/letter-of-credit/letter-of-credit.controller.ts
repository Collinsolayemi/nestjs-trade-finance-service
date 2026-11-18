import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LetterOfCreditService } from './letter-of-credit.service';
import { AuthenticatedRequest } from 'src/common/interfaces';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IssueLetterOfCreditDto } from './dto/issue-letter-of-credit.dto';
import { LetterOfCreditResponseDto } from './dto/letter-of-credit-response.dto';
import { AdjustLetterOfCreditDto } from './dto/adjust-letter-of-credit.dto';
import { AuthorizeLetterOfCreditDto } from './dto/authorize-letter-of-credit.dto';
import { CancelLetterOfCreditDto } from './dto/cancel-letter-of-credit.dto';
import { GetRecordsStatusCountDto } from '../../common/dto/get-records-status-count.dto';
import { GetLetterOfCreditRecordsDto } from './dto/get-letter-of-credit-records.dto';
import { AmendLetterOfCreditDto } from './dto/amend-letter-of-credit.dto';
import { LetterOfCreditFreeFormatMessageDto } from './dto/letter-of-credit-free-format-message.dto';
import { SearchLetterOfCreditTemplateRecordsDto } from './dto/get-letter-of-credit-template-records.dto';
import { LetterOfCreditPaymentDto } from './dto/letter-of-credit-payment.dto';
import { LetterOfCreditDocumentLodgmentDto } from './dto/letter-of-credit-document-lodgment.dto';
import { LetterOfCreditAssignmentOfProceedDto } from './dto/add-letter-of-credit-assignment-of-proceed.dto';
import {
  LetterOfCreditProductTypeEnum,
  PermissionEnum,
  RequestStatusEnum,
} from 'src/common/enums';
import { Permissions } from 'src/common/decorators';

@Controller('letter-of-credit')
@ApiTags('letter-of-credit')
export class LetterOfCreditController {
  constructor(private readonly letterOfCreditService: LetterOfCreditService) {}

  @Post('swift-message/preview')
  @ApiBody({ type: Object })
  async previewSwiftMessage(
    @Body() body: any,
  ): Promise<LetterOfCreditResponseDto> {
    const swiftMessage =
      await this.letterOfCreditService.previewSwiftMessage(body);

    return {
      statusCode: HttpStatus.CREATED,
      data: swiftMessage,
      message: 'Preview Swift Message',
    };
  }

  @Post('/get-debit-and-credit-entries')
  @ApiBody({ type: Object })
  async getDebitAndCreditEntries(
    @Body() body: any,
    @Req() req: AuthenticatedRequest,
  ): Promise<any> {
    const token = req?.headers?.authorization;
    const debitAndCreditEntries =
      await this.letterOfCreditService.getDebitAndCreditEntries(body, token);

    return {
      statusCode: HttpStatus.CREATED,
      data: debitAndCreditEntries,
      message:
        'Letter of Credit Debit and Credit Entries Calculated Successfully',
    };
  }

  @Post('draft')
  @ApiBody({ type: Object })
  async saveLetterOfCreditAsDraft(
    @Body() body: any,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const letterOfCreidtDraftRequest =
      await this.letterOfCreditService.saveLetterOfCreditAsDraft({
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
      data: letterOfCreidtDraftRequest,
      message: `Letter Of Credit Request Saved as Draft by ${firstname} ${lastname}`,
      requestId: letterOfCreidtDraftRequest?.requestId,
    };
  }

  @Post('initiate')
  @Permissions([PermissionEnum.ISSUE_LETTER_OF_CREDIT])
  @ApiBody({ type: IssueLetterOfCreditDto })
  async initiate(
    @Body() body: IssueLetterOfCreditDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
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

    const letterOfCreditInitiationData =
      await this.letterOfCreditService.initiate({
        token,
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
      data: letterOfCreditInitiationData,
      message: `Letter Of Credit Issuance Request ${letterOfCreditInitiationData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: letterOfCreditInitiationData?.requestId,
    };
  }

  @Post('amend')
  @Permissions([PermissionEnum.AMEND_LETTER_OF_CREDIT])
  @ApiBody({ type: AmendLetterOfCreditDto })
  async amend(
    @Body() body: AmendLetterOfCreditDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
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

    const letterOfCreidtAmendmentRequestData =
      await this.letterOfCreditService.amend({
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
      data: letterOfCreidtAmendmentRequestData,
      message: `Letter Of Credit Amendment Request ${letterOfCreidtAmendmentRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: letterOfCreidtAmendmentRequestData?.requestId,
    };
  }

  @Post('adjust')
  @ApiBody({ type: AdjustLetterOfCreditDto })
  async adjust(
    @Body() body: AdjustLetterOfCreditDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
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

    const letterOfCreidtAdjustmentRequestData =
      await this.letterOfCreditService.adjust({
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
      data: letterOfCreidtAdjustmentRequestData,
      message: `Letter Of Credit Adjustment Request ${letterOfCreidtAdjustmentRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: letterOfCreidtAdjustmentRequestData?.requestId,
    };
  }

  @Post('payment')
  @Permissions([PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT])
  @ApiBody({ type: LetterOfCreditPaymentDto })
  async payment(
    @Body() body: LetterOfCreditPaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
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

    const letterOfCreidtPaymentRequestData =
      await this.letterOfCreditService.payment({
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
      data: letterOfCreidtPaymentRequestData,
      message: `Letter Of Credit Payment Request ${letterOfCreidtPaymentRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: letterOfCreidtPaymentRequestData?.requestId,
    };
  }

  @Post('assignment-of-proceed')
  @ApiBody({ type: LetterOfCreditAssignmentOfProceedDto })
  async assignmentOfProceed(
    @Body() body: LetterOfCreditAssignmentOfProceedDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
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

    const letterOfCreditAssignmentOfProceedRequestData =
      await this.letterOfCreditService.assignmentOfProceed({
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
      data: letterOfCreditAssignmentOfProceedRequestData,
      message: `Letter Of Credit Assignment of Proceed Request ${letterOfCreditAssignmentOfProceedRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: letterOfCreditAssignmentOfProceedRequestData?.requestId,
    };
  }

  @Post('document-lodgement')
  @ApiBody({ type: LetterOfCreditDocumentLodgmentDto })
  async documentLodgement(
    @Body() body: LetterOfCreditDocumentLodgmentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
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

    const letterOfCreditDocumentUplooadRequestData =
      await this.letterOfCreditService.documentLodgement({
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
      data: letterOfCreditDocumentUplooadRequestData,
      message: `Letter Of Credit Document Lodgement Request ${letterOfCreditDocumentUplooadRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: letterOfCreditDocumentUplooadRequestData?.requestId,
    };
  }

  @Post('cancel')
  @Permissions([PermissionEnum.CANCEL_LETTER_OF_CREDIT])
  @ApiBody({ type: CancelLetterOfCreditDto })
  async cancel(
    @Body() body: CancelLetterOfCreditDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
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

    const letterOfCreidtCancellationData =
      await this.letterOfCreditService.cancel({
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
      data: letterOfCreidtCancellationData,
      message: `Letter Of Credit Cancellation Request ${letterOfCreidtCancellationData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: letterOfCreidtCancellationData?.requestId,
    };
  }

  @Post('free-format')
  @ApiBody({ type: LetterOfCreditFreeFormatMessageDto })
  async freeFormat(
    @Body() body: LetterOfCreditFreeFormatMessageDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
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

    const letterOfCreidtFreeFormatData =
      await this.letterOfCreditService.freeFormat({
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
      data: letterOfCreidtFreeFormatData,
      message: `Letter Of Credit Free Format Request ${letterOfCreidtFreeFormatData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: letterOfCreidtFreeFormatData?.requestId,
    };
  }

  @Patch(':id/authorize')
  @Permissions([PermissionEnum.AUTHORISE_LETTER_OF_CREDIT])
  @ApiBody({ type: AuthorizeLetterOfCreditDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: AuthorizeLetterOfCreditDto,
  ): Promise<LetterOfCreditResponseDto> {
    const token = req?.headers?.authorization;
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
    } = req.user;
    const { approvalStatus, reasonForRejection } = body;

    const authorizedLetterOfCreditReuest =
      await this.letterOfCreditService.authorize({
        id,
        approver: `${firstname} ${lastname}`,
        approverId,
        approverBranchCode,
        approverDepartment,
        approvalStatus,
        reasonForRejection,
        token,
      });

    return {
      statusCode: HttpStatus.OK,
      data: authorizedLetterOfCreditReuest,
      message: `Letter Of Credit ${authorizedLetterOfCreditReuest?.letterOfCreditActionType.toLowerCase()} Request ${approvalStatus.toLowerCase()} by ${firstname} ${lastname}`,
      requestId: authorizedLetterOfCreditReuest?.requestId,
    };
  }

  @Patch(':id/withdraw')
  async withdraw(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
    const { id: initiatorId, firstname, lastname } = req.user;

    const letterOfCreidtWithdrawalData =
      await this.letterOfCreditService.withdraw(id, initiatorId);

    return {
      statusCode: HttpStatus.OK,
      data: letterOfCreidtWithdrawalData,
      message: `Letter Of Credit Request Withdrawn by ${firstname} ${lastname}`,
      requestId: letterOfCreidtWithdrawalData?.requestId,
    };
  }

  @Delete(':id/delete')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
    const { id: initiatorId, firstname, lastname } = req.user;

    const letterOfCreidtDeletionData = await this.letterOfCreditService.delete(
      id,
      initiatorId,
    );

    return {
      statusCode: HttpStatus.OK,
      data: letterOfCreidtDeletionData,
      message: `Letter Of Credit Request Deleted by ${firstname} ${lastname}`,
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
      await this.letterOfCreditService.getRecordsStatusCount(
        id,
        branch,
        statusType,
        recordScope,
        requestStatus,
      );

    return {
      statusCode: HttpStatus.OK,
      data: recordsStatusCount,
      message: 'Letter of Credit Records Status Count Fetched Successfully.',
    };
  }

  @Get('records')
  @Permissions([
    PermissionEnum.VIEW_ALL_LETTER_OF_CREDIT_RECORDS,
    PermissionEnum.VIEW_BRANCH_WIDE_LETTER_OF_CREDIT_RECORDS,
  ])
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLetterOfCreditRecords(
    @Query() query: GetLetterOfCreditRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      recordScope,
      lcProductType,
      lcState,
      lcCode,
      applicantName,
    } = query;
    const { id, branch } = req.user;

    const letterOfCreditRecords =
      await this.letterOfCreditService.getLetterOfCreditRecords({
        id,
        branch,
        page,
        size,
        startDate,
        endDate,
        recordScope,
        lcProductType,
        lcState,
        lcCode,
        applicantName,
      });

    return {
      statusCode: HttpStatus.OK,
      data: letterOfCreditRecords,
      message: 'Letter of Credit Records Fetched Successfully.',
    };
  }

  @Get()
  @Permissions([
    PermissionEnum.VIEW_ALL_LETTER_OF_CREDIT_REQUESTS,
    PermissionEnum.VIEW_BRANCH_WIDE_LETTER_OF_CREDIT_REQUESTS,
  ])
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLetterOfCreditRequests(
    @Query() query: GetLetterOfCreditRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<LetterOfCreditResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
      approvalStatus,
      lcStatus,
      lcCode,
      applicantName,
    } = query;
    const { id, branch } = req.user;

    const letterOfCreditRecords =
      await this.letterOfCreditService.getLetterOfCreditRequests({
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
        lcStatus,
        lcCode,
        applicantName,
      });

    return {
      statusCode: HttpStatus.OK,
      data: letterOfCreditRecords,
      message: 'Letter of Credit Records Fetched Successfully.',
    };
  }

  @Get('reference-number')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLetterOfCreditRecordByReferenceNumber(
    @Query('referenceNumber') referenceNumber: string,
  ): Promise<LetterOfCreditResponseDto> {
    const letterOfCredit =
      await this.letterOfCreditService.getLetterOfCreditRecordByReferenceNumber(
        referenceNumber,
      );

    return {
      statusCode: HttpStatus.OK,
      data: letterOfCredit,
      message: 'Letter of Credit Record Fetched Successfully.',
    };
  }

  @Get('application-number')
  @ApiQuery({
    name: 'letterOfCreditProductType',
    enum: LetterOfCreditProductTypeEnum,
    required: true,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async validateRegulatoryFormForLetterOfCreditRequestInitiation(
    @Query('applicationNumber') applicationNumber: string,
    @Query(
      'letterOfCreditProductType',
      new ParseEnumPipe(LetterOfCreditProductTypeEnum),
    )
    letterOfCreditProductType: LetterOfCreditProductTypeEnum,
  ): Promise<LetterOfCreditResponseDto> {
    const validationResult =
      await this.letterOfCreditService.validateRegulatoryFormForLetterOfCreditRequestInitiation(
        applicationNumber,
        letterOfCreditProductType,
      );

    return {
      statusCode: HttpStatus.OK,
      data: validationResult,
      message: 'Form M Validation for Letter Of Credit Issuance Successful.',
    };
  }

  @Get('get-by-id/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLetterOfCreditByRequestId(
    @Param('id') requestId: string,
    @Query('isRecord', new ParseBoolPipe({ optional: true }))
    isRecord?: boolean,
  ): Promise<LetterOfCreditResponseDto> {
    const letterOfCredit =
      await this.letterOfCreditService.getLetterOfCreditByRequestId(
        requestId,
        isRecord,
      );

    return {
      statusCode: HttpStatus.OK,
      data: letterOfCredit,
      message: `Letter of Credit ${isRecord ? 'Record' : 'Request'} Fetched Successfully.`,
    };
  }

  @Get('template/search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchLetterOfCreditTemplateRecords(
    @Query() query: SearchLetterOfCreditTemplateRecordsDto,
  ): Promise<LetterOfCreditResponseDto> {
    const templateRecords =
      await this.letterOfCreditService.searchLetterOfCreditTemplateRecords(
        query,
      );

    return {
      statusCode: HttpStatus.OK,
      data: templateRecords,
      message: 'Letter of Credit Template Records Fetched Successfully.',
    };
  }

  @Get('template/:templateId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLetterOfCreditTemplateRecordByTemplateId(
    @Param('templateId', new ParseUUIDPipe()) templateId: string,
  ): Promise<LetterOfCreditResponseDto> {
    const templateRecord =
      await this.letterOfCreditService.getLetterOfCreditTemplateRecordByTemplateId(
        templateId,
      );

    return {
      statusCode: HttpStatus.OK,
      data: templateRecord,
      message: 'Letter of Credit Template Record Fetched Successfully.',
    };
  }

  @Get(':regulatoryFormNumber')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLetterOfCreditByRegulatoryFormNumber(
    @Param('regulatoryFormNumber') regulatoryFormNumber: string,
  ): Promise<LetterOfCreditResponseDto> {
    const letterOfCredit =
      await this.letterOfCreditService.getLetterOfCreditByRegulatoryFormNumber(
        regulatoryFormNumber,
      );

    return {
      statusCode: HttpStatus.OK,
      data: letterOfCredit,
      message: 'Letter of Credit Record Fetched Successfully.',
    };
  }
}
