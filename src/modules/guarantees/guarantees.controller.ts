import { GuaranteesService } from './guarantees.service';
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
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/common/interfaces';
import { GuaranteesResponseDto } from './dto/guarantees-response.dto';
import { IssueGuaranteeDto } from './dto/issue-guarantee.dto';
import { AmendGuaranteeDto } from './dto/amend-guarantee.dto';
import { AdjustGuaranteeDto } from './dto/adjust-guarantee.dto';
import { ReceiveAcknowledgementGuaranteeDto } from './dto/receive-acknowledgement-guarantee.dto';
import { ReceiveClaimGuaranteeDto } from './dto/receive-claim-guarantee.dto';
import { DocumentsPresentedGuaranteeDto } from './dto/documents-presented-guarantee.dto';
import { CancelGuaranteeDto } from './dto/cancel-guarantee.dto';
import { GuaranteesFreeFormatDto } from './dto/guarantees-free-format.dto';
import { AuthorizeGuaranteeDto } from './dto/authorize-guarantee.dto';
import { GetGuaranteesRecordsDto } from './dto/get-guarantees-records.dto';
import { GetRecordsStatusCountDto } from 'src/common/dto/get-records-status-count.dto';
import { GuaranteesProductTypeEnum, RequestStatusEnum } from 'src/common/enums';

@Controller('guarantees')
@ApiTags('guarantees')
export class GuaranteesController {
  constructor(private readonly guaranteesService: GuaranteesService) {}

  @Post('/get-debit-and-credit-entries')
  @ApiBody({ type: Object })
  async getDebitAndCreditEntries(
    @Body() body: any,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const token = req?.headers?.authorization;

    const debitAndCreditEntries =
      await this.guaranteesService.getDebitAndCreditEntries(body, token);

    return {
      statusCode: HttpStatus.CREATED,
      data: debitAndCreditEntries,
      message: 'Guarantee Debit and Credit Entries Calculated Successfully',
    };
  }

  @Post('draft')
  @ApiBody({ type: Object })
  async saveGuaranteesAsDraft(
    @Body() body: any,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const guaranteesDraftRequest =
      await this.guaranteesService.saveGuaranteesAsDraft({
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
      data: guaranteesDraftRequest,
      message: `Guarantee Request Saved as Draft by ${firstname} ${lastname}`,
      requestId: guaranteesDraftRequest?.requestId,
    };
  }

  @Post('issue')
  @ApiBody({ type: IssueGuaranteeDto })
  async issueGuaranteeRequest(
    @Body() body: IssueGuaranteeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
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

    const guaranteesRequestData =
      await this.guaranteesService.issueGuaranteeRequest({
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
      data: guaranteesRequestData,
      message: `Guarantee Issuance Request ${guaranteesRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: guaranteesRequestData?.requestId,
    };
  }

  @Post('amend')
  @ApiBody({ type: AmendGuaranteeDto })
  async amendGuaranteeRequest(
    @Body() body: AmendGuaranteeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const guaranteesRequestData = await this.guaranteesService.amendGuarantee({
      ...body,
      ...userData,
      token,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: guaranteesRequestData,
      message: `Guarantee Amendment Request ${guaranteesRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: guaranteesRequestData?.requestId,
    };
  }

  @Post('adjust')
  @ApiBody({ type: AdjustGuaranteeDto })
  async adjustGuaranteeRequest(
    @Body() body: AdjustGuaranteeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const guaranteesRequestData = await this.guaranteesService.adjustGuarantee({
      ...body,
      ...userData,
      token,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: guaranteesRequestData,
      message: `Guarantee Adjustment Request ${guaranteesRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: guaranteesRequestData?.requestId,
    };
  }

  @Post('receive-acknowledgement')
  @ApiBody({ type: ReceiveAcknowledgementGuaranteeDto })
  async receiveAcknowledgementGuaranteeRequest(
    @Body() body: ReceiveAcknowledgementGuaranteeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const guaranteesRequestData =
      await this.guaranteesService.receiveAcknowledgementGuarantee({
        ...body,
        ...userData,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: guaranteesRequestData,
      message: `Guarantee Receive Acknowledgement Request ${guaranteesRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: guaranteesRequestData?.requestId,
    };
  }

  @Post('receive-claim')
  @ApiBody({ type: ReceiveClaimGuaranteeDto })
  async receiveClaimGuaranteeRequest(
    @Body() body: ReceiveClaimGuaranteeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const guaranteesRequestData =
      await this.guaranteesService.receiveClaimGuarantee({
        ...body,
        ...userData,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: guaranteesRequestData,
      message: `Guarantee Claim Received Request ${guaranteesRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: guaranteesRequestData?.requestId,
    };
  }

  @Post('documents-presented')
  @ApiBody({ type: DocumentsPresentedGuaranteeDto })
  async documentsPresentedGuaranteeRequest(
    @Body() body: DocumentsPresentedGuaranteeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const guaranteesRequestData =
      await this.guaranteesService.documentsPresented({
        ...body,
        ...userData,
        token,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: guaranteesRequestData,
      message: `Guarantee Documents Presented Request ${guaranteesRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: guaranteesRequestData?.requestId,
    };
  }

  @Post('free-format')
  @ApiBody({ type: GuaranteesFreeFormatDto })
  async freeFormat(
    @Body() body: GuaranteesFreeFormatDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
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

    const guaranteesFreeFormatData = await this.guaranteesService.freeFormat({
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
      data: guaranteesFreeFormatData,
      message: `Guarantee Free Format Request ${guaranteesFreeFormatData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${firstname} ${lastname}`,
      requestId: guaranteesFreeFormatData?.requestId,
    };
  }

  @Post('cancel')
  @ApiBody({ type: CancelGuaranteeDto })
  async cancelGuaranteeRequest(
    @Body() body: CancelGuaranteeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const token = req?.headers?.authorization;
    const userData = this.extractRequesterDetails(req);

    const guaranteesRequestData = await this.guaranteesService.cancelGuarantee({
      ...body,
      ...userData,
      token,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: guaranteesRequestData,
      message: `Guarantee Cancellation Request ${guaranteesRequestData?.requestStatus === RequestStatusEnum.APPROVED ? 'Approved' : 'Initiated'} by ${userData?.initiator}`,
      requestId: guaranteesRequestData?.requestId,
    };
  }

  @Patch(':id/authorize')
  @ApiBody({ type: AuthorizeGuaranteeDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AuthorizeGuaranteeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const token = req?.headers?.authorization;
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
    } = req.user;

    const guaranteesRequestData = await this.guaranteesService.authorize({
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
      data: guaranteesRequestData,
      message: `Guarantee ${guaranteesRequestData?.guaranteesActionType.toLowerCase()} Request ${body?.approvalStatus.toLowerCase()} by ${firstname} ${lastname}`,
      requestId: guaranteesRequestData?.requestId,
    };
  }

  @Patch(':id/withdraw')
  async withdraw(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const { id: initiatorId, firstname, lastname } = req.user;

    const guaranteesWithdrawalData = await this.guaranteesService.withdraw(
      id,
      initiatorId,
    );

    return {
      statusCode: HttpStatus.OK,
      data: guaranteesWithdrawalData,
      message: `Guarantee Request Withdrawn by ${firstname} ${lastname}`,
      requestId: guaranteesWithdrawalData?.requestId,
    };
  }

  @Delete(':id/delete')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const { id: initiatorId, firstname, lastname } = req.user;

    const guaranteesDeletionData = await this.guaranteesService.delete(
      id,
      initiatorId,
    );

    return {
      statusCode: HttpStatus.OK,
      data: guaranteesDeletionData,
      message: `Guarantee Request Deleted by ${firstname} ${lastname}`,
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
      await this.guaranteesService.getRecordsStatusCount(
        id,
        branch,
        statusType,
        recordScope,
        requestStatus,
      );

    return {
      statusCode: HttpStatus.OK,
      data: recordsStatusCount,
      message: 'Guarantee Records Status Count Fetched Successfully.',
    };
  }

  @Get('records')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getGuaranteesRecords(
    @Query() query: GetGuaranteesRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      recordScope,
      guaranteesProductType,
      guaranteesState,
      guaranteeCode,
      applicantName,
    } = query;
    const { id, branch } = req.user;

    const guaranteesRecords = await this.guaranteesService.getGuaranteesRecords(
      {
        id,
        branch,
        page,
        size,
        startDate,
        endDate,
        recordScope,
        guaranteesProductType,
        guaranteesState,
        guaranteeCode,
        applicantName,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      data: guaranteesRecords,
      message: 'Guarantee Records Fetched Successfully.',
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getGuaranteesRequests(
    @Query() query: GetGuaranteesRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GuaranteesResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
      approvalStatus,
      guaranteesStatus,
      guaranteesProductType,
      guaranteesState,
      guaranteeCode,
      applicantName,
    } = query;
    const { id, branch } = req.user;

    const guaranteesRecords =
      await this.guaranteesService.getGuaranteesRequests({
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
        guaranteesStatus,
        guaranteesProductType,
        guaranteesState,
        guaranteeCode,
        applicantName,
      });

    return {
      statusCode: HttpStatus.OK,
      data: guaranteesRecords,
      message: 'Guarantee Requests Fetched Successfully.',
    };
  }

  @Get('reference-number')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getGuaranteeRecordByReferenceNumber(
    @Query('referenceNumber') referenceNumber: string,
  ): Promise<GuaranteesResponseDto> {
    const guarantee =
      await this.guaranteesService.getGuaranteeRecordByReferenceNumber(
        referenceNumber,
      );

    return {
      statusCode: HttpStatus.OK,
      data: guarantee,
      message: 'Guarantee Record Fetched Successfully.',
    };
  }

  @Get('application-number')
  @ApiQuery({
    name: 'guaranteesProductType',
    enum: GuaranteesProductTypeEnum,
    required: true,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async validateRegulatoryFormForGuaranteeRequestInitiation(
    @Query('applicationNumber') applicationNumber: string,
    @Query(
      'guaranteesProductType',
      new ParseEnumPipe(GuaranteesProductTypeEnum),
    )
    guaranteesProductType: GuaranteesProductTypeEnum,
  ): Promise<GuaranteesResponseDto> {
    const validationResult =
      await this.guaranteesService.validateRegulatoryFormForGuaranteeRequestInitiation(
        applicationNumber,
        guaranteesProductType,
      );

    return {
      statusCode: HttpStatus.OK,
      data: validationResult,
      message: 'Regulatory Form Validation for Guarantee Issuance Successful.',
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
  async getGuaranteeByRequestId(
    @Param('id') requestId: string,
    @Query('isRecord', new ParseBoolPipe({ optional: true }))
    isRecord?: boolean,
  ): Promise<GuaranteesResponseDto> {
    const guarantee = await this.guaranteesService.getGuaranteeByRequestId(
      requestId,
      isRecord,
    );

    return {
      statusCode: HttpStatus.OK,
      data: guarantee,
      message: `Guarantee ${isRecord ? 'Record' : 'Request'} Fetched Successfully.`,
    };
  }

  @Get(':regulatoryFormNumber')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getGuaranteeByRegulatoryFormNumber(
    @Param('regulatoryFormNumber') regulatoryFormNumber: string,
  ): Promise<GuaranteesResponseDto> {
    const guarantee =
      await this.guaranteesService.getGuaranteeByRegulatoryFormNumber(
        regulatoryFormNumber,
      );

    return {
      statusCode: HttpStatus.OK,
      data: guarantee,
      message: 'Guarantee Record Fetched Successfully.',
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
}
