import { Module } from '@nestjs/common';
import { ProductManagementService } from './product-management.service';
import { ConcessionGroupModule } from '../concession-group/concession-group.module';
import { CustomerManagementModule } from '../customer-management/customer-management.module';

@Module({
  imports: [ConcessionGroupModule, CustomerManagementModule],
  providers: [ProductManagementService],
  controllers: [],
  exports: [ProductManagementService],
})
export class ProductManagementModule {}
