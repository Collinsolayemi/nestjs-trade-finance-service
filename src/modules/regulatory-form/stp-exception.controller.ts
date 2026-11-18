import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { FormMResponseDto } from './dto/form-m-response.dto';
import { RegulatoryFormService } from './regulatory-form.service';
import { GetStpExceptionsDto } from './dto/get-stp-exceptions.dto';
import { StpExceptionRepository } from './stp-exception.repository';
import { StpExceptionTypeEnum } from 'src/common/enums';

@Controller('stp-exceptions')
@ApiTags('stp-exceptions')
export class StpExceptionController {
  constructor(
    private regulatoryFormService: RegulatoryFormService,
    private readonly stpExceptionRepository: StpExceptionRepository,
  ) {}

  @Post('create')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        applicationNumber: {
          type: 'string',
          example: 'FM1234567890',
        },
        stpExceptionType: {
          type: 'string',
          enum: Object.values(StpExceptionTypeEnum),
          example: StpExceptionTypeEnum.CUSTOMER_ACCOUNT_VALIDATION,
        },
      },
      required: ['applicationNumber', 'stpExceptionType'],
    },
  })
  async create(@Body() body: any) {
    const stpException = await this.stpExceptionRepository.create({
      applicationNumber: body.applicationNumber,
      stpExceptionReason:
        'Application is on exception queue because no Customer Account can be tied to the TIN provided',
      stpExceptionType: body.stpExceptionType,
    });

    return {
      statusCode: HttpStatus.OK,
      data: stpException,
      message: 'STP Exception Record Created Successfully.',
    };
  }

  @Get('stp-exceptions/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStpException(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<FormMResponseDto> {
    const stpException = await this.regulatoryFormService.getStpException(id);

    return {
      statusCode: HttpStatus.OK,
      data: stpException,
      message: 'STP Exception Record Fetched Successfully.',
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStpExceptions(
    @Query() query: GetStpExceptionsDto,
  ): Promise<FormMResponseDto> {
    const stpExceptions =
      await this.regulatoryFormService.getStpExceptions(query);

    return {
      statusCode: HttpStatus.OK,
      data: stpExceptions,
      message: 'STP Exceptions Fetched Successfully.',
    };
  }
}
