import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/common/interfaces';
import { AuthorizePaymentDto } from './dto/authorize-payment.dto';
import { InwardBankPaymentDto } from './dto/inward-bank-payment.dto';
import { InwardCustomerPaymentDto } from './dto/inward-customer-payment.dto';
import { PaymentDebitAndCreditEntriesDto } from './dto/payment-debit-and-credit-entries.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { SavePaymentTemplateDto } from './dto/save-payment-template.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
@ApiTags('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('inward-bank-payment')
  @ApiBody({ type: InwardBankPaymentDto })
  async createInwardBankPayment(
    @Body() body: InwardBankPaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const userData = this.extractRequesterDetails(req);

    const paymentRequestData =
      await this.paymentService.createInwardBankPayment({
        ...body,
        ...userData,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: paymentRequestData,
      message: `Inward Bank Payment Request Initiated by ${userData?.initiator}`,
      requestId: paymentRequestData?.requestId,
    };
  }

  @Post('inward-bank-payment/draft')
  @ApiBody({ type: InwardBankPaymentDto })
  async saveInwardBankPaymentAsDraft(
    @Body() body: InwardBankPaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const userData = this.extractRequesterDetails(req);

    const paymentRequestData =
      await this.paymentService.saveInwardBankPaymentAsDraft({
        ...body,
        ...userData,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: paymentRequestData,
      message: `Inward Bank Payment Request Saved as Draft by ${userData?.initiator}`,
      requestId: paymentRequestData?.requestId,
    };
  }

  @Post('inward-customer-payment')
  @ApiBody({ type: InwardCustomerPaymentDto })
  async createInwardCustomerPayment(
    @Body() body: InwardCustomerPaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const userData = this.extractRequesterDetails(req);

    const paymentRequestData =
      await this.paymentService.createInwardCustomerPayment({
        ...body,
        ...userData,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: paymentRequestData,
      message: `Inward Customer Payment Request Initiated by ${userData?.initiator}`,
      requestId: paymentRequestData?.requestId,
    };
  }

  @Post('inward-customer-payment/draft')
  @ApiBody({ type: InwardCustomerPaymentDto })
  async saveInwardCustomerPaymentAsDraft(
    @Body() body: InwardCustomerPaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const userData = this.extractRequesterDetails(req);

    const paymentRequestData =
      await this.paymentService.saveInwardCustomerPaymentAsDraft({
        ...body,
        ...userData,
      });

    return {
      statusCode: HttpStatus.CREATED,
      data: paymentRequestData,
      message: `Inward Customer Payment Request Saved as Draft by ${userData?.initiator}`,
      requestId: paymentRequestData?.requestId,
    };
  }

  @Get('requests/:id')
  async getRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const paymentRequestData = await this.paymentService.getRequest(id, token);

    return {
      statusCode: HttpStatus.OK,
      data: paymentRequestData,
      message: 'Payment Request Retrieved Successfully',
      requestId: paymentRequestData?.requestId,
    };
  }

  @Get('requests/:id/view')
  async getPaymentView(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const paymentViewData = await this.paymentService.getPaymentView(id, token);

    return {
      statusCode: HttpStatus.OK,
      data: paymentViewData,
      message: 'Payment View Retrieved Successfully',
      requestId: id,
    };
  }

  @Get('requests/:id/transaction-summary')
  async getTransactionSummary(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const transactionSummaryData =
      await this.paymentService.getTransactionSummary(id, token);

    return {
      statusCode: HttpStatus.OK,
      data: transactionSummaryData,
      message: 'Payment Transaction Summary Retrieved Successfully',
      requestId: id,
    };
  }

  @Get('requests/:id/transaction-history')
  async getTransactionHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const transactionHistoryData =
      await this.paymentService.getTransactionHistory(id, token);

    return {
      statusCode: HttpStatus.OK,
      data: transactionHistoryData,
      message: 'Payment Transaction History Retrieved Successfully',
      requestId: id,
    };
  }

  @Get('requests/:id/postings-and-charges-history')
  async getPostingsAndChargesHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const postingsAndChargesHistoryData =
      await this.paymentService.getPostingsAndChargesHistory(id, token);

    return {
      statusCode: HttpStatus.OK,
      data: postingsAndChargesHistoryData,
      message: 'Payment Postings and Charges History Retrieved Successfully',
      requestId: id,
    };
  }

  @Get('requests/:id/swift-message-history')
  async getSwiftMessageHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const swiftMessageHistoryData =
      await this.paymentService.getSwiftMessageHistory(id, token);

    return {
      statusCode: HttpStatus.OK,
      data: swiftMessageHistoryData,
      message: 'Payment Swift Message History Retrieved Successfully',
      requestId: id,
    };
  }

  @Get('requests/:id/uploaded-documents')
  async getUploadedDocuments(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const uploadedDocumentsData =
      await this.paymentService.getUploadedDocuments(id, token);

    return {
      statusCode: HttpStatus.OK,
      data: uploadedDocumentsData,
      message: 'Payment Uploaded Documents Retrieved Successfully',
      requestId: id,
    };
  }

  @Get('requests/:id/tracers-reminders-notes')
  async getTracersRemindersAndNotes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const tracersRemindersAndNotesData =
      await this.paymentService.getTracersRemindersAndNotes(id, token);

    return {
      statusCode: HttpStatus.OK,
      data: tracersRemindersAndNotesData,
      message: 'Payment Tracers, Reminders and Notes Retrieved Successfully',
      requestId: id,
    };
  }

  @Post('debit-and-credit-entries')
  @ApiBody({ type: PaymentDebitAndCreditEntriesDto })
  async getDebitAndCreditEntries(
    @Body() body: PaymentDebitAndCreditEntriesDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const debitAndCreditEntries =
      await this.paymentService.getDebitAndCreditEntries(body, token);

    return {
      statusCode: HttpStatus.CREATED,
      data: debitAndCreditEntries,
      message: 'Payment Debit and Credit Entries Calculated Successfully',
    };
  }

  @Post('templates')
  @ApiBody({ type: SavePaymentTemplateDto })
  async saveTemplate(
    @Body() body: SavePaymentTemplateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const { id: createdById, firstname, lastname, tenant: tenantId } = req.user;

    const templateData = await this.paymentService.saveTemplate({
      ...body,
      createdBy: `${firstname} ${lastname}`,
      createdById,
      tenantId,
      token,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: templateData,
      message: 'Payment Template Saved Successfully',
    };
  }

  @Get('templates')
  async getTemplates(
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const templateData = await this.paymentService.getTemplates(token);

    return {
      statusCode: HttpStatus.OK,
      data: templateData,
      message: 'Payment Templates Retrieved Successfully',
    };
  }

  @Patch(':id/authorize')
  @ApiBody({ type: AuthorizePaymentDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AuthorizePaymentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PaymentResponseDto> {
    const token = req?.headers?.authorization;
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
    } = req.user;

    const paymentRequestData = await this.paymentService.authorize({
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
      data: paymentRequestData,
      message: `Payment Request ${body?.approvalStatus.toLowerCase()} by ${firstname} ${lastname}`,
      requestId: paymentRequestData?.requestId,
    };
  }

  private extractRequesterDetails(req: AuthenticatedRequest) {
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

    return {
      initiatorId,
      initiator: `${firstname} ${lastname}`,
      initiatorBranchCode,
      tenantId,
      initiatorDepartment,
      userPermissions,
      token,
    };
  }
}
