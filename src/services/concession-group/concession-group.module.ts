import { Module } from '@nestjs/common';
import { ConcessionGroupService } from './concession-group.service';

@Module({
  providers: [ConcessionGroupService],
  exports: [ConcessionGroupService],
})
export class ConcessionGroupModule {}
