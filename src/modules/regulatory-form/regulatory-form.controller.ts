import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { FormMResponseDto } from './dto/form-m-response.dto';
import { FormNCXResponseDto } from './dto/form-ncx-response.dto';
import { FormNXPResponseDto } from './dto/form-nxp-response.dto';
import { RegulatoryFormService } from './regulatory-form.service';
import { GetFormMRecordsDto } from './dto/get-form-m-records.dto';
import { GetFormMRecordDto } from './dto/get-form-m-record.dto';
import { GetFormNCXRecordsDto } from './dto/get-form-ncx-records.dto';
import { GetFormNCXRecordDto } from './dto/get-form-ncx-record.dto';
import { GetFormNXPRecordsDto } from './dto/get-form-nxp-records.dto';
import { GetFormNXPRecordDto } from './dto/get-form-nxp-record.dto';
import { GetAllRecordsStatusCountDto } from './dto/get-all-records-status-count.dto';
import { CreateRegulatoryFormChargesAndTaxesDto } from './dto/regulatory-form-charges-and-taxes.dto';

@Controller('regulatory-form')
@ApiTags('regulatory-form')
export class RegulatoryFormController {
  constructor(private regulatoryFormService: RegulatoryFormService) {}

  @Get('status-count')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRegulatoryFormRecordsStatusCount(
    @Query() query: GetAllRecordsStatusCountDto,
  ) {
    const { recordType } = query;

    const recordsStatusCount =
      await this.regulatoryFormService.getRegulatoryFormRecordsStatusCount(
        recordType,
      );

    return {
      statusCode: HttpStatus.OK,
      data: recordsStatusCount,
      message: 'Records Status Count Fetched Successfully.',
    };
  }

  @Get('form-m')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFormMRecords(
    @Query() query: GetFormMRecordsDto,
  ): Promise<FormMResponseDto> {
    const formMRecords =
      await this.regulatoryFormService.getFormMRecords(query);

    return {
      statusCode: HttpStatus.OK,
      data: formMRecords,
      message: 'Form M Records Fetched Successfully.',
    };
  }

  @Get('charges-and-taxes-config')
  @HttpCode(HttpStatus.OK)
  async getFormMChargesTaxesAndConfig() {
    const config =
      await this.regulatoryFormService.getRegulatoryFormChargesAndTaxes();

    return {
      statusCode: HttpStatus.OK,
      data: config,
      message: 'Form M charges and taxes configuration fetched successfully.',
    };
  }

  @Get('form-m/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFormMRecord(
    @Query() options: GetFormMRecordDto,
    @Param('id') id: string,
  ): Promise<FormMResponseDto> {
    const formMRecord = await this.regulatoryFormService.getFormMRecord(
      id,
      options,
    );

    return {
      statusCode: HttpStatus.OK,
      data: formMRecord,
      message: 'Form M Record Fetched Successfully.',
    };
  }

  @Get('form-nxp')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFormNXPRecords(
    @Query() query: GetFormNXPRecordsDto,
  ): Promise<FormNXPResponseDto> {
    const formNXPRecords =
      await this.regulatoryFormService.getFormNXPRecords(query);

    return {
      statusCode: HttpStatus.OK,
      data: formNXPRecords,
      message: 'Form NXP Records Fetched Successfully.',
    };
  }

  @Get('form-nxp/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFormNXPRecord(
    @Query() options: GetFormNXPRecordDto,
    @Param('id') id: string,
  ): Promise<FormNXPResponseDto> {
    const formNXPRecord = await this.regulatoryFormService.getFormNXPRecord(
      id,
      options,
    );

    return {
      statusCode: HttpStatus.OK,
      data: formNXPRecord,
      message: 'Form NXP Record Fetched Successfully.',
    };
  }

  @Get('form-ncx')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFormNCXRecords(
    @Query() query: GetFormNCXRecordsDto,
  ): Promise<FormNCXResponseDto> {
    const formNCXRecords =
      await this.regulatoryFormService.getFormNCXRecords(query);

    return {
      statusCode: HttpStatus.OK,
      data: formNCXRecords,
      message: 'Form NCX Records Fetched Successfully.',
    };
  }

  @Get('form-ncx/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFormNCXRecord(
    @Query() options: GetFormNCXRecordDto,
    @Param('id') id: string,
  ): Promise<FormNCXResponseDto> {
    const formNCXRecord = await this.regulatoryFormService.getFormNCXRecord(
      id,
      options,
    );

    return {
      statusCode: HttpStatus.OK,
      data: formNCXRecord,
      message: 'Form NCX Record Fetched Successfully.',
    };
  }

  @Post('charges-and-taxes-config')
  @ApiBody({ type: CreateRegulatoryFormChargesAndTaxesDto })
  @HttpCode(HttpStatus.CREATED)
  async saveConfig(@Body() data: CreateRegulatoryFormChargesAndTaxesDto) {
    await this.regulatoryFormService.saveRegulatoryFormChargesAndTaxes(data);
    return {
      message: 'Form M charges and taxes configuration saved successfully',
    };
  }
}
