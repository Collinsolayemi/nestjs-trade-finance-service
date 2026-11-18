import { Logger, Module } from '@nestjs/common';
import { RulesConfigurationService } from './rules-configuration.service';

@Module({
  imports: [],
  providers: [Logger, RulesConfigurationService],
  exports: [RulesConfigurationService],
})
export class RulesConfigurationModule {}
