import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreditLineRequest } from './models/credit-line-request.model';
import {
  IApproverObject,
  IInitiatorObject,
  IQueryObject,
} from 'src/common/interfaces';
import {
  ApprovalStatusEnum,
  CreditLineStatusEnum,
  RequestStatusEnum,
  RequestTypeEnum,
} from 'src/common/enums';
import { ActivityLogService } from '../activity-log/activity-log.service';
import {
  CreditLineRepository,
  CreditLineRequestRepository,
} from './credit-line.repository';
import { CreditLine } from './models/credit-line.model';
import { Op, WhereOptions } from 'sequelize';
import { plainToInstance } from 'class-transformer';
import { RejectRequestDto } from './dto/reject-request.dto';
import { HelperService } from 'src/helpers/helper.service';
import { CreditLineDto } from './dto/create-credit-line.dto';
import { Parser } from 'json2csv';

@Injectable()
export class CreditLineService {
  constructor(
    private readonly creditLineRepo: CreditLineRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly creditLineRequestRepo: CreditLineRequestRepository,
    private readonly helperService: HelperService,
  ) {}
  async createRequest(
    data: Partial<CreditLineRequest>,
    approverObj: IApproverObject,
    autoApprove: boolean,
  ): Promise<CreditLineRequest> {
    const { requestType } = data;
    const createData = { ...data, requestName: this.generateRequestName(data) };
    let request: CreditLineRequest;

    if (this.matchesRequest([RequestTypeEnum.DEACTIVATION], requestType)) {
      request = await this.createDeactivationRequest(createData);
      await this.createActivityLog(
        request.requestId,
        `${request.requestName} request created by ${request.initiator}`,
      );
    } else if (this.matchesRequest([RequestTypeEnum.ACTIVATION], requestType)) {
      request = await this.createDeactivationRequest(createData);
      await this.createActivityLog(
        request.requestId,
        `${request.requestName} request created by ${request.initiator}`,
      );
    } else if (
      this.matchesRequest([RequestTypeEnum.MODIFICATION], requestType)
    ) {
      request = await this.createModificationRequest(createData);
      await this.createActivityLog(
        request.requestId,
        `${request.requestName} request created by ${request.initiator}`,
      );
    } else {
      const { creditLineName } = createData;

      if (creditLineName && (await this.creditLineExists({ creditLineName })))
        throw new ConflictException('Credit line name already exists');

      request = await this.creditLineRequestRepo.create(
        createData as Partial<CreditLineRequest>,
      );
      await this.createActivityLog(
        request.requestId,
        `${request.requestName} request created by ${request.initiator}`,
      );
    }

    if (autoApprove) {
      return this.approveRequest(request.requestId, approverObj);
    }
    return request;
  }

  async createModificationRequest(
    requestData: Partial<CreditLineRequest>,
  ): Promise<CreditLineRequest> {
    const { creditLineId, creditLineName } = requestData;

    const creditLine = await this.findCreditLine(creditLineId);
    const creditLineNameIsNotTheSame =
      creditLine.creditLineName != creditLineName;
    if (
      creditLineNameIsNotTheSame &&
      creditLineName &&
      (await this.creditLineExists({ creditLineName }))
    )
      throw new ConflictException('Credit line name already exists');

    const createData = {
      ...requestData,
    };
    return this.creditLineRequestRepo.create(createData as unknown);
  }

  async createDeactivationRequest(
    requestData: Partial<CreditLineRequest>,
  ): Promise<CreditLineRequest> {
    const {
      creditLineId,
      requestType,
      supportingDocumentUrl,
      reasonForDeactivation,
    } = requestData;
    const product = await this.findCreditLine(creditLineId);

    const createData = {
      ...product,
      requestName: this.generateRequestName({
        requestType,
        creditLineName: product.creditLineName,
      }),
      requestType,
      creditLineId,
      supportingDocumentUrl,
      reasonForDeactivation,
    };
    return this.creditLineRequestRepo.create(createData as unknown);
  }
  async createActivationRequest(
    requestData: Partial<CreditLineRequest>,
  ): Promise<CreditLineRequest> {
    const { creditLineId, requestType } = requestData;
    const product = await this.findCreditLine(creditLineId);

    const createData = {
      ...product,
      requestName: this.generateRequestName({
        requestType,
        creditLineName: product.creditLineName,
      }),
      requestType,
      creditLineId,
    };
    return this.creditLineRequestRepo.create(createData as unknown);
  }

  async createDraftRequest(
    data: Partial<CreditLineRequest>,
  ): Promise<CreditLineRequest> {
    return this.createRequest(
      {
        ...data,
        requestStatus: RequestStatusEnum.DRAFT,
        approvalStatus: ApprovalStatusEnum.DRAFT,
      } as Partial<CreditLineRequest>,
      {} as IApproverObject,
      false,
    );
  }

  async approveRequest(
    id: string,
    approverObj: IApproverObject,
  ): Promise<CreditLineRequest> {
    const request = await this.findRequest(id);

    this.validateApproveRequest(request.requestStatus);

    const { requestType } = request;
    let approvedRequest: CreditLineRequest;

    if (this.matchesRequest([RequestTypeEnum.MODIFICATION], requestType)) {
      approvedRequest = await this.approveModificationRequest(
        id,
        request,
        approverObj,
      );
    } else if (
      this.matchesRequest([RequestTypeEnum.DEACTIVATION], requestType)
    ) {
      approvedRequest = await this.approveDeactivationRequest(
        id,
        request,
        approverObj,
      );
    } else if (this.matchesRequest([RequestTypeEnum.ACTIVATION], requestType)) {
      approvedRequest = await this.approveActivationRequest(
        id,
        request,
        approverObj,
      );
    } else {
      approvedRequest = await this.approveCreationRequest(
        id,
        request,
        approverObj,
      );
    }

    await this.createActivityLog(
      approvedRequest.requestId,
      `${approvedRequest.requestName} request approved by ${approvedRequest.approver}`,
    );
    return approvedRequest;
  }

  async approveCreationRequest(
    id: string,
    requestData: Partial<CreditLineRequest>,
    approverObj: IApproverObject,
  ): Promise<CreditLineRequest> {
    const trimmedData = this.cleanRequestData({
      ...requestData,
      ...approverObj,
    });
    const creditLineReferenceCode = await this.generateNextCreditLineCode();

    const creationData: Partial<CreditLine> = {
      ...trimmedData,
      status: CreditLineStatusEnum.ACTIVE,
      isActive: true,
      creditLineReferenceCode,
    };
    const { creditLineId, creditLineName } =
      await this.creditLineRepo.create(creationData);
    await this.createActivityLog(
      creditLineId,
      `${creditLineName} with creditLineReferenceCode: ${creditLineReferenceCode} created by ${trimmedData.approver}`,
    );

    const updateData: Partial<CreditLineRequest> = {
      approvalStatus: ApprovalStatusEnum.APPROVED,
      requestStatus: RequestStatusEnum.APPROVED,
      creditLineId,
      ...approverObj,
    };
    return this.updateRequest(id, updateData);
  }
  async approveModificationRequest(
    id: string,
    requestData: Partial<CreditLineRequest>,
    approverObj: IApproverObject,
  ): Promise<CreditLineRequest> {
    const { creditLineId } = requestData;
    const trimmedData = this.cleanRequestData({
      ...requestData,
      ...approverObj,
    });

    const product = await this.updateCreditLine(creditLineId, trimmedData);
    await this.createActivityLog(
      creditLineId,
      `${product.creditLineName} with creditLineReferenceCode: ${product.creditLineReferenceCode} approved by ${trimmedData.approver}`,
    );

    const updateData: Partial<CreditLineRequest> = {
      approvalStatus: ApprovalStatusEnum.APPROVED,
      requestStatus: RequestStatusEnum.APPROVED,
      creditLineId,
      ...approverObj,
    };
    return this.updateRequest(id, updateData);
  }

  async approveDeactivationRequest(
    id: string,
    requestData: Partial<CreditLineRequest>,
    approverObj: IApproverObject,
  ): Promise<CreditLineRequest> {
    const { creditLineId } = requestData;
    const updateCreditLineData: Partial<CreditLine> = {
      status: CreditLineStatusEnum.INACTIVE,
      isActive: false,
    };

    const product = await this.updateCreditLine(
      creditLineId,
      updateCreditLineData,
    );
    await this.createActivityLog(
      creditLineId,
      `${product.creditLineName} with creditLineReferenceCode: ${product.creditLineReferenceCode} approved by ${product.approver}`,
    );

    const updateData: Partial<CreditLineRequest> = {
      approvalStatus: ApprovalStatusEnum.APPROVED,
      requestStatus: RequestStatusEnum.APPROVED,
      creditLineId,
      ...approverObj,
    };
    return this.updateRequest(id, updateData);
  }

  async approveActivationRequest(
    id: string,
    requestData: Partial<CreditLineRequest>,
    approverObj: IApproverObject,
  ): Promise<CreditLineRequest> {
    const { creditLineId } = requestData;
    const updateCreditLineData: Partial<CreditLine> = {
      status: CreditLineStatusEnum.ACTIVE,
      isActive: true,
    };
    const product = await this.updateCreditLine(
      creditLineId,
      updateCreditLineData,
    );
    await this.createActivityLog(
      creditLineId,
      `${product.creditLineName} with creditLineReferenceCode: ${product.creditLineReferenceCode} activated by ${product.approver}`,
    );

    const updateData: Partial<CreditLineRequest> = {
      approvalStatus: ApprovalStatusEnum.APPROVED,
      requestStatus: RequestStatusEnum.APPROVED,
      creditLineId,
      ...approverObj,
    };
    return this.updateRequest(id, updateData);
  }

  async updateCreditLineRequest({
    data,
    initiatorObj,
    autoApprove,
    approverObj,
  }): Promise<CreditLineRequest> {
    const { requestId, creditLineName } = data;
    const request = await this.findRequest(requestId);

    if (await this.creditLineExists({ creditLineName }))
      throw new ConflictException('Credit Line already exists');
    this.validateUpdateRequest(request.requestStatus);
    this.validateInitiator(request.initiatorId, initiatorObj.initiatorId);

    const updateData: Partial<CreditLineRequest> = {
      ...data,
      requestStatus: RequestStatusEnum.IN_REVIEW,
      approvalStatus: ApprovalStatusEnum.PENDING,
      reasonForRejection: null,
    };
    const updated = await this.updateRequest(requestId, updateData);
    const updateRequest = await this.updateRequest(requestId, {
      requestName: this.generateRequestName(updated),
    });

    await this.createActivityLog(
      updateRequest.requestId,
      `${updateRequest.requestName} request updated by ${updateRequest.initiator}`,
    );

    if (autoApprove) return this.approveRequest(requestId, approverObj);

    return updateRequest;
  }

  async rejectRequest(
    id: string,
    approverObj: IApproverObject,
    rejectData: RejectRequestDto,
  ): Promise<CreditLineRequest> {
    const {
      reasonForRejection,
      newInitiatorId,
      newInitiatorFullName,
      newInitiatorDepartment,
      newInitiatorBranchCode,
    } = rejectData;
    const request = await this.findRequest(id);

    this.validateRejectRequest(request.requestStatus);

    const updateData: Partial<CreditLineRequest> = {
      requestStatus: RequestStatusEnum.IN_ISSUE,
      approvalStatus: ApprovalStatusEnum.REJECTED,
      ...approverObj,
      initiator: newInitiatorFullName,
      initiatorId: newInitiatorId,
      initiatorBranchCode: newInitiatorBranchCode,
      initiatorDepartment: newInitiatorDepartment,
      reasonForRejection,
    };

    const updateRequest = await this.updateRequest(id, updateData);
    await this.createActivityLog(
      updateRequest.requestId,
      `${updateRequest.requestName} request rejected by ${updateRequest.approver}`,
    );

    return updateRequest;
  }

  async withdrawAndModifyProductRequest(
    id: string,
    initiatorObj: IInitiatorObject,
  ): Promise<CreditLineRequest> {
    const request = await this.findRequest(id);

    this.validateWithdrawAndModifyRequest(request.requestStatus);
    this.validateInitiator(request.initiatorId, initiatorObj.initiatorId);

    const updateData: Partial<CreditLineRequest> = {
      requestStatus: RequestStatusEnum.DRAFT,
      approvalStatus: ApprovalStatusEnum.DRAFT,
    };

    const updateRequest = await this.updateRequest(id, updateData);
    await this.createActivityLog(
      updateRequest.requestId,
      `${updateRequest.requestName} request withdrawn by ${updateRequest.initiator}`,
    );

    return updateRequest;
  }

  async withdrawAndDeleteProductRequest(
    id: string,
    initiatorObj: IInitiatorObject,
  ): Promise<CreditLineRequest> {
    const request = await this.findRequest(id);

    this.validateWithdrawAndDeleteRequest(request.requestStatus);
    this.validateInitiator(request.initiatorId, initiatorObj.initiatorId);

    const updateData: Partial<CreditLineRequest> = {
      requestStatus: RequestStatusEnum.DELETED,
      approvalStatus: ApprovalStatusEnum.DELETED,
    };
    const updateRequest = await this.updateRequest(id, updateData);
    await this.createActivityLog(
      updateRequest.requestId,
      `${updateRequest.requestName} request deleted by ${updateRequest.initiator}`,
    );

    await this.creditLineRequestRepo.softDelete({ requestId: id });
    return updateRequest;
  }

  async getCounts(query: IQueryObject) {
    const { whereCase } = this.helperService.getPaginationQuery(query);

    const allRequestsWhereCase = whereCase;
    const allWhereCase = {
      ...whereCase,
      status: {
        [Op.not]: null,
      },
    };
    const approvedWhereCase = {
      ...whereCase,
      requestStatus: RequestStatusEnum.APPROVED,
    };
    const inIssueWhereCase = {
      ...whereCase,
      requestStatus: RequestStatusEnum.IN_ISSUE,
    };
    const inReviewWhereCase = {
      ...whereCase,
      requestStatus: RequestStatusEnum.IN_REVIEW,
    };
    const draftWhereCase = {
      ...whereCase,
      requestStatus: RequestStatusEnum.DRAFT,
    };
    const activeWhereCase = {
      ...whereCase,
      status: CreditLineStatusEnum.ACTIVE,
    };
    const inActiveWhereCase = {
      ...whereCase,
      status: CreditLineStatusEnum.INACTIVE,
    };

    const [
      allCreditLineRequests = 0,
      allCreditLines = 0,
      approved = 0,
      inReview = 0,
      inIssue = 0,
      draft = 0,
      active = 0,
      inActive = 0,
    ] = await Promise.all([
      this.creditLineRequestRepo.count(allRequestsWhereCase),
      this.creditLineRepo.count(allWhereCase),
      this.creditLineRequestRepo.count(approvedWhereCase),
      this.creditLineRequestRepo.count(inReviewWhereCase),
      this.creditLineRequestRepo.count(inIssueWhereCase),
      this.creditLineRequestRepo.count(draftWhereCase),
      this.creditLineRepo.count(activeWhereCase),
      this.creditLineRepo.count(inActiveWhereCase),
    ]);

    return {
      allCreditLineRequests,
      allCreditLines,
      approved,
      inReview,
      inIssue,
      draft,
      active,
      inActive,
    };
  }

  async getAllRequests(query: IQueryObject) {
    return this.findAll(this.creditLineRequestRepo, query, {});
  }

  async getAll(query: IQueryObject) {
    return this.findAll(this.creditLineRepo, query, {});
  }
  async downloadRecords(query: IQueryObject) {
    const data = await this.getAll(query);
    const parser = new Parser();
    const csv = parser.parse(data.records);
    return csv;
  }
  async downloadRequests(query: IQueryObject) {
    const data = await this.getAllRequests(query);
    const parser = new Parser();
    const csv = parser.parse(data.records);
    return csv;
  }

  async findAll(repo: any, query: IQueryObject, args: object) {
    const { page, pageSize, limit, offset, whereCase } =
      this.helperService.getPaginationQuery(query, args);
    const { data, count } = await repo.findAndCount({
      where: whereCase,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return this.helperService.getPagination(
      { count, rows: data },
      +page,
      +pageSize,
    );
  }

  async updateRequest(
    id: string,
    updatePayload: any,
  ): Promise<CreditLineRequest> {
    const updated = await this.creditLineRequestRepo.update(
      { requestId: id },
      updatePayload,
    );
    return updated[0];
  }

  async updateCreditLine(id: string, updatePayload: any): Promise<CreditLine> {
    const updated = await this.creditLineRepo.update(
      { creditLineId: id },
      updatePayload,
    );
    return updated[0];
  }
  async generateNextCreditLineCode(): Promise<string> {
    const lastProduct = await this.creditLineRepo.find({
      order: [['creditLineReferenceCode', 'DESC']],
      limit: 1,
    });
    const lastNumber = lastProduct[0]?.creditLineReferenceCode
      ? parseInt(lastProduct[0].creditLineReferenceCode.replace('CL', ''), 10)
      : 0;
    const newCode = `CL${(lastNumber + 1).toString().padStart(5, '0')}`;

    return newCode;
  }
  generateRequestName(requestData: Partial<CreditLineRequest>): string {
    const { requestType, creditLineName } = requestData;
    return `${requestType} of ${creditLineName}`;
  }

  matchesRequest(validTypes: string[], valueToCheck: string): boolean {
    return validTypes.includes(valueToCheck);
  }
  cleanRequestData(
    incomingData: Partial<CreditLineRequest>,
  ): Partial<CreditLine> {
    const cleanedData = plainToInstance(CreditLineDto, incomingData, {
      excludeExtraneousValues: true,
    });
    return cleanedData;
  }

  async createActivityLog(requestId: string, description: string) {
    this.activityLogService.create({ requestId, description });
  }

  async findByAny(identifier: string): Promise<CreditLine> {
    const creditLine = await this.creditLineRepo.findByAny(identifier);
    if (!creditLine) throw new NotFoundException('Credit line not found');
    return creditLine;
  }

  async findCreditLine(creditLineId: string): Promise<CreditLine> {
    const creditLine = await this.creditLineRepo.findOne({ creditLineId });
    if (!creditLine) throw new NotFoundException('Credit line not found');
    return creditLine;
  }
  async findRequest(requestId: string): Promise<CreditLineRequest> {
    const request = await this.creditLineRequestRepo.findOne({ requestId });
    if (!request) throw new NotFoundException('Credit line request not found');
    return request;
  }
  async creditLineExists(args: WhereOptions<CreditLine>): Promise<boolean> {
    const count = await this.creditLineRepo.count(args);
    return count > 0;
  }
  validateApproveRequest(requestStatus: string) {
    if (!this.matchesRequest([RequestStatusEnum.IN_REVIEW], requestStatus)) {
      throw new BadRequestException(
        `Action denied: Request cannot be approved because it is currently in '${requestStatus}'`,
      );
    }
  }

  validateUpdateRequest(requestStatus: string) {
    if (
      !this.matchesRequest(
        [RequestStatusEnum.IN_ISSUE, RequestStatusEnum.DRAFT],
        requestStatus,
      )
    ) {
      throw new BadRequestException(
        `Action denied: Request cannot be updated because it is currently in '${requestStatus}'`,
      );
    }
  }

  validateRejectRequest(requestStatus: string) {
    if (!this.matchesRequest([RequestStatusEnum.IN_REVIEW], requestStatus)) {
      throw new BadRequestException(
        `Action denied: Request cannot be rejected because it is currently in '${requestStatus}'`,
      );
    }
  }

  validateWithdrawAndModifyRequest(requestStatus: string) {
    if (
      !this.matchesRequest(
        [RequestStatusEnum.IN_REVIEW, RequestStatusEnum.IN_ISSUE],
        requestStatus,
      )
    ) {
      throw new BadRequestException(
        `Action denied: Request cannot be withdrawn because it is currently in '${requestStatus}'`,
      );
    }
  }

  validateWithdrawAndDeleteRequest(requestStatus: string) {
    if (
      !this.matchesRequest(
        [RequestStatusEnum.IN_REVIEW, RequestStatusEnum.DRAFT],
        requestStatus,
      )
    ) {
      throw new BadRequestException(
        `Action denied: Request cannot be  withdrawn because it is currently in '${requestStatus}'`,
      );
    }
  }

  validateInitiator(requestInitiatorId: string, userInitiatorId: string) {
    if (requestInitiatorId != userInitiatorId) {
      throw new BadRequestException(
        'Action denied: Request was not initiated by the current user',
      );
    }
  }
}
