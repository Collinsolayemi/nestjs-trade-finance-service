import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClauseService, ReferenceService } from './configuration.service';
import { AuthenticatedRequest } from 'src/common/interfaces';
import { CreateClausetDto, CreateReferenceDto } from './dto/configuration.dto';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { ConfigurationResponseDto } from './dto/configuration-response.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';
import { GetClauseRecordsDto } from './dto/get-clause-records.dto';
import { GetRecordsStatusCountDto } from './dto/get-records-status-count.dto';
import { GetRequestsStatusCountDto } from './dto/get-requests-status-count.dto';
import { AuthorizeClauseRequestDto } from './dto/authorize-clause-request.dto';
import { ModifyClausetDto } from './dto/modify-clause-request.dto';
import { DeactivateClauseDto } from './dto/deactivate-clause.dto';
import { DeleteClausetDto } from './dto/delete-clause-code.dto';

@Controller('clause')
@ApiTags('clause')
export class ClauseController {
  constructor(private clauseService: ClauseService) {}

  @Post('draft')
  @ApiBody({ type: CreateClausetDto })
  async saveClauseAsDraft(
    @Body() body: CreateClausetDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const clauseDraftRequest = await this.clauseService.saveClauseAsDraft({
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
      data: clauseDraftRequest,
      message: `Clause Request Saved as Draft by ${firstname} ${lastname}`,
      requestId: clauseDraftRequest?.requestId,
    };
  }

  @Get('records')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getClauseRecords(
    @Query() query: GetClauseRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
      isActive,
      clauseCode,
    } = query;
    const { id, branch } = req.user;

    const clauseRecords = await this.clauseService.getClauseRecords({
      id,
      branch,
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
      isActive,
      clauseCode,
    });

    return {
      statusCode: HttpStatus.OK,
      data: clauseRecords,
      message: 'Clause Records Fetched Successfully.',
    };
  }

  @Post()
  @ApiBody({ type: CreateClausetDto })
  async create(
    @Body() body: CreateClausetDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const clauseData = await this.clauseService.initiate({
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
      data: clauseData,
      message: `Clause Request Initiated by ${firstname} ${lastname}`,
      requestId: clauseData?.requestId,
    };
  }

  @Patch(':id/authorize')
  @ApiBody({ type: AuthorizeActionDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: AuthorizeClauseRequestDto,
  ): Promise<ConfigurationResponseDto> {
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
    } = req.user;
    const { approvalStatus, reasonForRejection } = body;

    const authorizedClause = await this.clauseService.authorize({
      id,
      approver: `${firstname} ${lastname}`,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
      requestType: body?.requestType,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: authorizedClause,
      message: `Clause Request Authorized by ${firstname} ${lastname}`,
      requestId: authorizedClause?.requestId,
    };
  }

  @Get('requests-status-count')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRequestsStatusCount(
    @Query() query: GetRequestsStatusCountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { statusType, recordScope, requestStatus } = query;
    const { id, branch } = req.user;

    const recordsStatusCount = await this.clauseService.getRequestsStatusCount(
      id,
      branch,
      statusType,
      recordScope,
      requestStatus,
    );

    return {
      statusCode: HttpStatus.OK,
      data: recordsStatusCount,
      message: 'Clause Records Status Count Fetched Successfully.',
    };
  }

  @Get('records-status-count')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecordsStatusCount(
    @Query() query: GetRecordsStatusCountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { recordScope } = query;
    const { id, branch } = req.user;

    const recordsStatusCount = await this.clauseService.getRecordsStatusCount(
      id,
      branch,
      recordScope,
    );

    return {
      statusCode: HttpStatus.OK,
      data: recordsStatusCount,
      message: 'Clause Records Status Count Fetched Successfully.',
    };
  }

  @Patch(':id/withdraw')
  async withdraw(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const { id: initiatorId, firstname, lastname } = req.user;

    const letterOfCreidtWithdrawalData = await this.clauseService.withdraw(
      id,
      initiatorId,
    );

    return {
      statusCode: HttpStatus.OK,
      data: letterOfCreidtWithdrawalData,
      message: `Clause Withdrawal Request Initiated by ${firstname} ${lastname}`,
      requestId: letterOfCreidtWithdrawalData?.requestId,
    };
  }

  @Patch('deactivate')
  @ApiBody({ type: DeactivateClauseDto })
  async deactivate(
    @Body() body: DeactivateClauseDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const deactivatedClauseRequest = await this.clauseService.deactivate({
      ...body,
      initiatorId,
      initiator: `${firstname} ${lastname}`,
      initiatorBranchCode,
      tenantId,
      initiatorDepartment,
      userPermissions,
    });

    return {
      statusCode: HttpStatus.OK,
      data: deactivatedClauseRequest,
      message: `Clause Deactivation Request Initiated by ${firstname} ${lastname}`,
      requestId: deactivatedClauseRequest?.requestId,
    };
  }

  @Patch('modify')
  async modify(
    @Req() req: AuthenticatedRequest,
    @Body() body: ModifyClausetDto,
  ): Promise<ConfigurationResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const modifiedClauseRequest = await this.clauseService.modify({
      ...body,
      initiatorId,
      initiator: `${firstname} ${lastname}`,
      initiatorBranchCode,
      tenantId,
      initiatorDepartment,
      userPermissions,
    });

    return {
      statusCode: HttpStatus.OK,
      data: modifiedClauseRequest,
      message: `Clause Modification Request Initiated by ${firstname} ${lastname}`,
      requestId: modifiedClauseRequest?.requestId,
    };
  }

  @Delete('delete')
  async delete(
    @Req() req: AuthenticatedRequest,
    @Body() body: DeleteClausetDto,
  ): Promise<ConfigurationResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const deletionClauseRequest = await this.clauseService.delete({
      ...body,
      initiatorId,
      initiator: `${firstname} ${lastname}`,
      initiatorBranchCode,
      tenantId,
      initiatorDepartment,
      userPermissions,
    });

    return {
      statusCode: HttpStatus.OK,
      data: deletionClauseRequest,
      message: `Clause Deletion Request Initiated by ${firstname} ${lastname}`,
      requestId: deletionClauseRequest?.requestId,
    };
  }

  @Delete(':requestId/delete')
  async deleteWithdrawn(
    @Param('requestId', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const { firstname, lastname } = req.user;

    const clauseDeletionData = await this.clauseService.deleteWithdrawn(id);

    return {
      statusCode: HttpStatus.OK,
      data: clauseDeletionData,
      message: `Clause Deletion Request Initiated by ${firstname} ${lastname}`,
      requestId: id,
    };
  }

  @Get('get-by-requestId/:requestId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getClauseRequestByRequestId(@Param('requestId') requestId: string) {
    const clauseRecord =
      await this.clauseService.getClauseRequestByRequestId(requestId);

    return {
      statusCode: HttpStatus.OK,
      data: clauseRecord,
      message: 'Clause Request Fetched Successfully.',
    };
  }

  @Get('get-by-clauseId/:clauseId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getClauseRecordByClauseId(@Param('clauseId') clauseId: string) {
    const clauseRecord =
      await this.clauseService.getClauseRecordByClauseId(clauseId);

    return {
      statusCode: HttpStatus.OK,
      data: clauseRecord,
      message: 'Clause Record Fetched Successfully.',
    };
  }

  @Get('get-by-clauseCode/:clauseCode')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getClauseRecordByClauseCode(@Param('clauseCode') clauseCode: string) {
    const clauseRecord =
      await this.clauseService.getClauseRecordByClauseCode(clauseCode);

    return {
      statusCode: HttpStatus.OK,
      data: clauseRecord,
      message: 'Clause Record Fetched Successfully.',
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getClauseRequests(
    @Query() query: GetClauseRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
      isActive,
      clauseCode,
    } = query;
    const { id, branch } = req.user;

    const clauseRecords = await this.clauseService.getClauseRequests({
      id,
      branch,
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
      isActive,
      clauseCode,
    });

    return {
      statusCode: HttpStatus.OK,
      data: clauseRecords,
      message: 'Clause Records Fetched Successfully.',
    };
  }
}

@Controller('reference')
@ApiTags('reference')
export class ReferenceController {
  constructor(private referenceService: ReferenceService) {}

  @Get('reference-code/generate')
  async generateReferenceCode(): Promise<ConfigurationResponseDto> {
    const referenceCode = await this.referenceService.generateReferenceCode();

    return {
      statusCode: HttpStatus.CREATED,
      data: referenceCode,
      message: 'Reference Code Generated',
    };
  }

  @Post()
  @ApiBody({ type: CreateReferenceDto })
  async create(
    @Body() body: CreateReferenceDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const referenceData = await this.referenceService.initiate({
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
      data: referenceData,
      message: 'Reference Request Initiated',
    };
  }

  @Patch(':id/authorize')
  @ApiBody({ type: AuthorizeActionDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: AuthorizeActionDto,
  ): Promise<ConfigurationResponseDto> {
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
    } = req.user;
    const { approvalStatus, reasonForRejection } = body;

    const authorizedReference = await this.referenceService.authorize({
      id,
      approver: `${firstname} ${lastname}`,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: authorizedReference,
      message: 'Reference Request Authorized',
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getReferenceRecords(
    @Query() query: GetRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ConfigurationResponseDto> {
    const {
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
    } = query;
    const { id, branch } = req.user;

    const referenceRecords = await this.referenceService.getReferenceRecords({
      id,
      branch,
      page,
      size,
      startDate,
      endDate,
      requestStatus,
      recordScope,
      isAuthorizer,
    });

    return {
      statusCode: HttpStatus.OK,
      data: referenceRecords,
      message: 'Reference Records Fetched Successfully.',
    };
  }
}
