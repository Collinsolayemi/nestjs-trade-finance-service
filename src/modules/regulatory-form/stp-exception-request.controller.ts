import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FormMResponseDto } from './dto/form-m-response.dto';
import { RegulatoryFormService } from './regulatory-form.service';
import { ResolveStpExceptionDto } from './dto/resolve-stp-exception.dto';
import { AuthenticatedRequest } from 'src/common/interfaces';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { GetStpExceptionRequestsDto } from './dto/get-stp-exception-requests.dto';

@Controller('stp-exception-requests')
@ApiTags('stp-exception-requests')
export class StpExceptionRequestController {
  constructor(private regulatoryFormService: RegulatoryFormService) {}

  @Patch('initiate')
  @UsePipes(new ValidationPipe({ transform: true }))
  async initiateStpExceptionRequest(
    @Body() body: ResolveStpExceptionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormMResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;
    const stpExceptionRequest =
      await this.regulatoryFormService.initiateStpExceptionRequest({
        initiator: `${firstname} ${lastname}`,
        initiatorId,
        initiatorBranchCode,
        initiatorDepartment,
        userPermissions,
        tenantId,
        ...body,
      });

    return {
      statusCode: HttpStatus.OK,
      data: stpExceptionRequest,
      message: 'STP Exception Request Initiated Successfully.',
    };
  }

  @Get('status-count')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStpRecordsStatusCount(
    @Query() query: GetStpExceptionRequestsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { statusType, recordScope, requestStatus, regulatoryFormType } =
      query;
    const { id, branch } = req.user;

    const recordsStatusCount =
      await this.regulatoryFormService.getStpRequestsStatusCount(
        id,
        branch,
        statusType,
        regulatoryFormType,
        recordScope,
        requestStatus,
      );

    return {
      statusCode: HttpStatus.OK,
      data: recordsStatusCount,
      message: 'STP Exception Requests Status Count Fetched Successfully.',
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStpExceptionRequests(
    @Query() query: GetStpExceptionRequestsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormMResponseDto> {
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

    const stpExceptionRequests =
      await this.regulatoryFormService.getStpExceptionRequests({
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
      data: stpExceptionRequests,
      message: 'STP Exception Requests Fetched Successfully.',
    };
  }

  @Patch(':id/authorize')
  @UsePipes(new ValidationPipe({ transform: true }))
  async authorizeStpExceptionRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AuthorizeActionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormMResponseDto> {
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
      user_permissions: userPermissions,
    } = req.user;
    const stpException =
      await this.regulatoryFormService.authorizeStpExceptionRequest({
        id,
        approver: `${firstname} ${lastname}`,
        approverId,
        approverBranchCode,
        approverDepartment,
        userPermissions,
        ...body,
      });

    return {
      statusCode: HttpStatus.OK,
      data: stpException,
      message: 'STP Exception Request Authorized Successfully.',
    };
  }

  @Patch(':id/withdraw')
  async withdraw(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormMResponseDto> {
    const { id: initiatorId } = req.user;

    const stpExceptionRequesttWithdrawalData =
      await this.regulatoryFormService.withdraw(id, initiatorId);

    return {
      statusCode: HttpStatus.OK,
      data: stpExceptionRequesttWithdrawalData,
      message: 'STP Exception Request Withdrawn',
    };
  }

  @Delete(':id/delete')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<FormMResponseDto> {
    const { id: initiatorId } = req.user;

    const stpExceptionRequestDeletionData =
      await this.regulatoryFormService.delete(id, initiatorId);

    return {
      statusCode: HttpStatus.OK,
      data: stpExceptionRequestDeletionData,
      message: 'STP Exception Request Deleted',
    };
  }

  @Get(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStpExceptionRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<FormMResponseDto> {
    const stpExceptionRequest =
      await this.regulatoryFormService.getStpExceptionRequest(id);

    return {
      statusCode: HttpStatus.OK,
      data: stpExceptionRequest,
      message: 'STP Exception Request Fetched Successfully.',
    };
  }
}
