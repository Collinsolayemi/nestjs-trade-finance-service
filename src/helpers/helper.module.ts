import { Global, Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { HttpModule } from '@nestjs/axios';
import { DocumentManagementService } from 'src/services/document-management/document-management.service';
import { SftpModule } from 'nest-sftp';
import { ConfigService } from '@nestjs/config';
import getSftpModuleOptions from 'src/config/sftp.config';

@Global()
@Module({
  imports: [
    HttpModule,
    SftpModule.forRootAsync(
      {
        inject: [ConfigService],
        useFactory: (configService: ConfigService) =>
          getSftpModuleOptions({
            sftpSwift: configService.get('sftp.swift'),
          }),
      },
      false,
    ),
  ],
  providers: [DocumentManagementService, HelperService],
  exports: [HelperService],
})
export class HelperModule {}
