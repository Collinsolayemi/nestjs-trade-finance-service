import { type Mocked, TestBed } from '@suites/unit';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RegulatoryFormService } from './regulatory-form.service';
import {
  FormMRepository,
  FormNXPRepository,
  FormNCXRepository,
  RegulatoryFormChargesAndTaxesRepository,
} from './regulatory-form.repository';
import { StpExceptionRepository } from './stp-exception.repository';
import { StpExceptionRequestRepository } from './stp-exception-request.repository';
import { Sequelize } from 'sequelize-typescript';
import { AuthService } from 'src/services/auth/auth.service';
import { CamsService } from 'src/services/cams/cams.service';
import { CustomerManagementService } from 'src/services/customer-management/customer-management.service';
import { ComplianceService } from 'src/services/compliance/compliance.service';
import { OnePlugService } from 'src/services/one-plug/one-plug.service';
import { TRMSService } from 'src/services/trms/trms.service';
import { ProductManagementService } from 'src/services/product-management/product-management.service';
import {
  RegulatoryFormTypeEnum,
  GetFormMRecordIdentifierEnum,
  GetFormNXPRecordIdentifierEnum,
  GetFormNCXRecordIdentifierEnum,
  GetAllFormMRecordsStatusCountIdentifierEnum,
  ApprovalStatusEnum,
  RequestStatusEnum,
  AuthorizationStatusEnum,
  RecordsStatusTypeEnum,
  StpExceptionResolveTypeEnum,
  StpExceptionTypeEnum,
} from 'src/common/enums';

describe('RegulatoryFormService', () => {
  let service: RegulatoryFormService;
  let sequelize: Mocked<Sequelize>;
  let formMRepository: Mocked<FormMRepository>;
  let formNXPRepository: Mocked<FormNXPRepository>;
  let formNCXRepository: Mocked<FormNCXRepository>;
  let regulatoryFormChargesAndTaxesRepository: Mocked<RegulatoryFormChargesAndTaxesRepository>;
  let stpExceptionRepository: Mocked<StpExceptionRepository>;
  let stpExceptionRequestRepository: Mocked<StpExceptionRequestRepository>;
  let authService: Mocked<AuthService>;
  let camsService: Mocked<CamsService>;
  let customerManagementService: Mocked<CustomerManagementService>;
  let complianceService: Mocked<ComplianceService>;
  let onePlugService: Mocked<OnePlugService>;
  let trmsService: Mocked<TRMSService>;
  let productManagementService: Mocked<ProductManagementService>;
  let formMValidationQueueAdd: jest.Mock;
  let formMChargesQueueAdd: jest.Mock;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      RegulatoryFormService,
    ).compile();

    service = unit;
    sequelize = unitRef.get(Sequelize);
    formMRepository = unitRef.get(FormMRepository);
    formNXPRepository = unitRef.get(FormNXPRepository);
    formNCXRepository = unitRef.get(FormNCXRepository);
    regulatoryFormChargesAndTaxesRepository = unitRef.get(
      RegulatoryFormChargesAndTaxesRepository,
    );
    stpExceptionRepository = unitRef.get(StpExceptionRepository);
    stpExceptionRequestRepository = unitRef.get(StpExceptionRequestRepository);
    authService = unitRef.get(AuthService);
    camsService = unitRef.get(CamsService);
    customerManagementService = unitRef.get(CustomerManagementService);
    complianceService = unitRef.get(ComplianceService);
    onePlugService = unitRef.get(OnePlugService);
    trmsService = unitRef.get(TRMSService);
    productManagementService = unitRef.get(ProductManagementService);

    formMValidationQueueAdd = jest.fn().mockResolvedValue(undefined);
    formMChargesQueueAdd = jest.fn().mockResolvedValue(undefined);
    (service as any).formMValidationQueue = { add: formMValidationQueueAdd };
    (service as any).formMChargesQueue = { add: formMChargesQueueAdd };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getRegulatoryFormRecord', () => {
    it('should return Form M record when found', async () => {
      const record = { applicationNumber: 'APP1', totalCAndF: 1000 } as any;
      formMRepository.findOne.mockResolvedValue(record as any);

      const result = await service.getRegulatoryFormRecord(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(result).toEqual(record);
      expect(formMRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { applicationNumber: 'APP1' } }),
      );
    });

    it('should throw NotFoundException when Form M record not found', async () => {
      formMRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getRegulatoryFormRecord(
          'APP999',
          RegulatoryFormTypeEnum.FORM_M,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return Form NXP record when found', async () => {
      const record = { applicationNumber: 'NXP1', totalCF: 500 } as any;
      formNXPRepository.findOne.mockResolvedValue(record as any);

      const result = await service.getRegulatoryFormRecord(
        'NXP1',
        RegulatoryFormTypeEnum.FORM_NXP,
      );

      expect(result).toEqual(record);
      expect(formNXPRepository.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when Form NXP record not found', async () => {
      formNXPRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getRegulatoryFormRecord(
          'NXP999',
          RegulatoryFormTypeEnum.FORM_NXP,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return Form NCX record when found', async () => {
      const record = { applicationNumber: 'NCX1', totalCF: 200 } as any;
      formNCXRepository.findOne.mockResolvedValue(record as any);

      const result = await service.getRegulatoryFormRecord(
        'NCX1',
        RegulatoryFormTypeEnum.FORM_NCX,
      );

      expect(result).toEqual(record);
      expect(formNCXRepository.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when Form NCX record not found', async () => {
      formNCXRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getRegulatoryFormRecord(
          'NCX999',
          RegulatoryFormTypeEnum.FORM_NCX,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for unsupported regulatory form type', async () => {
      await expect(
        service.getRegulatoryFormRecord(
          'APP1',
          'UNSUPPORTED' as RegulatoryFormTypeEnum,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFormMRecord', () => {
    it('should throw NotFoundException for invalid identifier', async () => {
      await expect(
        service.getFormMRecord('id1', {
          identifier: 'invalid' as GetFormMRecordIdentifierEnum,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when Form M record not found', async () => {
      formMRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getFormMRecord('APP1', {
          identifier: GetFormMRecordIdentifierEnum.APPLICATION_NUMBER,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return and update Form M when found and OnePlug returns document', async () => {
      const formMRecord = {
        formMId: 'fm1',
        applicationNumber: 'APP1',
        formNumber: 'F1',
      } as any;
      formMRepository.findOne.mockResolvedValue(formMRecord as any);
      authService.getSystemUserToken = jest.fn() as any;
      onePlugService.login = jest
        .fn()
        .mockResolvedValue({ value: { accessToken: 't' } }) as any;
      onePlugService.onePlugBodogwuLogin = jest
        .fn()
        .mockResolvedValue({ token: 'bt' }) as any;
      onePlugService.onePlugBodogwuGetByReferenceNumber = jest
        .fn()
        .mockResolvedValue({ documents: { status: 'Validated' } }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);
      formMRepository.findByPk.mockResolvedValue({
        ...formMRecord,
        status: 'Validated',
      } as any);

      const result = await service.getFormMRecord('APP1', {
        identifier: GetFormMRecordIdentifierEnum.APPLICATION_NUMBER,
      });

      expect(formMRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when Form M document not found in OnePlug', async () => {
      const formMRecord = {
        formMId: 'fm1',
        applicationNumber: 'APP1',
        formNumber: 'F1',
      } as any;
      formMRepository.findOne.mockResolvedValue(formMRecord as any);
      onePlugService.login = jest
        .fn()
        .mockResolvedValue({ value: { accessToken: 't' } }) as any;
      onePlugService.onePlugBodogwuLogin = jest
        .fn()
        .mockResolvedValue({ token: 'bt' }) as any;
      onePlugService.onePlugBodogwuGetByReferenceNumber = jest
        .fn()
        .mockResolvedValue(null) as any;

      await expect(
        service.getFormMRecord('APP1', {
          identifier: GetFormMRecordIdentifierEnum.APPLICATION_NUMBER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should find by FORM_M_ID and update when document found', async () => {
      const formMRecord = {
        formMId: 'fm1',
        applicationNumber: 'APP1',
        formNumber: 'F1',
      } as any;
      formMRepository.findOne.mockResolvedValue(formMRecord as any);
      onePlugService.login = jest
        .fn()
        .mockResolvedValue({ value: { accessToken: 't' } }) as any;
      onePlugService.onePlugBodogwuLogin = jest
        .fn()
        .mockResolvedValue({ token: 'bt' }) as any;
      onePlugService.onePlugBodogwuGetByReferenceNumber = jest
        .fn()
        .mockResolvedValue({ documents: { status: 'Validated' } }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);
      formMRepository.findByPk.mockResolvedValue({
        ...formMRecord,
        status: 'Validated',
      } as any);

      const result = await service.getFormMRecord('fm1', {
        identifier: GetFormMRecordIdentifierEnum.FORM_M_ID,
      });

      expect(formMRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { formMId: 'fm1' } }),
      );
      expect(result).toBeDefined();
    });

    it('should find by FORM_NUMBER', async () => {
      const formMRecord = {
        formMId: 'fm1',
        applicationNumber: 'APP1',
        formNumber: 'F1',
      } as any;
      formMRepository.findOne.mockResolvedValue(formMRecord as any);
      onePlugService.login = jest
        .fn()
        .mockResolvedValue({ value: { accessToken: 't' } }) as any;
      onePlugService.onePlugBodogwuLogin = jest
        .fn()
        .mockResolvedValue({ token: 'bt' }) as any;
      onePlugService.onePlugBodogwuGetByReferenceNumber = jest
        .fn()
        .mockResolvedValue({ documents: {} }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);
      formMRepository.findByPk.mockResolvedValue(formMRecord as any);

      const result = await service.getFormMRecord('F1', {
        identifier: GetFormMRecordIdentifierEnum.FORM_NUMBER,
      });

      expect(formMRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { formNumber: 'F1' } }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getFormMRecords', () => {
    it('should return paginated Form M records', async () => {
      const rows = [{ formMId: '1', applicationNumber: 'APP1' }];
      formMRepository.findAndCountAll.mockResolvedValue({
        count: 1,
        rows,
      } as any);

      const result = await service.getFormMRecords({ page: 1, size: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.formMRecords).toEqual(rows);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should apply validOnly filter when set', async () => {
      formMRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getFormMRecords({ page: 1, size: 10, validOnly: true });

      expect(formMRepository.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isCustomerAccountValid: true,
            isAccountRestrictionValid: true,
            isBalanceEnquiryValid: true,
            isWatchlistStatusValid: true,
          }),
        }),
      );
    });

    it('should apply applicationNumber and status filters', async () => {
      formMRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getFormMRecords({
        page: 1,
        size: 10,
        applicationNumber: 'APP',
        status: 'Validated' as any,
      });

      expect(formMRepository.findAndCountAll).toHaveBeenCalled();
    });

    it('should apply startDate only filter', async () => {
      formMRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getFormMRecords({
        page: 1,
        size: 10,
        startDate: '2025-01-01',
      });

      const call = formMRepository.findAndCountAll.mock.calls[0][0];
      expect((call.where as any).createdAt).toBeDefined();
      expect(formMRepository.findAndCountAll).toHaveBeenCalled();
    });

    it('should apply endDate only filter', async () => {
      formMRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getFormMRecords({
        page: 1,
        size: 10,
        endDate: '2025-12-31',
      });

      expect(formMRepository.findAndCountAll).toHaveBeenCalled();
    });

    it('should apply applicantName filter', async () => {
      formMRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getFormMRecords({
        page: 1,
        size: 10,
        applicantName: 'Acme',
      });

      expect(formMRepository.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ applicantName: expect.any(Object) }),
        }),
      );
    });
  });

  describe('getRegulatoryFormRecordsStatusCount', () => {
    it('should return Form M count', async () => {
      formMRepository.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [],
      } as any);

      const result = await service.getRegulatoryFormRecordsStatusCount(
        GetAllFormMRecordsStatusCountIdentifierEnum.FORM_M,
      );

      expect(result).toBe(5);
    });

    it('should return Form NXP count', async () => {
      formNXPRepository.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: [],
      } as any);

      const result = await service.getRegulatoryFormRecordsStatusCount(
        GetAllFormMRecordsStatusCountIdentifierEnum.FORM_NXP,
      );

      expect(result).toBe(3);
    });

    it('should return Form NCX count', async () => {
      formNCXRepository.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [],
      } as any);

      const result = await service.getRegulatoryFormRecordsStatusCount(
        GetAllFormMRecordsStatusCountIdentifierEnum.FORM_NCX,
      );

      expect(result).toBe(2);
    });

    it('should return STP Exception count', async () => {
      stpExceptionRepository.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [],
      } as any);

      const result = await service.getRegulatoryFormRecordsStatusCount(
        GetAllFormMRecordsStatusCountIdentifierEnum.STP_EXCEPTION,
      );

      expect(result).toBe(1);
    });
  });

  describe('getFormNXPRecord', () => {
    it('should throw NotFoundException for invalid identifier', async () => {
      await expect(
        service.getFormNXPRecord('id1', {
          identifier: 'invalid' as GetFormNXPRecordIdentifierEnum,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when record not found', async () => {
      formNXPRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getFormNXPRecord('NXP1', {
          identifier: GetFormNXPRecordIdentifierEnum.APPLICATION_NUMBER,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return and update Form NXP when found', async () => {
      const formNXPRecord = {
        formNXPId: 'nxp1',
        applicationNumber: 'NXP1',
        id: 'trms-id',
      } as any;
      formNXPRepository.findOne.mockResolvedValue(formNXPRecord as any);
      trmsService.login = jest.fn().mockResolvedValue('token') as any;
      trmsService.getFormNXPDetails = jest
        .fn()
        .mockResolvedValue({ status: 'Validated' }) as any;
      formNXPRepository.update.mockResolvedValue(undefined as any);
      formNXPRepository.findByPk.mockResolvedValue({
        ...formNXPRecord,
        status: 'Validated',
      } as any);

      const result = await service.getFormNXPRecord('NXP1', {
        identifier: GetFormNXPRecordIdentifierEnum.APPLICATION_NUMBER,
      });

      expect(formNXPRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should find by FORM_NXP_ID', async () => {
      const formNXPRecord = {
        formNXPId: 'nxp1',
        applicationNumber: 'NXP1',
        id: 'trms-id',
      } as any;
      formNXPRepository.findOne.mockResolvedValue(formNXPRecord as any);
      trmsService.login = jest.fn().mockResolvedValue('token') as any;
      trmsService.getFormNXPDetails = jest
        .fn()
        .mockResolvedValue({ status: 'Validated' }) as any;
      formNXPRepository.update.mockResolvedValue(undefined as any);
      formNXPRepository.findByPk.mockResolvedValue(formNXPRecord as any);

      const result = await service.getFormNXPRecord('nxp1', {
        identifier: GetFormNXPRecordIdentifierEnum.FORM_NXP_ID,
      });

      expect(formNXPRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { formNXPId: 'nxp1' } }),
      );
      expect(result).toBeDefined();
    });

    it('should find by FORM_NUMBER', async () => {
      const formNXPRecord = {
        formNXPId: 'nxp1',
        applicationNumber: 'NXP1',
        formNumber: 'FN1',
        id: 'trms-id',
      } as any;
      formNXPRepository.findOne.mockResolvedValue(formNXPRecord as any);
      trmsService.login = jest.fn().mockResolvedValue('token') as any;
      trmsService.getFormNXPDetails = jest.fn().mockResolvedValue({}) as any;
      formNXPRepository.update.mockResolvedValue(undefined as any);
      formNXPRepository.findByPk.mockResolvedValue(formNXPRecord as any);

      const result = await service.getFormNXPRecord('FN1', {
        identifier: GetFormNXPRecordIdentifierEnum.FORM_NUMBER,
      });

      expect(formNXPRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { formNumber: 'FN1' } }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getFormNXPRecords', () => {
    it('should return paginated Form NXP records', async () => {
      const rows = [{ formNXPId: '1', applicationNumber: 'NXP1' }];
      formNXPRepository.findAndCountAll.mockResolvedValue({
        count: 1,
        rows,
      } as any);

      const result = await service.getFormNXPRecords({ page: 1, size: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.formNXPRecords).toEqual(rows);
    });

    it('should apply validOnly and applicantName filters', async () => {
      formNXPRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getFormNXPRecords({
        page: 1,
        size: 10,
        validOnly: true,
        applicantName: 'Exporter',
      });

      const call = formNXPRepository.findAndCountAll.mock.calls[0][0];
      expect((call.where as any).isCustomerAccountValid).toBe(true);
      expect((call.where as any).exporterName).toBeDefined();
    });
  });

  describe('getFormNCXRecord', () => {
    it('should throw NotFoundException when record not found', async () => {
      formNCXRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getFormNCXRecord('NCX1', {
          identifier: GetFormNCXRecordIdentifierEnum.APPLICATION_NUMBER,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return and update Form NCX when found', async () => {
      const formNCXRecord = {
        formNCXId: 'ncx1',
        applicationNumber: 'NCX1',
        id: 'trms-id',
      } as any;
      formNCXRepository.findOne.mockResolvedValue(formNCXRecord as any);
      trmsService.login = jest.fn().mockResolvedValue('token') as any;
      trmsService.getFormNCXDetails = jest
        .fn()
        .mockResolvedValue({ status: 'Validated' }) as any;
      formNCXRepository.update.mockResolvedValue(undefined as any);
      formNCXRepository.findByPk.mockResolvedValue({
        ...formNCXRecord,
        status: 'Validated',
      } as any);

      const result = await service.getFormNCXRecord('NCX1', {
        identifier: GetFormNCXRecordIdentifierEnum.APPLICATION_NUMBER,
      });

      expect(formNCXRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should find by FORM_NCX_ID', async () => {
      const formNCXRecord = {
        formNCXId: 'ncx1',
        applicationNumber: 'NCX1',
        id: 'trms-id',
      } as any;
      formNCXRepository.findOne.mockResolvedValue(formNCXRecord as any);
      trmsService.login = jest.fn().mockResolvedValue('token') as any;
      trmsService.getFormNCXDetails = jest.fn().mockResolvedValue({}) as any;
      formNCXRepository.update.mockResolvedValue(undefined as any);
      formNCXRepository.findByPk.mockResolvedValue(formNCXRecord as any);

      const result = await service.getFormNCXRecord('ncx1', {
        identifier: GetFormNCXRecordIdentifierEnum.FORM_NCX_ID,
      });

      expect(formNCXRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { formNCXId: 'ncx1' } }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getFormNCXRecords', () => {
    it('should return paginated Form NCX records', async () => {
      const rows = [{ formNCXId: '1', applicationNumber: 'NCX1' }];
      formNCXRepository.findAndCountAll.mockResolvedValue({
        count: 1,
        rows,
      } as any);

      const result = await service.getFormNCXRecords({ page: 1, size: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.formNCXRecords).toEqual(rows);
    });

    it('should apply validOnly, status and applicationNumber filters', async () => {
      formNCXRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getFormNCXRecords({
        page: 1,
        size: 10,
        validOnly: true,
        status: 'Validated' as any,
        applicationNumber: 'NCX',
      });

      const call = formNCXRepository.findAndCountAll.mock.calls[0][0];
      expect((call.where as any).isCustomerAccountValid).toBe(true);
      expect(formNCXRepository.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('getStpException', () => {
    it('should throw NotFoundException when not found', async () => {
      stpExceptionRepository.findOne.mockResolvedValue(null as any);

      await expect(service.getStpException('stp1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return STP exception when found', async () => {
      const stp = { stpExceptionId: 'stp1', applicationNumber: 'APP1' } as any;
      stpExceptionRepository.findOne.mockResolvedValue(stp as any);

      const result = await service.getStpException('stp1');

      expect(result).toEqual(stp);
    });
  });

  describe('getStpRequestsStatusCount', () => {
    it('should throw BadRequestException for invalid recordScope', async () => {
      await expect(
        service.getStpRequestsStatusCount(
          'u',
          'br',
          RecordsStatusTypeEnum.INITIATOR_VIEW,
          RegulatoryFormTypeEnum.FORM_M,
          'invalid' as AuthorizationStatusEnum,
          RequestStatusEnum.APPROVED,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return status counts for valid scope', async () => {
      const scopedRepo = {
        findAll: jest
          .fn()
          .mockResolvedValue([{ status: 'Approved', count: '2' }]),
      };
      stpExceptionRequestRepository.scope = jest
        .fn()
        .mockReturnValue(scopedRepo) as any;

      const result = await service.getStpRequestsStatusCount(
        'u',
        'br',
        RecordsStatusTypeEnum.INITIATOR_VIEW,
        undefined as any,
        AuthorizationStatusEnum.CREATED_BY_ME,
        RequestStatusEnum.APPROVED,
      );

      expect(result).toEqual([{ status: 'Approved', count: 2 }]);
    });

    it('should apply APPROVED_BY_ME scope and requestStatus', async () => {
      const scopedRepo = {
        findAll: jest.fn().mockResolvedValue([{ status: 'Draft', count: '1' }]),
      };
      stpExceptionRequestRepository.scope = jest
        .fn()
        .mockReturnValue(scopedRepo) as any;

      const result = await service.getStpRequestsStatusCount(
        'u',
        'br',
        RecordsStatusTypeEnum.INITIATOR_VIEW,
        undefined as any,
        AuthorizationStatusEnum.APPROVED_BY_ME,
        RequestStatusEnum.DRAFT,
      );

      expect(scopedRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ status: 'Draft', count: 1 }]);
    });

    it('should apply CREATED_BY_MY_BRANCH scope', async () => {
      const scopedRepo = { findAll: jest.fn().mockResolvedValue([]) };
      stpExceptionRequestRepository.scope = jest
        .fn()
        .mockReturnValue(scopedRepo) as any;

      await service.getStpRequestsStatusCount(
        'u',
        'br',
        RecordsStatusTypeEnum.INITIATOR_VIEW,
        undefined as any,
        AuthorizationStatusEnum.CREATED_BY_MY_BRANCH,
        undefined as any,
      );

      expect(scopedRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('getStpExceptions', () => {
    it('should return paginated STP exceptions', async () => {
      const rows = [{ stpExceptionId: 'stp1', applicationNumber: 'APP1' }];
      stpExceptionRepository.findAndCountAll.mockResolvedValue({
        count: 1,
        rows,
      } as any);

      const result = await service.getStpExceptions({ page: 1, size: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.stpExceptions).toEqual(rows);
      expect(result.page).toBe(1);
    });

    it('should apply applicationNumber and regulatoryFormType filters', async () => {
      stpExceptionRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getStpExceptions({
        page: 1,
        size: 10,
        applicationNumber: 'APP',
        regulatoryFormType: RegulatoryFormTypeEnum.FORM_M,
      });

      expect(stpExceptionRepository.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('getStpExceptionRequests', () => {
    it('should throw BadRequestException for invalid recordScope', async () => {
      await expect(
        service.getStpExceptionRequests({
          id: 'u',
          branch: 'br',
          recordScope: 'invalid' as AuthorizationStatusEnum,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return paginated requests for valid scope without regulatoryFormType', async () => {
      const rows = [{ requestId: 'req1' }];
      stpExceptionRequestRepository.findAndCountAll.mockResolvedValue({
        count: 1,
        rows,
      } as any);

      const result = await service.getStpExceptionRequests({
        id: 'u',
        branch: 'br',
        page: 1,
        size: 10,
        recordScope: AuthorizationStatusEnum.CREATED_BY_ME,
      } as any);

      expect(result.totalRecords).toBe(1);
      expect(result.stpExceptionRequests).toEqual(rows);
    });

    it('should apply isAuthorizer and approvalStatus when isAuthorizer is true', async () => {
      stpExceptionRequestRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getStpExceptionRequests({
        id: 'u',
        branch: 'br',
        page: 1,
        size: 10,
        recordScope: AuthorizationStatusEnum.CREATED_BY_ME,
        isAuthorizer: 'true',
        approvalStatus: ApprovalStatusEnum.APPROVED,
      } as any);

      const call =
        stpExceptionRequestRepository.findAndCountAll.mock.calls[0][0];
      expect((call.where as any).approvalStatus).toBe(
        ApprovalStatusEnum.APPROVED,
      );
    });

    it('should apply startDate and endDate filters', async () => {
      stpExceptionRequestRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getStpExceptionRequests({
        id: 'u',
        branch: 'br',
        page: 1,
        size: 10,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      } as any);

      const call =
        stpExceptionRequestRepository.findAndCountAll.mock.calls[0][0];
      expect((call.where as any).createdAt).toBeDefined();
    });
  });

  describe('getStpExceptionRequest', () => {
    it('should throw NotFoundException when not found', async () => {
      stpExceptionRequestRepository.findOne.mockResolvedValue(null as any);

      await expect(service.getStpExceptionRequest('req1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return request when found', async () => {
      const req = { requestId: 'req1' } as any;
      stpExceptionRequestRepository.findOne.mockResolvedValue(req as any);

      const result = await service.getStpExceptionRequest('req1');

      expect(result).toEqual(req);
    });
  });

  describe('withdraw', () => {
    it('should throw NotFoundException when no matching request', async () => {
      stpExceptionRequestRepository.findOne.mockResolvedValue(null as any);

      await expect(service.withdraw('req1', 'init1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update and return request when found', async () => {
      const req = { requestId: 'req1' } as any;
      stpExceptionRequestRepository.findOne
        .mockResolvedValueOnce(req as any)
        .mockResolvedValueOnce({
          ...req,
          requestStatus: RequestStatusEnum.DRAFT,
        } as any);
      stpExceptionRequestRepository.update.mockResolvedValue(undefined as any);

      const result = await service.withdraw('req1', 'init1');

      expect(stpExceptionRequestRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          approvalStatus: null,
          requestStatus: RequestStatusEnum.DRAFT,
        }),
        expect.any(Object),
      );
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException when no matching request', async () => {
      stpExceptionRequestRepository.findOne.mockResolvedValue(null as any);

      await expect(service.delete('req1', 'init1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete and return count when found', async () => {
      const req = { requestId: 'req1' } as any;
      stpExceptionRequestRepository.findOne.mockResolvedValue(req as any);
      stpExceptionRequestRepository.delete.mockResolvedValue(1 as any);

      const result = await service.delete('req1', 'init1');

      expect(result).toBe(1);
      expect(stpExceptionRequestRepository.delete).toHaveBeenCalled();
    });
  });

  describe('saveRegulatoryFormChargesAndTaxes', () => {
    it('should update when existing config found', async () => {
      const existing = { regulatoryFormChargesAndTaxesId: 'cfg1' } as any;
      regulatoryFormChargesAndTaxesRepository.findOne.mockResolvedValue(
        existing as any,
      );
      regulatoryFormChargesAndTaxesRepository.update.mockResolvedValue(
        undefined as any,
      );

      await service.saveRegulatoryFormChargesAndTaxes({
        regulatoryFormCharges: [],
        regulatoryFormTaxes: [],
      } as any);

      expect(regulatoryFormChargesAndTaxesRepository.update).toHaveBeenCalled();
      expect(
        regulatoryFormChargesAndTaxesRepository.create,
      ).not.toHaveBeenCalled();
    });

    it('should create when no existing config', async () => {
      regulatoryFormChargesAndTaxesRepository.findOne.mockResolvedValue(
        null as any,
      );
      regulatoryFormChargesAndTaxesRepository.create.mockResolvedValue(
        {} as any,
      );

      await service.saveRegulatoryFormChargesAndTaxes({
        regulatoryFormCharges: [],
        regulatoryFormTaxes: [],
      } as any);

      expect(regulatoryFormChargesAndTaxesRepository.create).toHaveBeenCalled();
    });
  });

  describe('getRegulatoryFormChargesAndTaxes', () => {
    it('should return all configs', async () => {
      const configs = [{ regulatoryFormChargesAndTaxesId: 'cfg1' }];
      regulatoryFormChargesAndTaxesRepository.findAll.mockResolvedValue(
        configs as any,
      );

      const result = await service.getRegulatoryFormChargesAndTaxes();

      expect(result).toEqual(configs);
    });
  });

  describe('validateCustomerAccount', () => {
    it('should create STP exception when no TIN on record', async () => {
      const record = { applicationNumber: 'APP1' } as any;
      formMRepository.findOne.mockResolvedValue(record as any);

      await service.validateCustomerAccount(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(stpExceptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationNumber: 'APP1',
          stpExceptionType: expect.any(String),
          stpExceptionReason: expect.stringContaining('no TIN'),
        }),
      );
    });

    it('should create STP exception when TIN has no current NGN account', async () => {
      const record = {
        applicationNumber: 'APP1',
        applicantTINNumber: 'TIN1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      customerManagementService.getCustomerById = jest.fn().mockResolvedValue({
        data: {
          customer_products: [{ productType: 'Savings', currency: 'NGN' }],
        },
      }) as any;

      await service.validateCustomerAccount(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(stpExceptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stpExceptionReason: expect.stringContaining(
            'no Current Customer Account',
          ),
        }),
      );
    });

    it('should update record and enqueue validation when customer account found', async () => {
      const record = {
        applicationNumber: 'APP1',
        applicantTINNumber: 'TIN1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      customerManagementService.getCustomerById = jest.fn().mockResolvedValue({
        data: {
          customer_products: [
            { productType: 'Current', currency: 'NGN', accountNumber: 'ACC1' },
          ],
        },
      }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.validateCustomerAccount(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(formMRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          customerAccount: 'ACC1',
          isCustomerAccountValid: true,
        }),
        expect.any(Object),
      );
      expect(formMValidationQueueAdd).toHaveBeenCalled();
    });
  });

  describe('validateAccountRestriction', () => {
    it('should create STP exception when account has freeze', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      camsService.getAccountDetails = jest
        .fn()
        .mockResolvedValue({ freezeCode: '001' }) as any;

      await service.validateAccountRestriction(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(stpExceptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stpExceptionType: expect.any(String),
          stpExceptionReason: expect.stringContaining('freeze'),
        }),
      );
    });

    it('should create STP exception when freezeCode is 002 (post no debit)', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      camsService.getAccountDetails = jest
        .fn()
        .mockResolvedValue({ freezeCode: '002', lienAmount: 0 }) as any;

      await service.validateAccountRestriction(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(stpExceptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stpExceptionReason: expect.stringContaining('post no debit'),
        }),
      );
    });

    it('should create STP exception when freezeCode is 003 (no post no credit)', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      camsService.getAccountDetails = jest
        .fn()
        .mockResolvedValue({ freezeCode: '003', lienAmount: 0 }) as any;

      await service.validateAccountRestriction(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(stpExceptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stpExceptionReason: expect.stringContaining('no post no credit'),
        }),
      );
    });

    it('should create STP exception when lienAmount > 0', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      camsService.getAccountDetails = jest
        .fn()
        .mockResolvedValue({ freezeCode: null, lienAmount: 100 }) as any;

      await service.validateAccountRestriction(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(stpExceptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stpExceptionReason: expect.stringContaining('lien amount'),
        }),
      );
    });

    it('should update record and enqueue when no restrictions', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      camsService.getAccountDetails = jest
        .fn()
        .mockResolvedValue({ freezeCode: null, lienAmount: 0 }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.validateAccountRestriction(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(formMRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ isAccountRestrictionValid: true }),
        expect.any(Object),
      );
      expect(formMValidationQueueAdd).toHaveBeenCalled();
    });
  });

  describe('validateBalanceEnquiry', () => {
    it('should create STP exception when balance insufficient', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
        totalCAndF: 100,
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          {
            regulatoryFormCharges: [{ chargeId: 'c1' }],
            regulatoryFormTaxes: [],
          },
        ]) as any;
      productManagementService.calculateChargeEntries = jest
        .fn()
        .mockResolvedValue({
          charge_name: 'Fee',
          charge: '100',
          charge_impacted_ledger: { ledger_code: 'L' },
          chargeApplicableTaxLedgerEntries: [],
        }) as any;
      camsService.getAccountDetails = jest
        .fn()
        .mockResolvedValue({ clearedBalance: 10, currencyCode: 'NGN' }) as any;

      await service.validateBalanceEnquiry(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(stpExceptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          stpExceptionType: expect.any(String),
          stpExceptionReason: expect.stringContaining('insufficient balance'),
        }),
      );
    });

    it('should update record and enqueue charges and watchlist when balance sufficient', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
        totalCAndF: 100,
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          { regulatoryFormCharges: [], regulatoryFormTaxes: [] },
        ]) as any;
      camsService.getAccountDetails = jest.fn().mockResolvedValue({
        clearedBalance: 1000,
        currencyCode: 'NGN',
      }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.validateBalanceEnquiry(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(formMRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ isBalanceEnquiryValid: true }),
        expect.any(Object),
      );
      expect(formMChargesQueueAdd).toHaveBeenCalled();
      expect(formMValidationQueueAdd).toHaveBeenCalled();
    });
  });

  describe('validateWatchlistStatus', () => {
    it('should create STP exception and set isWatchlistStatusValid false when watchlisted', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      customerManagementService.getCustomerById = jest.fn().mockResolvedValue({
        data: { customer_profiles: [{ bvn: 'BVN1', email: 'e@e.com' }] },
      }) as any;
      complianceService.isBvnBlackListed = jest.fn().mockResolvedValue({
        responseCode: '302',
        responseMessage: 'Blacklisted',
      }) as any;
      complianceService.isBvnWatchListed = jest
        .fn()
        .mockResolvedValue({ responseCode: '200' }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.validateWatchlistStatus(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(stpExceptionRepository.create).toHaveBeenCalled();
      expect(formMRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ isWatchlistStatusValid: false }),
        expect.any(Object),
      );
    });

    it('should set isWatchlistStatusValid true when not watchlisted', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      customerManagementService.getCustomerById = jest.fn().mockResolvedValue({
        data: { customer_profiles: [{ bvn: 'BVN1', email: 'e@e.com' }] },
      }) as any;
      complianceService.isBvnBlackListed = jest
        .fn()
        .mockResolvedValue({ responseCode: '200' }) as any;
      complianceService.isBvnWatchListed = jest
        .fn()
        .mockResolvedValue({ responseCode: '200' }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.validateWatchlistStatus(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(formMRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ isWatchlistStatusValid: true }),
        expect.any(Object),
      );
    });
  });

  describe('processRegulatoryFormCharge', () => {
    it('should build entries, post to journal and update record', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
        totalCAndF: 100,
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          { regulatoryFormCharges: [], regulatoryFormTaxes: [] },
        ]) as any;
      camsService.postToJournal = jest
        .fn()
        .mockResolvedValue({ value: { transactionId: 'tx1' } }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.processRegulatoryFormCharge(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(camsService.postToJournal).toHaveBeenCalled();
      expect(formMRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isChargeTaken: true,
          chargesAndTaxesTransactionId: 'tx1',
        }),
        expect.any(Object),
      );
    });

    it('should use totalCF for FORM_NXP and update formNXPRepository', async () => {
      const record = {
        applicationNumber: 'NXP1',
        customerAccount: 'ACC1',
        totalCF: 200,
      } as any;
      formNXPRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          { regulatoryFormCharges: [], regulatoryFormTaxes: [] },
        ]) as any;
      camsService.postToJournal = jest
        .fn()
        .mockResolvedValue({ value: { transactionId: 'tx2' } }) as any;
      formNXPRepository.update.mockResolvedValue(undefined as any);

      await service.processRegulatoryFormCharge(
        'NXP1',
        RegulatoryFormTypeEnum.FORM_NXP,
      );

      expect(formNXPRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isChargeTaken: true,
          chargesAndTaxesTransactionId: 'tx2',
        }),
        expect.any(Object),
      );
    });

    it('should throw when charge data is invalid', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
        totalCAndF: 100,
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          {
            regulatoryFormCharges: [{ chargeId: 'c1' }],
            regulatoryFormTaxes: [],
          },
        ]) as any;
      productManagementService.calculateChargeEntries = jest
        .fn()
        .mockResolvedValue(null) as any;

      await expect(
        service.processRegulatoryFormCharge(
          'APP1',
          RegulatoryFormTypeEnum.FORM_M,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when tax data is invalid', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
        totalCAndF: 100,
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          {
            regulatoryFormCharges: [{ chargeId: 'c1' }],
            regulatoryFormTaxes: [{ taxId: 't1' }],
          },
        ]) as any;
      productManagementService.calculateChargeEntries = jest
        .fn()
        .mockResolvedValue({
          charge_name: 'F',
          charge: '10',
          charge_impacted_ledger: { ledger_code: 'L' },
          chargeApplicableTaxLedgerEntries: [],
        }) as any;
      productManagementService.calculateTaxEntries = jest
        .fn()
        .mockResolvedValue(null) as any;

      await expect(
        service.processRegulatoryFormCharge(
          'APP1',
          RegulatoryFormTypeEnum.FORM_M,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include charge applicable tax ledger entries when present', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
        totalCAndF: 100,
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          {
            regulatoryFormCharges: [{ chargeId: 'c1' }],
            regulatoryFormTaxes: [],
          },
        ]) as any;
      productManagementService.calculateChargeEntries = jest
        .fn()
        .mockResolvedValue({
          charge_name: 'F',
          charge: '10',
          charge_impacted_ledger: { ledger_code: 'L' },
          chargeApplicableTaxLedgerEntries: [
            {
              chargeApplicableTaxDebitLedgers: [{ amount: 1, tax_name: 'T1' }],
              chargeApplicableTaxCreditLedgers: [
                { ledger_code: 'LT', amount: 1, tax_name: 'T1' },
              ],
            },
          ],
        }) as any;
      camsService.postToJournal = jest
        .fn()
        .mockResolvedValue({ value: { transactionId: 'tx1' } }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.processRegulatoryFormCharge(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(camsService.postToJournal).toHaveBeenCalledWith(
        expect.anything(),
        'token',
      );
      const body = camsService.postToJournal.mock.calls[0][0];
      expect(body.debitEntries.length).toBeGreaterThan(1);
      expect(body.creditEntries.length).toBeGreaterThan(1);
    });

    it('should handle tax with array tax_impacted_ledgers', async () => {
      const record = {
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
        totalCAndF: 100,
      } as any;
      formMRepository.findOne.mockResolvedValue(record as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          { regulatoryFormCharges: [], regulatoryFormTaxes: [{ taxId: 't1' }] },
        ]) as any;
      productManagementService.calculateTaxEntries = jest
        .fn()
        .mockResolvedValue({
          tax_name: 'VAT',
          tax: 5,
          tax_impacted_ledgers: [{ ledger_code: 'L1' }, { ledger_code: 'L2' }],
        }) as any;
      camsService.postToJournal = jest
        .fn()
        .mockResolvedValue({ value: { transactionId: 'tx1' } }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.processRegulatoryFormCharge(
        'APP1',
        RegulatoryFormTypeEnum.FORM_M,
      );

      expect(camsService.postToJournal).toHaveBeenCalled();
    });
  });

  describe('initiateStpExceptionRequest', () => {
    it('should throw when STP exception already resolved', async () => {
      stpExceptionRepository.findOne.mockResolvedValue({
        isStpExceptionResolved: true,
      } as any);

      await expect(
        service.initiateStpExceptionRequest({
          stpExceptionId: 'stp1',
          stpExceptionResolveType: StpExceptionResolveTypeEnum.RESOLVE,
          userPermissions: [],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when existing request in IN_REVIEW or APPROVED', async () => {
      stpExceptionRepository.findOne.mockResolvedValue(null as any);
      stpExceptionRequestRepository.findOne.mockResolvedValue({
        requestStatus: RequestStatusEnum.IN_REVIEW,
      } as any);

      await expect(
        service.initiateStpExceptionRequest({
          stpExceptionId: 'stp1',
          stpExceptionResolveType: StpExceptionResolveTypeEnum.RESOLVE,
          userPermissions: [],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create request and return without calling handleResolve when userPermissions does not include empty string', async () => {
      stpExceptionRepository.findOne.mockResolvedValue(null as any);
      stpExceptionRequestRepository.findOne.mockResolvedValue(null as any);
      sequelize.query = jest.fn().mockResolvedValue([{ nextval: 1 }]) as any;
      const created = { requestId: 'req1' } as any;
      stpExceptionRequestRepository.create.mockResolvedValue(created as any);
      jest
        .spyOn(service as any, 'handleResolveStpException')
        .mockResolvedValue(undefined);

      const result = await service.initiateStpExceptionRequest({
        stpExceptionId: 'stp1',
        stpExceptionResolveType: StpExceptionResolveTypeEnum.RESOLVE,
        initiator: 'u',
        initiatorId: 'u1',
        initiatorBranchCode: 'br',
        initiatorDepartment: 'd',
        tenantId: 'tn',
        userPermissions: ['other'],
      } as any);

      expect(stpExceptionRequestRepository.create).toHaveBeenCalled();
      expect((service as any).handleResolveStpException).not.toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('should create request and call handleResolve and update when userPermissions includes empty string', async () => {
      stpExceptionRepository.findOne.mockResolvedValue(null as any);
      stpExceptionRequestRepository.findOne.mockResolvedValue(null as any);
      sequelize.query = jest.fn().mockResolvedValue([{ nextval: 1 }]) as any;
      const created = {
        requestId: 'req1',
        stpExceptionResolveType: StpExceptionResolveTypeEnum.EXEMPT,
      } as any;
      stpExceptionRequestRepository.create.mockResolvedValue(created as any);
      jest
        .spyOn(service as any, 'handleResolveStpException')
        .mockResolvedValue(undefined);
      stpExceptionRequestRepository.update.mockResolvedValue(undefined as any);

      const result = await service.initiateStpExceptionRequest({
        stpExceptionId: 'stp1',
        stpExceptionResolveType: StpExceptionResolveTypeEnum.EXEMPT,
        initiator: 'u',
        initiatorId: 'u1',
        initiatorBranchCode: 'br',
        initiatorDepartment: 'd',
        tenantId: 'tn',
        userPermissions: [''],
      } as any);

      expect((service as any).handleResolveStpException).toHaveBeenCalled();
      expect(stpExceptionRequestRepository.update).toHaveBeenCalled();
      expect(result).toEqual(created);
    });
  });

  describe('authorizeStpExceptionRequest', () => {
    it('should throw when request not found', async () => {
      stpExceptionRequestRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.authorizeStpExceptionRequest({
          id: 'req1',
          approvalStatus: ApprovalStatusEnum.APPROVED,
          approver: 'a',
          approverId: 'a1',
          approverBranchCode: 'abr',
          approverDepartment: 'ad',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call handleResolveStpException and update when approved', async () => {
      const req = {
        requestId: 'req1',
        stpException: { stpExceptionId: 'stp1' },
      } as any;
      stpExceptionRequestRepository.findOne
        .mockResolvedValueOnce(req as any)
        .mockResolvedValueOnce({
          ...req,
          approvalStatus: ApprovalStatusEnum.APPROVED,
        } as any);
      jest
        .spyOn(service as any, 'handleResolveStpException')
        .mockResolvedValue(undefined);
      stpExceptionRequestRepository.update.mockResolvedValue(undefined as any);

      const result = await service.authorizeStpExceptionRequest({
        id: 'req1',
        approvalStatus: ApprovalStatusEnum.APPROVED,
        approver: 'a',
        approverId: 'a1',
        approverBranchCode: 'abr',
        approverDepartment: 'ad',
      } as any);

      expect((service as any).handleResolveStpException).toHaveBeenCalled();
      expect(stpExceptionRequestRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          approvalStatus: ApprovalStatusEnum.APPROVED,
          requestStatus: RequestStatusEnum.APPROVED,
        }),
        expect.any(Object),
      );
      expect(result).toBeDefined();
    });

    it('should update with rejected status when rejection', async () => {
      const req = { requestId: 'req1' } as any;
      stpExceptionRequestRepository.findOne
        .mockResolvedValueOnce(req as any)
        .mockResolvedValueOnce({
          ...req,
          approvalStatus: ApprovalStatusEnum.REJECTED,
        } as any);
      stpExceptionRequestRepository.update.mockResolvedValue(undefined as any);

      await service.authorizeStpExceptionRequest({
        id: 'req1',
        approvalStatus: ApprovalStatusEnum.REJECTED,
        approver: 'a',
        approverId: 'a1',
        approverBranchCode: 'abr',
        approverDepartment: 'ad',
        reasonForRejection: 'reason',
      } as any);

      expect(stpExceptionRequestRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          approvalStatus: ApprovalStatusEnum.REJECTED,
          requestStatus: RequestStatusEnum.IN_ISSUE,
          reasonForRejection: 'reason',
        }),
        expect.any(Object),
      );
    });

    it('should call handleResolveStpException RESOLVE path (CUSTOMER_ACCOUNT_VALIDATION) when approved', async () => {
      const req = {
        requestId: 'req1',
        stpExceptionResolveType: StpExceptionResolveTypeEnum.RESOLVE,
        stpException: {
          stpExceptionId: 'stp1',
          applicationNumber: 'APP1',
          regulatoryFormType: RegulatoryFormTypeEnum.FORM_M,
          stpExceptionType: StpExceptionTypeEnum.CUSTOMER_ACCOUNT_VALIDATION,
        },
      } as any;
      stpExceptionRequestRepository.findOne
        .mockResolvedValueOnce(req as any)
        .mockResolvedValueOnce({
          ...req,
          approvalStatus: ApprovalStatusEnum.APPROVED,
        } as any);
      jest
        .spyOn(service as any, 'handleResolveStpException')
        .mockResolvedValue(undefined);
      stpExceptionRequestRepository.update.mockResolvedValue(undefined as any);

      await service.authorizeStpExceptionRequest({
        id: 'req1',
        approvalStatus: ApprovalStatusEnum.APPROVED,
        approver: 'a',
        approverId: 'a1',
        approverBranchCode: 'abr',
        approverDepartment: 'ad',
      } as any);

      expect((service as any).handleResolveStpException).toHaveBeenCalledWith(
        req,
      );
    });

    it('should call handleResolveStpException EXEMPT path and update repository when approved', async () => {
      const req = {
        requestId: 'req1',
        stpExceptionResolveType: StpExceptionResolveTypeEnum.EXEMPT,
        stpException: {
          stpExceptionId: 'stp1',
          applicationNumber: 'APP1',
          regulatoryFormType: RegulatoryFormTypeEnum.FORM_M,
        },
      } as any;
      stpExceptionRequestRepository.findOne
        .mockResolvedValueOnce(req as any)
        .mockResolvedValueOnce({
          ...req,
          approvalStatus: ApprovalStatusEnum.APPROVED,
        } as any);
      stpExceptionRepository.update.mockResolvedValue(undefined as any);
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.authorizeStpExceptionRequest({
        id: 'req1',
        approvalStatus: ApprovalStatusEnum.APPROVED,
        approver: 'a',
        approverId: 'a1',
        approverBranchCode: 'abr',
        approverDepartment: 'ad',
      } as any);

      expect(stpExceptionRepository.update).toHaveBeenCalledWith(
        { isStpExceptionResolved: true },
        expect.objectContaining({ where: { stpExceptionId: 'stp1' } }),
      );
      expect(formMRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isCustomerAccountValid: true,
          isAccountRestrictionValid: true,
          isBalanceEnquiryValid: true,
          isWatchlistStatusValid: true,
        }),
        expect.any(Object),
      );
    });

    it('should call handleResolveStpException RESOLVE and validateCustomerAccount for BALANCE_ENQUIRY type', async () => {
      const req = {
        requestId: 'req1',
        stpExceptionResolveType: StpExceptionResolveTypeEnum.RESOLVE,
        stpException: {
          stpExceptionId: 'stp1',
          applicationNumber: 'APP1',
          regulatoryFormType: RegulatoryFormTypeEnum.FORM_M,
          stpExceptionType: StpExceptionTypeEnum.BALANCE_ENQUIRY,
        },
      } as any;
      stpExceptionRequestRepository.findOne
        .mockResolvedValueOnce(req as any)
        .mockResolvedValueOnce({
          ...req,
          approvalStatus: ApprovalStatusEnum.APPROVED,
        } as any);
      stpExceptionRepository.update.mockResolvedValue(undefined as any);
      formMRepository.findOne.mockResolvedValue({
        applicationNumber: 'APP1',
        customerAccount: 'ACC1',
        totalCAndF: 100,
      } as any);
      authService.getSystemUserToken = jest
        .fn()
        .mockResolvedValue('token') as any;
      regulatoryFormChargesAndTaxesRepository.findAll = jest
        .fn()
        .mockResolvedValue([
          { regulatoryFormCharges: [], regulatoryFormTaxes: [] },
        ]) as any;
      camsService.getAccountDetails = jest.fn().mockResolvedValue({
        clearedBalance: 1000,
        currencyCode: 'NGN',
      }) as any;
      formMRepository.update.mockResolvedValue(undefined as any);

      await service.authorizeStpExceptionRequest({
        id: 'req1',
        approvalStatus: ApprovalStatusEnum.APPROVED,
        approver: 'a',
        approverId: 'a1',
        approverBranchCode: 'abr',
        approverDepartment: 'ad',
      } as any);

      expect(stpExceptionRepository.update).toHaveBeenCalled();
    });
  });
});
