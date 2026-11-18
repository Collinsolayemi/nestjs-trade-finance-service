import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwiftBicService } from './swift-bic-data.service';
import {
  Controller,
  Get,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  GetSwiftBicRecordsDto,
  PaginationResponseDto,
} from './dto/get-by-swift-bic.dto';

@Controller('swift-bic')
@ApiTags('swift-bic')
export class SwiftBicController {
  constructor(private swiftBicService: SwiftBicService) {}

  @Get()
  @ApiOperation({
    summary: 'Get SWIFT BIC data by partial BIC code with pagination',
  })
  @ApiResponse({
    status: 200,
    description:
      'Paginated list of SWIFT BIC records matching the partial BIC code',
    type: PaginationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid BIC code or pagination parameters provided',
  })
  async getSwiftBicRecords(
    @Query(ValidationPipe) query: GetSwiftBicRecordsDto,
  ) {
    const swiftBicRecords = await this.swiftBicService.getSwiftBicRecords(
      query.bic,
      query.page,
      query.size,
    );

    return {
      statusCode: HttpStatus.OK,
      data: swiftBicRecords,
      message: 'Swift Bic Records Fetched Successfully',
    };
  }
}
