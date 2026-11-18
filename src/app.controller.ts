import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ConcessionGroupService } from './services/concession-group/concession-group.service';
import { AppService } from './app.service';
import { AuthenticatedRequest } from './common/interfaces';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly concessionGroupService: ConcessionGroupService,
  ) {}

  @Get('concession-group/by-charge/:chargeId')
  async getConcessionGroupsByChargeId(
    @Req() req: AuthenticatedRequest,
    @Param('chargeId') chargeId: string,
    @Query('customerId') customerId?: string,
  ) {
    const token = req?.headers?.authorization;
    return this.concessionGroupService.getConcessionGroupsByChargeId(
      chargeId,
      token,
      customerId,
    );
  }
}
