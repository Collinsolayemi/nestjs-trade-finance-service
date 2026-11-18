import { Module } from '@nestjs/common';
import { CustomerManagementService } from './customer-management.service';

@Module({
  providers: [CustomerManagementService],
  exports: [CustomerManagementService],
})
export class CustomerManagementModule {}
