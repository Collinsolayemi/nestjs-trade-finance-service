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
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { TradeJournalPostingService } from './trade-journal-posting.service';
import { InitiateTradeJournalPostingDto } from './dto/initiate-trade-journal-posting.dto';
import { AuthenticatedRequest } from 'src/common/interfaces';
import { TradeJournalPostingResponseDto } from './dto/trade-journal-posting-response.dto';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { ValidateTradeJournalPostingDto } from './dto/validate-trade-journal-posting.dto';
import { CurrencyService } from 'src/services/currency/currency.service';
import { ValidateAccountAccessDto } from './dto/validate-account-access.dto';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';

@Controller('trade-journal-posting')
@ApiTags('trade-journal-posting')
export class TradeJournalPostingController {
  constructor(
    private readonly tradeJournalPostingService: TradeJournalPostingService,
    private readonly currencyService: CurrencyService,
  ) {}
  @Get('currencies')
  async getAllCurrencies(@Req() req: AuthenticatedRequest) {
    const token = req?.headers?.authorization;

    const currencies = await this.currencyService.getAllCurrencies(token);

    return {
      statusCode: HttpStatus.CREATED,
      data: currencies,
      message: 'Available Currencies Fetched',
    };
  }

  @Get('account-number/validate')
  async validateAccountAccess(
    @Query() query: ValidateAccountAccessDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const token = req?.headers?.authorization;
    const { isDebit, accountNumber, currencyCode } = query;
    const {
      id,
      branch,
      department,
      user_permissions: userPermissions,
    } = req.user;

    const accountDetails =
      await this.tradeJournalPostingService.validateAccountAccess(
        {
          token,
          id,
          branch,
          department,
          userPermissions,
        },
        currencyCode,
        isDebit,
        accountNumber,
      );

    return {
      statusCode: HttpStatus.OK,
      data: accountDetails,
      message: 'Account Details Validated',
    };
  }

  @Get('value-date/validate')
  async validateValueDate(
    @Param('valueDate') valueDate: Date,
    @Req() req: AuthenticatedRequest,
  ) {
    const token = req?.headers?.authorization;
    const isValidValueDate =
      await this.tradeJournalPostingService.validateValueDate(valueDate, token);

    return {
      statusCode: HttpStatus.OK,
      data: isValidValueDate,
      message: 'Value Date Validated',
    };
  }

  @Post('validate')
  @ApiBody({ type: ValidateTradeJournalPostingDto })
  async validate(
    @Body() body: ValidateTradeJournalPostingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const token = req?.headers?.authorization;
    const { branch, user_permissions: userPermissions } = req.user;

    const isValid =
      await this.tradeJournalPostingService.validateSingleEntryPosting(
        { token, branch, userPermissions },
        body?.transactionAmount,
        body?.debitAccount?.accountNumber,
        body?.debitAccount.currencyCode,
        body?.creditAccount?.accountNumber,
        body?.creditAccount?.currencyCode,
        body?.isSameCurrency,
        body?.valueDate,
      );

    return {
      statusCode: HttpStatus.OK,
      data: isValid,
      message: 'Trade Journal Posting Request Validated',
    };
  }

  @Post('initiate')
  @ApiBody({ type: InitiateTradeJournalPostingDto })
  async initiate(
    @Body() body: InitiateTradeJournalPostingDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TradeJournalPostingResponseDto> {
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

    const tradeJournalPostingRequest =
      await this.tradeJournalPostingService.initiate({
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
      data: tradeJournalPostingRequest,
      message: 'Trade Journal Posting Request Initiated',
    };
  }

  @Patch(':id/authorize')
  @ApiBody({ type: AuthorizeActionDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: AuthorizeActionDto,
  ): Promise<TradeJournalPostingResponseDto> {
    const token = req?.headers?.authorization;
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
      user_permissions: userPermissions,
    } = req.user;
    const { approvalStatus, reasonForRejection } = body;

    const authorizedTradeJournalPostingRequest =
      await this.tradeJournalPostingService.authorize({
        token,
        id,
        approver: `${firstname} ${lastname}`,
        approverId,
        approverBranchCode,
        approverDepartment,
        userPermissions,
        approvalStatus,
        reasonForRejection,
      });

    return {
      statusCode: HttpStatus.OK,
      data: authorizedTradeJournalPostingRequest,
      message: `Trade Journal Posting Request Authorized`,
    };
  }

  @Patch(':id/withdraw')
  async modify(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<TradeJournalPostingResponseDto> {
    const { id: userId } = req.user;

    const updatedTradeJournalPostingRequest =
      await this.tradeJournalPostingService.modify(id, userId);

    return {
      statusCode: HttpStatus.OK,
      data: updatedTradeJournalPostingRequest,
      message: `Trade Journal Posting Request Withdrawn`,
    };
  }

  @Delete(':id/delete')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<TradeJournalPostingResponseDto> {
    const { id: userId } = req.user;

    const deletedTradeJournalPostingRequestCount =
      await this.tradeJournalPostingService.delete(id, userId);

    return {
      statusCode: HttpStatus.OK,
      data: deletedTradeJournalPostingRequestCount,
      message: `Trade Journal Posting Request Deleted`,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTradeJournalPostingRecords(
    @Query() query: GetRecordsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<TradeJournalPostingResponseDto> {
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

    const tradeJournalPostingRecords =
      await this.tradeJournalPostingService.getTradeJournalPostingRecords({
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
      data: tradeJournalPostingRecords,
      message: 'Trade Journal Posting Records Fetched Successfully.',
    };
  }
}
