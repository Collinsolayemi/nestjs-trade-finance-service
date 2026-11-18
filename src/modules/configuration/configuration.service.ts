import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ClauseRepository,
  ClauseRequestRepository,
  ReferenceRepository,
} from './configuration.repository';
import {
  ApprovalStatusEnum,
  AuthorizationStatusEnum,
  ClauseRecordsStatusTypeEnum,
  ClauseRequestTypeEnum,
  ClauseStatusTypeToColumnMappingEnum,
  IANATimeZoneDatabaseEnum,
  RequestStatusEnum,
} from 'src/common/enums';
import { CreateClausetDto, CreateReferenceDto } from './dto/configuration.dto';
import { Reference as ReferenceModel } from 'src/modules/configuration/models/reference.model';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { Sequelize } from 'sequelize-typescript';
import * as moment from 'moment-timezone';
import { Op, QueryTypes } from 'sequelize';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';
import {
  GetClauseRecordsResponse,
  GetClauseRequestsResponse,
  GetReferenceRecords,
} from './interfaces/get-configuration-records-response';
import { GetClauseRecordsDto } from './dto/get-clause-records.dto';
import {
  ClauseRequest,
  ClauseRequest as ClauseRequestModel,
} from './models/clause-request.model';
import { AuthorizeClauseRequestDto } from './dto/authorize-clause-request.dto';
import { Clause } from './models/clause.model';
import { ModifyClausetDto } from './dto/modify-clause-request.dto';
import { DeactivateClauseDto } from './dto/deactivate-clause.dto';
import { DeleteClausetDto } from './dto/delete-clause-code.dto';

@Injectable()
export class ClauseService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly clauseRequestRepository: ClauseRequestRepository,
    private readonly clauseRepository: ClauseRepository,
  ) {}

  private async generateClauseCode(): Promise<string> {
    const result = await this.sequelize.query(
      `SELECT nextval('clause_code_seq') AS nextval`,
      { type: QueryTypes.SELECT },
    );

    const nextVal = result[0]['nextval'];
    return `CLS-${String(nextVal).padStart(3, '0')}`;
  }

  async saveClauseAsDraft(data: CreateClausetDto) {
    let existingClauseRequest = null;
    if (data?.requestId) {
      existingClauseRequest = await this.clauseRequestRepository.findOne({
        where: { requestId: data?.requestId },
      });
    }

    if (existingClauseRequest && !data?.isDraft) {
      throw new BadRequestException(
        'Clause Request (or Record) with the same reference ID already exists',
      );
    }

    if (!existingClauseRequest && data?.isDraft) {
      throw new BadRequestException(
        'Clause Request is marked as draft but no existing matching record with the same reference ID exists.',
      );
    }

    if (existingClauseRequest?.isDraft) {
      const [, [savedClauseRequest]] =
        await this.clauseRequestRepository.update(data, {
          where: { requestId: data?.requestId },
          returning: true,
        });

      return savedClauseRequest;
    }

    const savedForexDealPostingRequest =
      await this.clauseRequestRepository.create({
        ...data,
        requestStatus: RequestStatusEnum.DRAFT,
        approvalStatus: null,
      });

    return savedForexDealPostingRequest;
  }

  async handleClauseApproval(
    data: CreateClausetDto | ClauseRequestModel,
    requestType: ClauseRequestTypeEnum,
  ) {
    let clauseRequest: ClauseRequest;
    switch (requestType) {
      case ClauseRequestTypeEnum.CREATION:
        await this.clauseRepository.create({
          clauseCode: await this.generateClauseCode(),
          clauseField: data?.clauseField,
          clauseName: data?.clauseName,
          clauseText: data?.clauseText,
          requestId: data?.requestId,
          isActive: true,
        });
        break;
      case ClauseRequestTypeEnum.DEACTIVATION:
        clauseRequest = await this.clauseRequestRepository.findOne({
          where: { requestId: data?.requestId },
        });
        await this.clauseRepository.update(
          { isActive: false },
          { where: { clauseCode: clauseRequest?.clauseCode }, returning: true },
        );
        break;
      case ClauseRequestTypeEnum.MODIFICATION:
        clauseRequest = await this.clauseRequestRepository.findOne({
          where: { requestId: data?.requestId },
        });
        await this.clauseRepository.update(data as Clause, {
          where: { clauseCode: clauseRequest?.clauseCode },
          returning: true,
        });
        break;
      case ClauseRequestTypeEnum.DELETION:
        clauseRequest = await this.clauseRequestRepository.findOne({
          where: { requestId: data?.requestId },
        });
        await this.clauseRepository.delete({
          where: { clauseCode: clauseRequest?.clauseCode },
        });
        break;
      default:
        throw new BadRequestException('Invalid Clause Request Type');
    }
  }

  async initiate(data: CreateClausetDto): Promise<ClauseRequestModel> {
    const {
      initiator,
      initiatorId,
      initiatorBranchCode,
      initiatorDepartment,
      userPermissions,
    } = data;

    let existingClauseRequest = null;

    if (data?.requestId) {
      existingClauseRequest = await this.clauseRequestRepository.findOne({
        where: { requestId: data?.requestId },
      });
    }

    if (existingClauseRequest && !data?.isDraft) {
      throw new BadRequestException(
        'Clause Request (or Record) with the same reference ID already exists',
      );
    }

    if (!existingClauseRequest && data?.isDraft) {
      throw new BadRequestException(
        'Clause Request is marked as draft but no existing matching record with the same reference ID exists.',
      );
    }

    const authorizingPermission = userPermissions.includes('');
    const approvalDetails = {
      approver: authorizingPermission ? initiator : null,
      approverId: authorizingPermission ? initiatorId : null,
      approverBranchCode: authorizingPermission ? initiatorBranchCode : null,
      approverDepartment: authorizingPermission ? initiatorDepartment : null,
    };

    let savedClauseRequest: ClauseRequestModel;

    if (data?.isDraft) {
      [, [savedClauseRequest]] = await this.clauseRequestRepository.update(
        {
          ...data,
          requestStatus: authorizingPermission
            ? RequestStatusEnum.APPROVED
            : RequestStatusEnum.IN_REVIEW,
          approvalStatus: authorizingPermission
            ? ApprovalStatusEnum.APPROVED
            : ApprovalStatusEnum.PENDING,
          ...approvalDetails,
        },
        {
          where: {
            requestId: data?.requestId,
          },
          returning: true,
        },
      );
    } else {
      savedClauseRequest = await this.clauseRequestRepository.create({
        ...data,
        ...approvalDetails,
      });
    }

    if (authorizingPermission) {
      await this.handleClauseApproval(
        {
          ...data,
          requestId: savedClauseRequest?.requestId,
        },
        ClauseRequestTypeEnum.CREATION,
      );
    }

    return savedClauseRequest;
  }

  async authorize(
    data: AuthorizeClauseRequestDto,
  ): Promise<ClauseRequestModel> {
    const {
      id,
      approver,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    } = data;

    const clauseData = await this.clauseRequestRepository.findOne({
      where: {
        requestId: id,
        approvalStatus: ApprovalStatusEnum.PENDING,
      },
    });

    if (!clauseData) {
      throw new NotFoundException('No Matching Account Data that Id found');
    }

    let valueToUpdate: Partial<ClauseRequestModel>;

    switch (approvalStatus.toLowerCase()) {
      case ApprovalStatusEnum.APPROVED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.APPROVED,
          requestStatus: RequestStatusEnum.APPROVED,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
        };
        break;
      case ApprovalStatusEnum.REJECTED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.REJECTED,
          requestStatus: RequestStatusEnum.IN_ISSUE,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
          reasonForRejection,
        };
        break;
    }

    const [, [authorizedClause]] = await this.clauseRequestRepository.update(
      valueToUpdate,
      {
        where: { requestId: clauseData?.requestId },
        returning: true,
      },
    );

    await this.handleClauseApproval(clauseData, data?.requestType);

    return authorizedClause;
  }

  async getClauseRecords(
    options: GetClauseRecordsDto,
  ): Promise<GetClauseRecordsResponse> {
    const {
      id,
      branch,
      page = 1,
      size = 10,
      startDate,
      endDate,
      recordScope = AuthorizationStatusEnum.CREATED_BY_ME,
      isActive,
      clauseCode,
    } = options;

    const query: { where: any; include?: any[] } = {
      where: {},
    };

    const relatedFilters: any[] = [];
    let needsClauseRequestJoin = false;

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        relatedFilters.push({
          '$clauseRequest.initiatorId$': id,
        });
        needsClauseRequestJoin = true;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        relatedFilters.push({
          '$clauseRequest.approverId$': id,
        });
        needsClauseRequestJoin = true;
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        relatedFilters.push({
          '$clauseRequest.initiatorBranchCode$': branch,
        });
        needsClauseRequestJoin = true;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        relatedFilters.push({
          '$clauseRequest.approverBranchCode$': branch,
        });
        needsClauseRequestJoin = true;
        break;
      case AuthorizationStatusEnum.CREATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.INITIATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.APPROVED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.SENT_SYSTEM_WIDE:
        break;
      default:
        throw new BadRequestException('Invalid Authorization Status');
    }

    if (needsClauseRequestJoin) {
      query.include = [
        {
          model: ClauseRequestModel,
          as: 'clauseRequest',
          required: true,
          attributes: [],
        },
      ];
    }

    if (relatedFilters.length > 0) {
      query.where = {
        [Op.and]: [
          query.where,
          relatedFilters.length === 1
            ? relatedFilters[0]
            : { [Op.and]: relatedFilters },
        ],
      };
    }

    if (isActive) {
      query.where.isActive = isActive === 'true';
    }

    if (clauseCode) {
      query.where.clauseCode = {
        [Op.iLike]: `%${clauseCode}%`,
      };
    }

    if (startDate && endDate) {
      query.where.createdAt = {
        [Op.between]: [
          moment
            .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
            .startOf('day')
            .toISOString(),
          moment
            .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
            .endOf('day')
            .toISOString(),
        ],
      };
    } else if (startDate) {
      query.where.createdAt = {
        [Op.gte]: moment
          .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
          .startOf('day')
          .toISOString(),
      };
    } else if (endDate) {
      query.where.createdAt = {
        [Op.lte]: moment
          .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
          .endOf('day')
          .toISOString(),
      };
    }

    const { count: totalRecords, rows: clauseRecords } =
      await this.clauseRepository.findAndCountAll({
        ...query,
        offset: (page - 1) * size,
        limit: size,
        order: [['createdAt', 'DESC']],
      });

    const totalPages = Math.ceil(totalRecords / size);

    return {
      page,
      totalPages,
      totalRecords,
      size,
      clauseRecords,
    };
  }

  async getClauseRequests(
    options: GetClauseRecordsDto,
  ): Promise<GetClauseRequestsResponse> {
    const {
      id,
      branch,
      page = 1,
      size = 10,
      startDate,
      endDate,
      requestStatus,
      recordScope = AuthorizationStatusEnum.CREATED_BY_ME,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      clauseCode,
    } = options;

    const query: { where: any } = {
      where: {},
    };

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        query.where.initiatorId = id;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        query.where.approverId = id;
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        query.where.initiatorBranchCode = branch;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        query.where.approverBranchCode = branch;
        break;
      case AuthorizationStatusEnum.CREATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.INITIATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.APPROVED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.SENT_SYSTEM_WIDE:
        break;
      default:
        throw new BadRequestException('Invalid Authorization Status');
    }

    if (requestStatus) {
      query.where.requestStatus = requestStatus;
    }

    if (startDate && endDate) {
      query.where.createdAt = {
        [Op.between]: [
          moment
            .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
            .startOf('day')
            .toISOString(),
          moment
            .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
            .endOf('day')
            .toISOString(),
        ],
      };
    } else if (startDate) {
      query.where.createdAt = {
        [Op.gte]: moment
          .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
          .startOf('day')
          .toISOString(),
      };
    } else if (endDate) {
      query.where.createdAt = {
        [Op.lte]: moment
          .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
          .endOf('day')
          .toISOString(),
      };
    }

    const { count: totalRecords, rows: clauseRequests } =
      await this.clauseRequestRepository.findAndCountAll({
        ...query,
        offset: (page - 1) * size,
        limit: size,
        order: [['createdAt', 'DESC']],
      });

    const totalPages = Math.ceil(totalRecords / size);

    return {
      page,
      totalPages,
      totalRecords,
      size,
      clauseRequests,
    };
  }

  async getClauseRecord(clauseCode: string) {
    const clauseRecord = await this.clauseRepository.findOne({
      where: {
        clauseCode,
      },
    });

    if (!clauseRecord) {
      throw new NotFoundException('No matching Clause Record Found');
    }

    return clauseRecord;
  }

  async getClauseRequestByRequestId(requestId: string) {
    const clauseRequest = await this.clauseRequestRepository.findOne({
      where: {
        requestId,
      },
    });

    if (!clauseRequest) {
      throw new NotFoundException('No matching Clause Record Found');
    }

    return clauseRequest;
  }

  async getClauseRecordByClauseId(clauseId: string) {
    const clauseRecord = await this.clauseRepository.findOne({
      where: {
        clauseId,
      },
    });

    if (!clauseRecord) {
      throw new NotFoundException('No matching Clause Record Found');
    }

    return clauseRecord;
  }

  async getClauseRecordByClauseCode(clauseCode: string) {
    const clauseRecord = await this.clauseRepository.findOne({
      where: {
        clauseCode,
      },
    });

    if (!clauseRecord) {
      throw new NotFoundException('No matching Clause Record Found');
    }

    return clauseRecord;
  }

  async getRequestsStatusCount(
    id: string,
    branch: string,
    statusType: ClauseRecordsStatusTypeEnum,
    recordScope: AuthorizationStatusEnum,
    requestStatus: RequestStatusEnum,
  ) {
    const query: { where: Partial<ClauseRequestModel> } = {
      where: {},
    };

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        query.where.initiatorId = id;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        query.where.approverId = id;
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        query.where.initiatorBranchCode = branch;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        query.where.approverBranchCode = branch;
        break;
      case AuthorizationStatusEnum.CREATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.INITIATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.APPROVED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.SENT_SYSTEM_WIDE:
        break;
      default:
        throw new BadRequestException('Invalid Authorization Status');
    }

    if (requestStatus) {
      query.where.requestStatus = requestStatus;
    }

    const clauseRequestsStatusCount = await this.clauseRequestRepository
      .scope(null)
      .findAll({
        where: query.where,
        attributes: [
          [ClauseStatusTypeToColumnMappingEnum[statusType], 'status'],
          [this.sequelize.fn('COUNT', this.sequelize.literal('*')), 'count'],
        ],
        group: [ClauseStatusTypeToColumnMappingEnum[statusType]],
        raw: true,
      });

    return clauseRequestsStatusCount.map((record: any) => ({
      status: record.status,
      count: parseInt(record.count, 10),
    }));
  }

  async getRecordsStatusCount(
    id: string,
    branch: string,
    recordScope: AuthorizationStatusEnum,
  ) {
    const query: { where: any } = {
      where: {},
    };

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        query.where.requestId = {
          [Op.in]: this.sequelize.literal(`
          (SELECT "requestId" FROM "clause_requests" WHERE "initiatorId" = '${id}')
        `),
        };
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        query.where.requestId = {
          [Op.in]: this.sequelize.literal(`
          (SELECT "requestId" FROM "clause_requests" WHERE "approverId" = '${id}')
        `),
        };
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        query.where.requestId = {
          [Op.in]: this.sequelize.literal(`
          (SELECT "requestId" FROM "clause_requests" WHERE "initiatorBranchCode" = '${branch}')
        `),
        };
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        query.where.requestId = {
          [Op.in]: this.sequelize.literal(`
          (SELECT "requestId" FROM "clause_requests" WHERE "approverBranchCode" = '${branch}')
        `),
        };
        break;
      case AuthorizationStatusEnum.CREATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.INITIATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.APPROVED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.SENT_SYSTEM_WIDE:
        break;
      default:
        throw new BadRequestException('Invalid Authorization Status');
    }

    const clauseRecordsStatusCount = await this.clauseRepository
      .scope(null)
      .findAll({
        where: query.where,
        attributes: [
          ['isActive', 'status'], // No qualification needed since no JOIN
          [this.sequelize.fn('COUNT', this.sequelize.literal('*')), 'count'],
        ],
        group: ['isActive'],
        raw: true,
      });

    return clauseRecordsStatusCount.map((record: any) => ({
      status: record.status,
      count: parseInt(record.count, 10),
    }));
  }

  async withdraw(id: string, initiatorId: string) {
    const clauseData = await this.clauseRequestRepository.findOne({
      where: {
        requestId: id,
        initiatorId,
        approvalStatus: ApprovalStatusEnum.PENDING,
      },
    });

    if (!clauseData) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    const [, [withdrawnClauseRequest]] =
      await this.clauseRequestRepository.update(
        {
          approvalStatus: null,
          requestStatus: RequestStatusEnum.DRAFT,
        },
        {
          where: { requestId: clauseData?.requestId },
          returning: true,
        },
      );

    return withdrawnClauseRequest;
  }

  async deactivate(data: DeactivateClauseDto) {
    const clauseData = await this.clauseRepository.findOne({
      where: {
        clauseCode: data?.clauseCode,
      },
    });

    if (!clauseData) {
      throw new NotFoundException(
        'No Matching request with that Request Id found',
      );
    }

    const deactivationClauseRequest = await this.clauseRequestRepository.create(
      {
        ...data,
        clauseField: clauseData?.clauseField,
        clauseName: clauseData?.clauseName,
        clauseText: clauseData?.clauseText,
        requestType: ClauseRequestTypeEnum.DEACTIVATION,
      },
    );

    return deactivationClauseRequest;
  }

  async modify(data: ModifyClausetDto) {
    const clauseData = await this.clauseRepository.findOne({
      where: {
        clauseCode: data?.clauseCode,
      },
    });

    if (!clauseData) {
      throw new NotFoundException(
        'No Matching clause with that clause code found',
      );
    }

    const modificationClauseRequest = await this.clauseRequestRepository.create(
      {
        ...data,
        clauseField: data?.clauseField || clauseData?.clauseField,
        clauseName: data?.clauseName || clauseData?.clauseName,
        clauseText: data?.clauseText || clauseData?.clauseText,
        requestType: ClauseRequestTypeEnum.MODIFICATION,
      },
    );

    return modificationClauseRequest;
  }

  async delete(data: DeleteClausetDto) {
    const clauseData = await this.clauseRepository.findOne({
      where: {
        clauseCode: data?.clauseCode,
      },
    });

    if (!clauseData) {
      throw new NotFoundException(
        'No Matching clause with that clause code found',
      );
    }

    const deletionClauseRequest = await this.clauseRequestRepository.create({
      clauseCode: data?.clauseCode,
      clauseField: clauseData?.clauseField,
      clauseName: clauseData?.clauseName,
      clauseText: clauseData?.clauseText,
      requestType: ClauseRequestTypeEnum.DELETION,
    });

    return deletionClauseRequest;
  }

  async deleteWithdrawn(id: string) {
    const clauseRequestData = await this.clauseRequestRepository.findOne({
      where: {
        requestId: id,
        requestStatus: RequestStatusEnum.DRAFT,
      },
    });

    if (!clauseRequestData) {
      throw new NotFoundException(
        'No Matching draft request with that Request Id found',
      );
    }

    const deletedClauseCount = await this.clauseRequestRepository.delete({
      where: { requestId: clauseRequestData?.requestId },
    });

    return deletedClauseCount;
  }
}

@Injectable()
export class ReferenceService {
  constructor(
    private readonly referenceRepository: ReferenceRepository,
    private readonly sequelize: Sequelize,
  ) {}

  async generateReferenceCode(): Promise<string> {
    const result = await this.sequelize.query(
      `SELECT nextval('reference_code_seq') AS nextval`,
      { type: 'SELECT' },
    );

    const nextVal = result[0]['nextval'];
    return `RFD${String(nextVal).padStart(4, '0')}`;
  }

  async initiate(data: CreateReferenceDto) {
    const {
      initiator,
      initiatorId,
      initiatorBranchCode,
      initiatorDepartment,
      userPermissions,
    } = data;

    const accountTypeData = await this.referenceRepository.create(data);

    if (userPermissions.includes('')) {
      await this.referenceRepository.update(
        {
          approver: initiator,
          approverId: initiatorId,
          approverBranchCode: initiatorBranchCode,
          approverDepartment: initiatorDepartment,
          requestStatus: RequestStatusEnum.APPROVED,
          approvalStatus: ApprovalStatusEnum.APPROVED,
        },
        {
          where: { referenceId: accountTypeData.referenceId },
          returning: true,
        },
      );
    }

    return accountTypeData;
  }

  async authorize(data: AuthorizeActionDto): Promise<ReferenceModel> {
    const {
      id,
      approver,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    } = data;

    const referenceData = await this.referenceRepository.findOne({
      where: {
        referenceId: id,
        approvalStatus: ApprovalStatusEnum.PENDING,
      },
    });

    if (!referenceData) {
      throw new NotFoundException('No Matching Account Data that Id found');
    }

    let valueToUpdate: Partial<ReferenceModel>;

    switch (approvalStatus.toLowerCase()) {
      case ApprovalStatusEnum.APPROVED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.APPROVED,
          requestStatus: RequestStatusEnum.APPROVED,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
        };
        break;
      case ApprovalStatusEnum.REJECTED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.REJECTED,
          requestStatus: RequestStatusEnum.IN_ISSUE,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
          reasonForRejection,
        };
        break;
    }

    const [, [authorizedAccount]] = await this.referenceRepository.update(
      valueToUpdate,
      {
        where: { referenceId: referenceData?.referenceId },
        returning: true,
      },
    );

    return authorizedAccount;
  }

  async getReferenceRecords(
    options: GetRecordsDto,
  ): Promise<GetReferenceRecords> {
    const {
      id,
      branch,
      page = 1,
      size = 10,
      startDate,
      endDate,
      requestStatus,
      approvalStatus,
      recordScope = AuthorizationStatusEnum.CREATED_BY_ME,
      isAuthorizer,
    } = options;

    const query: { where: Partial<ReferenceModel> } = {
      where: {},
    };

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        query.where.initiatorId = id;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        query.where.approverId = id;
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        query.where.initiatorBranchCode = branch;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        query.where.approverBranchCode = branch;
        break;
      case AuthorizationStatusEnum.CREATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.INITIATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.APPROVED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.SENT_SYSTEM_WIDE:
        break;
      default:
        throw new BadRequestException('Invalid Authorization Status');
    }

    if (isAuthorizer === 'true' && approvalStatus) {
      query.where.approvalStatus = approvalStatus;
    } else if (requestStatus) {
      query.where.requestStatus = requestStatus;
    }

    if (startDate && endDate) {
      query.where.createdAt = {
        [Op.between]: [
          moment
            .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
            .startOf('day')
            .toISOString(),
          moment
            .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
            .endOf('day')
            .toISOString(),
        ],
      };
    } else if (startDate) {
      query.where.createdAt = {
        [Op.gte]: moment
          .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
          .startOf('day')
          .toISOString(),
      };
    } else if (endDate) {
      query.where.createdAt = {
        [Op.lte]: moment
          .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
          .endOf('day')
          .toISOString(),
      };
    }

    const { count: totalRecords, rows: referenceRecords } =
      await this.referenceRepository.findAndCountAll({
        ...query,
        offset: (page - 1) * size,
        limit: size,
        order: [['createdAt', 'DESC']],
      });

    const totalPages = Math.ceil(totalRecords / size);

    return {
      page,
      totalPages,
      totalRecords,
      size,
      referenceRecords,
    };
  }
}
