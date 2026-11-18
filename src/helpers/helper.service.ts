import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import {
  IApproverObject,
  IInitiatorObject,
  IQueryObject,
  IUser,
} from 'src/common/interfaces';
import { AuthorizationStatusEnum, IPaginationData } from 'src/common/enums';
import { DocumentManagementService } from 'src/services/document-management/document-management.service';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { SftpClientService } from 'nest-sftp';
import { ConfigService } from '@nestjs/config';
import getSftpModuleOptions from 'src/config/sftp.config';
import { PaginationOptions } from 'src/common/constants';
import { Op } from 'sequelize';
import { isUUID } from 'class-validator';
import sanitizeString from 'src/common/utils/sanitize-string.util';

@Injectable()
export class HelperService {
  private readonly nanoid = customAlphabet('1234567890abcdef', 10);
  private readonly swiftMessageFolder = path.join(
    os.tmpdir(),
    'swift-messages',
  );
  private readonly remotePath = this.configService.get<string>(
    'sftp.swift.remoteBasePath',
  );

  constructor(
    private readonly documentManagementService: DocumentManagementService,
    private readonly sftpClient: SftpClientService,
    private readonly configService: ConfigService,
  ) {}

  private async uploadToSftpWithReconnect(
    filePath: string,
    fileName: string,
  ): Promise<void> {
    const remotePath = `${this.remotePath}/${fileName}`;
    try {
      await this.sftpClient.upload(filePath, remotePath);
    } catch (err: any) {
      if (err?.code === 'ERR_NOT_CONNECTED') {
        const sftpSwift = this.configService.get('sftp.swift');
        const config = getSftpModuleOptions({ sftpSwift });
        await this.sftpClient.resetConnection(config);
        await this.sftpClient.upload(filePath, remotePath);
      } else {
        throw err;
      }
    }
  }

  async uploadSwiftMessage(
    swiftMessage: string,
    messageType: string,
    referenceId: string,
  ) {
    const randomId = this.nanoid();
    const fileName = `SWIFT-MT-${messageType}-${sanitizeString(referenceId)}-${randomId}.txt`;
    const filePath = path.join(this.swiftMessageFolder, fileName);

    fs.mkdirSync(this.swiftMessageFolder, { recursive: true });

    fs.writeFileSync(filePath, swiftMessage);

    const documentManagementData =
      await this.documentManagementService.uploadFile(filePath);

    await this.uploadToSftpWithReconnect(filePath, fileName);

    return {
      documentManagementUploadUrl: documentManagementData?.url,
    };
  }

  getQueryObject(req: any): IQueryObject {
    const { ...rest } = req.query;
    const user = req.user;
    const {
      id: userId,
      branch: userBranchCode,
      department: userDepartment,
      firstname,
      lastname,
    } = user || ({} as IUser);
    const token = req.headers.authorization;

    return {
      userId,
      userBranchCode,
      userDepartment,
      token,
      firstname,
      lastname,
      ...rest,
    };
  }

  getInitiatorObject = (user: any): IInitiatorObject => {
    const { id, branch, department, firstname, lastname } = user;

    return {
      initiator: `${firstname} ${lastname}`,
      initiatorId: id,
      initiatorBranchCode: branch,
      initiatorDepartment: department,
      lastModifiedBy: `${firstname} ${lastname}`,
      lastModifiedById: id,
    };
  };

  getApproverObject = (user: any): IApproverObject => {
    const { id, branch, department, firstname, lastname } = user;

    return {
      approver: `${firstname} ${lastname}`,
      approverId: id,
      approverBranchCode: branch,
      approverDepartment: department,
      lastModifiedBy: `${firstname} ${lastname}`,
      lastModifiedById: id,
    };
  };
  getLimitAndOffset = (page: string, size: string) => {
    const pageNumber = parseInt(page, 10) || PaginationOptions.page;
    const limit = parseInt(size, 10) || PaginationOptions.pageSize;
    const offset = (pageNumber - 1) * limit;

    return { limit, offset };
  };

  getPagination = (data: IPaginationData, page: number, size: number) => {
    if (!data)
      return { totalItems: 0, totalPages: 0, currentPage: 0, records: [] };

    const { count: totalItems, rows: records } = data;
    const currentPage = page > 0 ? page : PaginationOptions.page;
    const limit = size ? +size : PaginationOptions.pageSize;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      totalItems,
      records,
      totalPages,
      currentPage,
    };
  };
  cleanWhereClause(
    where: Record<string, any> | null | undefined,
  ): Record<string, any> {
    if (!where || typeof where !== 'object') {
      return {};
    }

    return Object.fromEntries(
      Object.entries(where).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== null && value !== undefined,
      ),
    );
  }
  getRequestScopeFilter = (queryObj: IQueryObject) => {
    const { userId, userBranchCode, authorizationStatus, userDepartment } =
      queryObj;

    const scopeFilters = {
      [AuthorizationStatusEnum.INITIATED_BY_ME]: { initiatorId: userId },
      [AuthorizationStatusEnum.CREATED_BY_ME]: { initiatorId: userId },
      [AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH]: {
        initiatorBranchCode: userBranchCode,
      },
      [AuthorizationStatusEnum.CREATED_BY_MY_BRANCH]: {
        initiatorBranchCode: userBranchCode,
      },
      [AuthorizationStatusEnum.APPROVED_BY_ME]: { approverId: userId },
      [AuthorizationStatusEnum.SENT_TO_ME]: { approverId: userId },
      [AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH]: {
        approverBranchCode: userBranchCode,
      },
      [AuthorizationStatusEnum.SENT_TO_MY_BRANCH]: {
        initiatorBranchCode: userBranchCode,
      },
      [AuthorizationStatusEnum.POSTED_BY_ME]: { initiatorId: userId },
      [AuthorizationStatusEnum.POSTED_BY_MY_BRANCH]: {
        initiatorBranchCode: userBranchCode,
      },
    };

    if (userDepartment) {
      scopeFilters[AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH][
        'initiatorDepartment'
      ] = userDepartment;
      scopeFilters[AuthorizationStatusEnum.CREATED_BY_MY_BRANCH][
        'initiatorDepartment'
      ] = userDepartment;

      scopeFilters[AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH][
        'initiatorDepartment'
      ] = userDepartment;
      scopeFilters[AuthorizationStatusEnum.SENT_TO_MY_BRANCH][
        'initiatorDepartment'
      ] = userDepartment;
      scopeFilters[AuthorizationStatusEnum.POSTED_BY_MY_BRANCH][
        'initiatorDepartment'
      ] = userDepartment;
    }
    return this.cleanWhereClause(scopeFilters[authorizationStatus]);
  };

  getSearchWhereCase = (queryObj: IQueryObject, args = {}) => {
    const {
      searchKey,
      searchValue,
      startDate,
      endDate,
      status,
      requestType,
      requestStatus,
      counterparties,
      initiators,
    } = queryObj;

    const whereCase = { ...this.getRequestScopeFilter(queryObj) };

    const startOfDay = new Date(startDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    if (startDate && endDate)
      whereCase['updatedAt'] = {
        [Op.between]: [startOfDay, endOfDay],
      };
    if (searchKey && searchValue) {
      const isUuid = isUUID(searchValue);
      if (isUuid) whereCase[searchKey] = searchValue;
      else
        whereCase[searchKey] = {
          [Op.like]: `${searchValue}%`,
        };
    }
    if (status)
      whereCase['status'] = {
        [Op.in]: status.split(','),
      };
    if (requestStatus)
      whereCase['requestStatus'] = {
        [Op.in]: requestStatus.split(','),
      };
    if (counterparties)
      whereCase['initiator'] = {
        [Op.in]: counterparties.split(','),
      };

    if (initiators)
      whereCase['initiator'] = {
        [Op.in]: initiators.split(','),
      };
    if (requestType)
      whereCase['requestType'] = {
        [Op.in]: requestType.split(','),
      };

    return { ...whereCase, ...args };
  };
  getPaginationQuery = (queryObj: IQueryObject, args?: any) => {
    const { page, pageSize } = queryObj;
    const { limit, offset } = this.getLimitAndOffset(page, pageSize);
    const whereCase = this.getSearchWhereCase(queryObj, args);

    return {
      page,
      pageSize,
      limit,
      offset,
      whereCase,
    };
  };
}
