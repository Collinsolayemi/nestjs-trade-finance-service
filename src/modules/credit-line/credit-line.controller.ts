import {
  Post,
  Body,
  Controller,
  Patch,
  Delete,
  Get,
  Req,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Header,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreditLineService } from './credit-line.service';
import { CreateCreditLineDto } from './dto/create-credit-line.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateCreditLineApiBody } from './dto/request-examples.dto';
import { AutoApproval, PermissionsGuard } from 'src/common/decorators';
import { PermissionEnum } from 'src/common/enums';
import { RejectRequestDto } from './dto/reject-request.dto';
import { UpdateCreditLineDto } from './dto/update-credit-line.dto';
import { ValidateCreditLineDto } from './dto/validate-credit-line.dto';
import { GetCountsDto } from './dto/counts.dto';
import {
  GetAllCreditLinesDto,
  GetAllRequestsDto,
} from './dto/get-all-requests.dto';
import { CreateCreditLineDraftDto } from './dto/create-draft.dto';
import searchConfig from './search.config';

@Controller('credit-line')
@ApiTags('credit-line')
@ApiBearerAuth()
export class CreditLineController {
  constructor(private readonly creditLineService: CreditLineService) {}

  @Post('requests')
  @ApiBody(CreateCreditLineApiBody)
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
  )
  async createRequest(
    @Body() data: CreateCreditLineDto,
    @Req() req: Request,
    @AutoApproval(
      PermissionEnum.APPROVE_CREDIT_LINE,
      PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
      PermissionEnum.APPROVE_CREDIT_LINE,
    )
    autoApprove: boolean,
  ) {
    const initiatorObj = req['initiatorObj'];
    const approverObj = req['approverObj'];
    const result = await this.creditLineService.createRequest(
      { ...data, ...initiatorObj },
      approverObj,
      autoApprove,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: `Credit line request ${autoApprove ? 'approved' : 'created'} successfully`,
      data: result,
    };
  }
  @Patch('requests/:id/approve')
  @PermissionsGuard(
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async approveRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    const approverObj = req['approverObj'];
    const result = await this.creditLineService.approveRequest(id, approverObj);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Credit line request approved successfully',
      data: result,
    };
  }

  @Patch('requests/:id/reject')
  @PermissionsGuard(
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async rejectRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
    @Body() data: RejectRequestDto,
  ) {
    const approverObj = req['approverObj'];
    const result = await this.creditLineService.rejectRequest(
      id,
      approverObj,
      data,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Credit line request rejected successfully',
      data: result,
    };
  }

  @Patch('requests/:id/update')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
  )
  async updateRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateCreditLineDto,
    @Req() req: Request,
    @AutoApproval(PermissionEnum.APPROVE_CREDIT_LINE) autoApprove: boolean,
  ) {
    const initiatorObj = req['initiatorObj'];
    const approverObj = req['approverObj'];

    const request = await this.creditLineService.updateCreditLineRequest({
      data: { requestId: id, ...data },
      initiatorObj,
      approverObj,
      autoApprove,
    });
    return {
      statuscode: HttpStatus.OK,
      data: request,
      message: `Credit line request ${autoApprove ? 'approved' : 'updated'} successfully`,
    };
  }

  @Patch('requests/draft')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
  )
  async saveAsDraftRequest(
    @Body() data: CreateCreditLineDraftDto,
    @Req() req: Request,
  ) {
    const initiatorObj = req['initiatorObj'];
    const result = await this.creditLineService.createDraftRequest({
      ...data,
      ...initiatorObj,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Credit line request created successfully',
      data: result,
    };
  }

  @Patch('requests/:id/withdraw')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
  )
  async withdrawRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    const initiatorObj = req['initiatorObj'];
    const result = await this.creditLineService.withdrawAndModifyProductRequest(
      id,
      initiatorObj,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Credit line request withdrawn successfully',
      data: result,
    };
  }
  @Delete('requests/:id/delete')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
  )
  async deleteRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    const initiatorObj = req['initiatorObj'];
    const result = await this.creditLineService.withdrawAndDeleteProductRequest(
      id,
      initiatorObj,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Credit line request deleted successfully',
      data: result,
    };
  }
  @Get()
  async getAll(@Query() query: GetAllCreditLinesDto, @Req() req: Request) {
    const queryObj = req['queryObj'];
    const result = await this.creditLineService.getAll(queryObj);

    return {
      statusCode: HttpStatus.OK,
      message: 'Credit lines retrieved successfully',
      data: result,
    };
  }
  @Get('/requests')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async getAllRequests(@Query() query: GetAllRequestsDto, @Req() req: Request) {
    const queryObj = req['queryObj'];
    const result = await this.creditLineService.getAllRequests(queryObj);

    return {
      statusCode: HttpStatus.OK,
      message: 'Credit line requests retrieved successfully',
      data: result,
    };
  }
  @Get('/counts')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async getCounts(@Query() query: GetCountsDto, @Req() req: Request) {
    const queryObj = req['queryObj'];
    const counts = await this.creditLineService.getCounts(queryObj);

    return {
      statusCode: HttpStatus.OK,
      message: 'Credit line counts retrieved successfully',
      data: counts,
    };
  }

  @Get('/validate')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async validate(@Query() query: ValidateCreditLineDto) {
    const exists = await this.creditLineService.creditLineExists({ ...query });
    return {
      statusCode: HttpStatus.OK,
      message: 'Credit line request retrieved successfully',
      data: { exists },
    };
  }
  @Get('/requests/download')
  @Header('Content-Type', 'text/csv')
  @Header(
    'Content-Disposition',
    'attachment; filename=credit-line-requests.csv',
  )
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async downloadRequests(
    @Query() query: GetAllRequestsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const queryObj = req['queryObj'];
    const csv = await this.creditLineService.downloadRequests(queryObj);
    res.status(200).send(csv);
  }

  @Get('/requests/:id')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async getSingleRequest(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.creditLineService.findRequest(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Credit line request retrieved successfully',
      data: result,
    };
  }

  @Get('/search-dropdown')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async getSearchDropdown() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Credit line search dropdown retrieved successfully',
      data: searchConfig,
    };
  }
  @Get('download')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=credit-line-report.csv')
  async downloadRecords(
    @Query() query: GetAllCreditLinesDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const queryObj = req['queryObj'];
    const csv = await this.creditLineService.downloadRecords(queryObj);
    res.status(200).send(csv);
  }

  @Get(':identifier')
  @PermissionsGuard(
    PermissionEnum.CREATE_CREDIT_LINE,
    PermissionEnum.APPROVE_CREDIT_LINE,
    PermissionEnum.INITIATE_PAYMENT_LETTER_OF_CREDIT,
    PermissionEnum.ISSUE_LETTER_OF_CREDIT,
    PermissionEnum.AUTHORISE_LETTER_OF_CREDIT,
    PermissionEnum.APPROVE_CREDIT_LINE,
  )
  async getSingle(@Param('identifier') identifier: string) {
    const result = await this.creditLineService.findByAny(identifier);
    return {
      statusCode: HttpStatus.OK,
      message: 'Credit line retrieved successfully',
      data: result,
    };
  }
}
