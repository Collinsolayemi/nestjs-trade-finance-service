import { type Mocked, TestBed } from '@suites/unit';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LetterOfCreditService } from './letter-of-credit.service';
import {
  LetterOfCreditRequestRepository,
  LetterOfCreditRepository,
  LetterOfCreditTemplateRepository,
  LetterOfCreditAmendmentRepository,
  LetterOfCreditCancellationRepository,
  LetterOfCreditAdjustmentRepository,
  LetterOfCreditPaymentRepository,
  LetterOfCreditDocumentLodgementRepository,
  LetterOfCreditFreeFormatMessageRepository,
} from './letter-of-credit.repository';
import { RegulatoryFormService } from '../regulatory-form/regulatory-form.service';
import { Sequelize } from 'sequelize-typescript';
import { CamsService } from 'src/services/cams/cams.service';
import { LetterOfCreditProductTypeEnum } from 'src/common/enums';
import {
  ApprovalStatusEnum,
  AuthorizationStatusEnum,
  LetterOfCreditActionTypeEnum,
  RecordsStatusTypeEnum,
  RequestStatusEnum,
  RegulatoryFormStatusEnum,
  ApplicationRulesEnum,
  LetterOfCreditAmountChangeEnum,
  EntryPartyEnum,
  EntryTypeEnum,
  TradeAccountTypeEnum,
  ConfirmationInstructionEnum,
  RequestedConfirmationPartyEnum,
  CreditAvailableWithEnum,
  CreditAvailableByEnum,
  DraweeEnum,
  DraftModeEnum,
  ChargeAmountFieldEnum,
  PostingAmountFieldEnum,
  TradeProductFactoryChargesAndTaxesTypeEnum,
  SwiftMessageJobActionEnum,
  PaymentTransferMethodEnum,
  PaymentActionTypeEnum,
  PermissionEnum,
  LetterOfCreditFreeFormaSwifttMessageTypeEnum,
} from 'src/common/enums';
import { TradeProductFactoryService } from 'src/services/trade-product-factory/trade-product-factory.service';
import { CustomerManagementService } from 'src/services/customer-management/customer-management.service';
import { TreasuryTradeService } from 'src/services/treasury-trade/treasury-trade.service';
import { ProductManagementService } from 'src/services/product-management/product-management.service';
import { CreditLineService } from 'src/modules/credit-line/credit-line.service';

describe('LetterOfCreditService', () => {
  let service: LetterOfCreditService;
  let sequelize: Mocked<Sequelize>;
  let letterOfCreditRequestRepository: Mocked<LetterOfCreditRequestRepository>;
  let letterOfCreditRepository: Mocked<LetterOfCreditRepository>;
  let letterOfCreditTemplateRepository: Mocked<LetterOfCreditTemplateRepository>;
  let regulatoryFormService: Mocked<RegulatoryFormService>;
  let camsService: Mocked<CamsService>;
  let tradeProductFactoryService: Mocked<TradeProductFactoryService>;
  let customerManagementService: Mocked<CustomerManagementService>;
  let treasuryTradeService: Mocked<TreasuryTradeService>;
  let productManagementService: Mocked<ProductManagementService>;
  let creditLineService: Mocked<CreditLineService>;
  let letterOfCreditAmendmentRepository: Mocked<LetterOfCreditAmendmentRepository>;
  let letterOfCreditCancellationRepository: Mocked<LetterOfCreditCancellationRepository>;
  let letterOfCreditAdjustmentRepository: Mocked<LetterOfCreditAdjustmentRepository>;
  let letterOfCreditPaymentRepository: Mocked<LetterOfCreditPaymentRepository>;
  let letterOfCreditDocumentLodgementRepository: Mocked<LetterOfCreditDocumentLodgementRepository>;
  let letterOfCreditFreeFormatRepository: Mocked<LetterOfCreditFreeFormatMessageRepository>;
  let swiftMessageQueueAdd: jest.Mock;
  let letterOfCreditExpiryQueueAdd: jest.Mock;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      LetterOfCreditService,
    ).compile();

    service = unit;
    sequelize = unitRef.get(Sequelize);
    letterOfCreditRequestRepository = unitRef.get(
      LetterOfCreditRequestRepository,
    );
    letterOfCreditRepository = unitRef.get(LetterOfCreditRepository);
    letterOfCreditTemplateRepository = unitRef.get(
      LetterOfCreditTemplateRepository,
    );
    letterOfCreditAmendmentRepository = unitRef.get(
      LetterOfCreditAmendmentRepository,
    );
    letterOfCreditCancellationRepository = unitRef.get(
      LetterOfCreditCancellationRepository,
    );
    letterOfCreditAdjustmentRepository = unitRef.get(
      LetterOfCreditAdjustmentRepository,
    );
    letterOfCreditPaymentRepository = unitRef.get(
      LetterOfCreditPaymentRepository,
    );
    letterOfCreditDocumentLodgementRepository = unitRef.get(
      LetterOfCreditDocumentLodgementRepository,
    );
    letterOfCreditFreeFormatRepository = unitRef.get(
      LetterOfCreditFreeFormatMessageRepository,
    );
    regulatoryFormService = unitRef.get(RegulatoryFormService);
    camsService = unitRef.get(CamsService);
    tradeProductFactoryService = unitRef.get(TradeProductFactoryService);
    customerManagementService = unitRef.get(CustomerManagementService);
    treasuryTradeService = unitRef.get(TreasuryTradeService);
    productManagementService = unitRef.get(ProductManagementService);
    creditLineService = unitRef.get(CreditLineService);

    swiftMessageQueueAdd = jest.fn().mockResolvedValue(undefined);
    letterOfCreditExpiryQueueAdd = jest.fn().mockResolvedValue(undefined);
    (service as any).swiftMessageQueue = { add: swiftMessageQueueAdd };
    (service as any).letterOfCreditExpiryQueue = {
      add: letterOfCreditExpiryQueueAdd,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('generateReferenceNumber', () => {
    it('should return IMPORT reference format when product type is IMPORT', async () => {
      sequelize.query.mockResolvedValue([{ nextval: 42 }] as any);

      const result = await service.generateReferenceNumber(
        LetterOfCreditProductTypeEnum.IMPORT,
      );

      expect(result).toMatch(/^SB\/ILC\d{2}0042$/);
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('reference_number_seq'),
        expect.any(Object),
      );
    });

    it('should return EXPORT reference format when product type is EXPORT', async () => {
      sequelize.query.mockResolvedValue([{ nextval: 100 }] as any);

      const result = await service.generateReferenceNumber(
        LetterOfCreditProductTypeEnum.EXPORT,
      );

      expect(result).toMatch(/^SB\/ELC\d{2}0100$/);
    });
  });

  describe('generatePreAdvicereferenceNumber', () => {
    it('should return pre-advice reference with ILC prefix', async () => {
      sequelize.query.mockResolvedValue([{ nextval: 5 }] as any);

      const result = await service.generatePreAdvicereferenceNumber();

      expect(result).toMatch(/^SB\/ILC\d{2}0005CULC$/);
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('pre_advice_reference_number_seq'),
        expect.any(Object),
      );
    });
  });

  describe('calculateTotalChargesAndTaxes', () => {
    it('should return zeros when no chargesAndTaxes entry for type', async () => {
      const tradeProductData = {
        chargesAndTaxes: [
          { type: 'OTHER_TYPE', applicableCharges: [], applicableTaxes: [] },
        ],
      };

      const result = await service.calculateTotalChargesAndTaxes(
        tradeProductData as any,
        'ISSUANCE' as any,
      );

      expect(result).toEqual({ totalCharges: 0, totalTaxes: 0, grandTotal: 0 });
    });

    it('should sum charges and taxes when entry exists', async () => {
      const tradeProductData = {
        chargesAndTaxes: [
          {
            type: 'ISSUANCE',
            applicableCharges: [{ chargeAmount: 10 }, { chargeAmount: 20 }],
            applicableTaxes: [{ taxAmount: 5 }, { taxAmount: 15 }],
          },
        ],
      };

      const result = await service.calculateTotalChargesAndTaxes(
        tradeProductData as any,
        'ISSUANCE' as any,
      );

      expect(result).toEqual({
        totalCharges: 30,
        totalTaxes: 20,
        grandTotal: 50,
      });
    });
  });

  describe('saveLetterOfCreditAsDraft', () => {
    it('should throw when isDraft but no existing request', async () => {
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.saveLetterOfCreditAsDraft({
          isDraft: true,
          applicationNumber: 'APP1',
          requestId: 'req1',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update and return request when isDraft and existing request', async () => {
      const existing = { requestId: 'req1', applicationNumber: 'APP1' };
      const updated = { ...existing, requestStatus: RequestStatusEnum.DRAFT };
      letterOfCreditRequestRepository.findOne.mockResolvedValue(
        existing as any,
      );
      letterOfCreditRequestRepository.update.mockResolvedValue([
        1,
        [updated],
      ] as any);

      const result = await service.saveLetterOfCreditAsDraft({
        isDraft: true,
        applicationNumber: 'APP1',
        requestId: 'req1',
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
        initiator: 'u',
        initiatorId: 'id',
        initiatorBranchCode: 'br',
        initiatorDepartment: 'dept',
        tenantId: 't',
      } as any);

      expect(result).toEqual(updated);
      expect(letterOfCreditRequestRepository.update).toHaveBeenCalled();
    });

    it('should create new request when not isDraft', async () => {
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);
      const created = {
        requestId: 'req2',
        requestStatus: RequestStatusEnum.DRAFT,
      };
      letterOfCreditRequestRepository.create.mockResolvedValue(created as any);

      const result = await service.saveLetterOfCreditAsDraft({
        isDraft: false,
        applicationNumber: 'APP2',
        requestId: undefined,
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
        initiator: 'u',
        initiatorId: 'id',
        initiatorBranchCode: 'br',
        initiatorDepartment: 'dept',
        tenantId: 't',
      } as any);

      expect(letterOfCreditRequestRepository.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });
  });

  describe('getLetterOfCreditRecordByReferenceNumber', () => {
    it('should throw when record not found', async () => {
      letterOfCreditRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getLetterOfCreditRecordByReferenceNumber('REF999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return record when found', async () => {
      const lc = { referenceNumber: 'REF1', applicantName: 'A' };
      letterOfCreditRepository.findOne.mockResolvedValue(lc as any);

      const result =
        await service.getLetterOfCreditRecordByReferenceNumber('REF1');

      expect(result).toEqual(lc);
      expect(letterOfCreditRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { referenceNumber: 'REF1' } }),
      );
    });
  });

  describe('validateRegulatoryFormForLetterOfCreditRequestInitiation', () => {
    it('should throw when regulatory form not found', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue(
        null as any,
      );

      await expect(
        service.validateRegulatoryFormForLetterOfCreditRequestInitiation(
          'APP1',
          LetterOfCreditProductTypeEnum.IMPORT,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return isValid true when no existing LC request', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        applicationNumber: 'APP1',
      } as any);
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);

      const result =
        await service.validateRegulatoryFormForLetterOfCreditRequestInitiation(
          'APP1',
          LetterOfCreditProductTypeEnum.IMPORT,
        );

      expect(result.isValid).toBe(true);
      expect(result.regulatoryForm).toBeDefined();
    });

    it('should return isValid false when existing LC request exists', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        applicationNumber: 'APP1',
      } as any);
      letterOfCreditRequestRepository.findOne.mockResolvedValue({
        requestId: 'req1',
      } as any);

      const result =
        await service.validateRegulatoryFormForLetterOfCreditRequestInitiation(
          'APP1',
          LetterOfCreditProductTypeEnum.IMPORT,
        );

      expect(result.isValid).toBe(false);
    });
  });

  describe('getRecordsStatusCount', () => {
    it('should throw for invalid recordScope', async () => {
      await expect(
        service.getRecordsStatusCount(
          'user1',
          'branch1',
          RecordsStatusTypeEnum.INITIATOR_VIEW,
          'invalid' as AuthorizationStatusEnum,
          RequestStatusEnum.DRAFT,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return status counts for CREATED_BY_ME scope', async () => {
      const repo = letterOfCreditRequestRepository as any;
      repo.scope = jest.fn().mockReturnValue({
        findAll: jest.fn().mockResolvedValue([
          { status: 'Draft', count: '5' },
          { status: 'In-Review', count: '3' },
        ]),
      });

      const result = await service.getRecordsStatusCount(
        'user1',
        'branch1',
        RecordsStatusTypeEnum.INITIATOR_VIEW,
        AuthorizationStatusEnum.CREATED_BY_ME,
        RequestStatusEnum.DRAFT,
      );

      expect(result).toEqual(
        expect.arrayContaining([
          { status: 'Draft', count: 5 },
          { status: 'In-Review', count: 3 },
        ]),
      );
    });
  });

  describe('getLetterOfCreditByRequestId', () => {
    it('should throw when request not found', async () => {
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);
      letterOfCreditRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getLetterOfCreditByRequestId('req999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return request when isRecord false', async () => {
      const req = { requestId: 'req1' };
      letterOfCreditRequestRepository.findOne.mockResolvedValue(req as any);

      const result = await service.getLetterOfCreditByRequestId('req1', false);

      expect(result).toEqual(req);
    });

    it('should return LC record when isRecord true', async () => {
      const lc = { requestId: 'req1', referenceNumber: 'LC1' };
      letterOfCreditRepository.findOne.mockResolvedValue(lc as any);

      const result = await service.getLetterOfCreditByRequestId('req1', true);

      expect(result).toEqual(lc);
    });
  });

  describe('withdraw', () => {
    it('should throw when no matching request', async () => {
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);

      await expect(service.withdraw('req1', 'initiator1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update and return request when found', async () => {
      const req = { requestId: 'req1' };
      letterOfCreditRequestRepository.findOne
        .mockResolvedValueOnce(req as any)
        .mockResolvedValueOnce({
          ...req,
          requestStatus: RequestStatusEnum.DRAFT,
        } as any);
      letterOfCreditRequestRepository.update.mockResolvedValue(
        undefined as any,
      );

      const result = await service.withdraw('req1', 'initiator1');

      expect(letterOfCreditRequestRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should throw when no matching request', async () => {
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);

      await expect(service.delete('req1', 'initiator1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete and return count when found', async () => {
      const req = { requestId: 'req1' };
      letterOfCreditRequestRepository.findOne.mockResolvedValue(req as any);
      letterOfCreditRequestRepository.delete.mockResolvedValue(1 as any);

      const result = await service.delete('req1', 'initiator1');

      expect(result).toBe(1);
      expect(letterOfCreditRequestRepository.delete).toHaveBeenCalled();
    });
  });

  describe('searchLetterOfCreditTemplateRecords', () => {
    it('should return templates with optional templateName filter', async () => {
      const templates = [{ templateId: 't1', templateName: 'Template A' }];
      letterOfCreditTemplateRepository.findAll.mockResolvedValue(
        templates as any,
      );

      const result = await service.searchLetterOfCreditTemplateRecords({
        templateName: 'A',
      } as any);

      expect(result).toEqual(templates);
    });
  });

  describe('getLetterOfCreditTemplateRecordByTemplateId', () => {
    it('should throw when template not found', async () => {
      letterOfCreditTemplateRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getLetterOfCreditTemplateRecordByTemplateId('t999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return template when found', async () => {
      const t = { templateId: 't1', templateName: 'T1' };
      letterOfCreditTemplateRepository.findOne.mockResolvedValue(t as any);

      const result =
        await service.getLetterOfCreditTemplateRecordByTemplateId('t1');

      expect(result).toEqual(t);
    });
  });

  describe('getLetterOfCreditByRegulatoryFormNumber', () => {
    it('should throw when LC not found', async () => {
      letterOfCreditRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.getLetterOfCreditByRegulatoryFormNumber('FORM999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return LC when found', async () => {
      const lc = { applicationNumber: 'FORM1', referenceNumber: 'LC1' };
      letterOfCreditRepository.findOne.mockResolvedValue(lc as any);

      const result =
        await service.getLetterOfCreditByRegulatoryFormNumber('FORM1');

      expect(result).toEqual(lc);
    });
  });

  describe('validateLetterOfCredit', () => {
    it('should throw when regulatory form not found', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue(
        null as any,
      );

      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when LC amount exceeds 110% of form amount', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        totalCAndF: 100,
      } as any);
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 0 });
      camsService.getAccountDetails.mockResolvedValue({
        availableBalance: 1000,
      } as any);

      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 200,
            applicantAccount: 'acc',
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when applicant account not found', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        totalCAndF: 1000,
      } as any);
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 10 });
      camsService.getAccountDetails.mockResolvedValue(null as any);

      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when grandTotal exceeds available balance', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        totalCAndF: 1000,
      } as any);
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 100 });
      camsService.getAccountDetails.mockResolvedValue({
        availableBalance: 50,
      } as any);

      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return regulatory form when valid', async () => {
      const form = { totalCAndF: 1000 };
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue(
        form as any,
      );
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 10 });
      camsService.getAccountDetails.mockResolvedValue({
        availableBalance: 100,
      } as any);

      const result = await service.validateLetterOfCredit(
        {
          applicationNumber: 'APP1',
          letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
          lcAmount: 100,
          applicantAccount: 'acc',
        } as any,
        {} as any,
      );

      expect(result).toBe(form);
    });

    const baseFormAndBalance = () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        totalCAndF: 1000,
      } as any);
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 10 });
      camsService.getAccountDetails.mockResolvedValue({
        availableBalance: 100,
      } as any);
    };

    it('should throw when confirmation CONFIRM/MAY_ADD but confirmationAmount missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            confirmationInstruction: ConfirmationInstructionEnum.CONFIRM,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when confirmation CONFIRM/MAY_ADD but requestedConfirmationParty missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            confirmationInstruction: ConfirmationInstructionEnum.CONFIRM,
            confirmationAmount: 500,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when requestedConfirmationParty NAMED_BANK but requestedConfirmationBankBicCode missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            confirmationInstruction: ConfirmationInstructionEnum.CONFIRM,
            confirmationAmount: 500,
            requestedConfirmationParty:
              RequestedConfirmationPartyEnum.NAMED_BANK,
            requestedConfirmationBankName:
              RequestedConfirmationPartyEnum.NAMED_BANK,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when creditAvailableWith NAMED_BANK but creditAvailableWithBankSwiftCode missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            creditAvailableWith: CreditAvailableWithEnum.NAMED_BANK,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when creditAvailableBy BY_NEGOTIATION but paymentDate missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            creditAvailableBy: CreditAvailableByEnum.BY_NEGOTIATION,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when creditAvailableBy BY_MIXED_PAYMENT but mixedPaymentDetails missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            creditAvailableBy: CreditAvailableByEnum.BY_MIXED_PAYMENT,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when draftDrawn and drawee NAMED_BANK but draweeBankBicCode missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            draftDrawn: true,
            drawee: DraweeEnum.NAMED_BANK,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when draftMode TENOR but tenorPeriod missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            draftDrawn: true,
            draftMode: DraftModeEnum.TENOR,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when draftMode MATURITY but maturityDate missing', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            draftDrawn: true,
            draftMode: DraftModeEnum.MATURITY,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when preNegotiation and creditLine but preNegotiationAmount exceeds confirmationLineAmount', async () => {
      baseFormAndBalance();
      creditLineService.findByAny.mockResolvedValue({
        confirmationLineAmount: 100,
      } as any);
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            preNegotiation: true,
            creditLine: 'cl1',
            preNegotiationAmount: 200,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when preNegotiationAmount > 0 without preNegotiation and creditLine', async () => {
      baseFormAndBalance();
      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            preNegotiationAmount: 50,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLetterOfCreditRecords', () => {
    it('should throw for invalid recordScope', async () => {
      await expect(
        service.getLetterOfCreditRecords({
          id: 'u',
          branch: 'b',
          recordScope: 'invalid' as AuthorizationStatusEnum,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return paginated records for valid scope', async () => {
      letterOfCreditRepository.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [{ referenceNumber: 'LC1' }, { referenceNumber: 'LC2' }],
      } as any);

      const result = await service.getLetterOfCreditRecords({
        id: 'u',
        branch: 'b',
        page: 1,
        size: 10,
        recordScope: AuthorizationStatusEnum.CREATED_SYSTEM_WIDE,
      } as any);

      expect(result.totalRecords).toBe(2);
      expect(result.letterOfCreditRecords).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getLetterOfCreditRequests', () => {
    it('should throw for invalid recordScope', async () => {
      await expect(
        service.getLetterOfCreditRequests({
          id: 'u',
          branch: 'b',
          recordScope: 'invalid' as AuthorizationStatusEnum,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return paginated requests for valid scope', async () => {
      letterOfCreditRequestRepository.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ requestId: 'req1' }],
      } as any);

      const result = await service.getLetterOfCreditRequests({
        id: 'u',
        branch: 'b',
        page: 1,
        size: 10,
        recordScope: AuthorizationStatusEnum.CREATED_BY_ME,
      } as any);

      expect(result.totalRecords).toBe(1);
      expect(result.letterOfCreditRecords).toHaveLength(1);
    });
  });

  describe('searchLetterOfCreditTemplateRecords', () => {
    it('should return all templates when no templateName', async () => {
      const templates = [{ templateId: 't1' }, { templateId: 't2' }];
      letterOfCreditTemplateRepository.findAll.mockResolvedValue(
        templates as any,
      );

      const result = await service.searchLetterOfCreditTemplateRecords(
        {} as any,
      );

      expect(result).toEqual(templates);
    });
  });

  describe('amend', () => {
    it('should throw NotFoundException when letter of credit not found', async () => {
      letterOfCreditRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.amend({
          lcReferenceNumber: 'LC999',
          requestId: 'req1',
          applicationNumber: 'APP1',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('adjust', () => {
    it('should throw NotFoundException when letter of credit not found', async () => {
      letterOfCreditRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.adjust({
          lcReferenceNumber: 'LC999',
          requestId: 'req1',
          applicationNumber: 'APP1',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should throw BadRequestException when existing cancellation request exists', async () => {
      letterOfCreditRequestRepository.findOne.mockResolvedValue({
        requestId: 'req1',
      } as any);

      await expect(
        service.cancel({
          lcReferenceNumber: 'LC1',
          requestId: 'req1',
          cancellationReason: 'reason',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when letter of credit not found', async () => {
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);
      letterOfCreditRepository.findOne.mockResolvedValue(null as any);

      await expect(
        service.cancel({
          lcReferenceNumber: 'LC999',
          requestId: 'req1',
          cancellationReason: 'reason',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('handlePostingEntries', () => {
    it('should return debit and credit entries for LC_AMOUNT posting', async () => {
      const data = { lcAmount: 1000, lcCurrencyCode: 'USD' } as any;
      const postingEntries = [
        {
          postingAmountField: PostingAmountFieldEnum.LC_AMOUNT,
          debitEntryParty: EntryPartyEnum.APPLICANT,
          debitEntryAccountType: TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          creditEntryParty: EntryPartyEnum.BENEFICIARY,
          creditEntryAccountType: TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          debitPostingName: 'Debit',
          creditPostingName: 'Credit',
        },
      ] as any[];
      jest
        .spyOn(service as any, 'handleAccountNumberRetrieval')
        .mockResolvedValueOnce('acc1')
        .mockResolvedValueOnce('acc2');

      const result = await service.handlePostingEntries({
        data,
        postingEntries,
        token: 'token',
      });

      expect(result.debitEntries).toHaveLength(1);
      expect(result.debitEntries[0]).toEqual({
        debitAccountNumber: 'acc1',
        debitAmount: 1000,
        debitNarration: 'Debit',
      });
      expect(result.creditEntries).toHaveLength(1);
      expect(result.creditEntries[0]).toEqual({
        creditAccountNumber: 'acc2',
        creditAmount: 1000,
        creditNarration: 'Credit',
      });
    });

    it('should throw when amount not specified for posting field', async () => {
      const data = { lcCurrencyCode: 'USD' } as any;
      const postingEntries = [
        {
          postingAmountField: PostingAmountFieldEnum.LC_AMOUNT,
          debitEntryParty: EntryPartyEnum.APPLICANT,
          debitEntryAccountType: TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          creditEntryParty: EntryPartyEnum.BENEFICIARY,
          creditEntryAccountType: TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          debitPostingName: 'D',
          creditPostingName: 'C',
        },
      ] as any[];

      await expect(
        service.handlePostingEntries({
          data,
          postingEntries,
          token: 'token',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use CONFIRMATION_AMOUNT when postingAmountField is CONFIRMATION_AMOUNT', async () => {
      const data = {
        confirmationAmount: 500,
        confirmationAmountCurrency: 'EUR',
      } as any;
      const postingEntries = [
        {
          postingAmountField: PostingAmountFieldEnum.CONFIRMATION_AMOUNT,
          debitEntryParty: EntryPartyEnum.APPLICANT,
          debitEntryAccountType: TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          creditEntryParty: EntryPartyEnum.BENEFICIARY,
          creditEntryAccountType: TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          debitPostingName: 'D',
          creditPostingName: 'C',
        },
      ] as any[];
      jest
        .spyOn(service as any, 'handleAccountNumberRetrieval')
        .mockResolvedValueOnce('d1')
        .mockResolvedValueOnce('c1');

      const result = await service.handlePostingEntries({
        data,
        postingEntries,
        token: 'token',
      });

      expect(result.debitEntries[0].debitAmount).toBe(500);
      expect(result.creditEntries[0].creditAmount).toBe(500);
    });
  });

  describe('handleChargesAndTaxes', () => {
    it('should return debit and credit entries for one charge and one tax', async () => {
      productManagementService.calculateChargeEntries.mockResolvedValue({
        charge_name: 'Fee',
        charge: '10',
        charge_impacted_ledger: { ledger_code: 'L1' },
        chargeApplicableTaxLedgerEntries: [],
      } as any);
      productManagementService.calculateTaxEntries.mockResolvedValue({
        tax_name: 'VAT',
        tax: 5,
        tax_impacted_ledgers: { ledger_code: 'L2' },
      } as any);

      const result = await service.handleChargesAndTaxes({
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        debitAccount: 'debitAcc',
        currencyShortCode: 'NGN',
        lcChargesAndTaxes: {
          applicableCharges: [{ id: 'ch1' }] as any[],
          applicableTaxes: [{ id: 'tx1' }] as any[],
        } as any,
        data: { localCcyEquivalent: 1000 } as any,
        token: 'token',
      });

      expect(result.debitEntries.length).toBeGreaterThanOrEqual(1);
      expect(result.creditEntries.length).toBeGreaterThanOrEqual(1);
      expect(
        productManagementService.calculateChargeEntries,
      ).toHaveBeenCalled();
      expect(productManagementService.calculateTaxEntries).toHaveBeenCalled();
    });

    it('should throw when charge data is invalid', async () => {
      productManagementService.calculateChargeEntries.mockResolvedValue(
        null as any,
      );

      await expect(
        service.handleChargesAndTaxes({
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
          debitAccount: 'debitAcc',
          currencyShortCode: 'NGN',
          lcChargesAndTaxes: {
            applicableCharges: [{ id: 'ch1' }] as any[],
            applicableTaxes: [],
          } as any,
          data: { localCcyEquivalent: 1000 } as any,
          token: 'token',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when tax data is invalid', async () => {
      productManagementService.calculateChargeEntries.mockResolvedValue({
        charge_name: 'F',
        charge: '1',
        charge_impacted_ledger: { ledger_code: 'L' },
        chargeApplicableTaxLedgerEntries: [],
      } as any);
      productManagementService.calculateTaxEntries.mockResolvedValue(
        null as any,
      );

      await expect(
        service.handleChargesAndTaxes({
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
          debitAccount: 'debitAcc',
          currencyShortCode: 'NGN',
          lcChargesAndTaxes: {
            applicableCharges: [{ id: 'ch1' }] as any[],
            applicableTaxes: [{ id: 'tx1' }] as any[],
          } as any,
          data: { localCcyEquivalent: 1000 } as any,
          token: 'token',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use chargeAmountField CONFIRMATION_AMOUNT when set', async () => {
      productManagementService.calculateChargeEntries.mockResolvedValue({
        charge_name: 'F',
        charge: '2',
        charge_impacted_ledger: { ledger_code: 'L' },
        chargeApplicableTaxLedgerEntries: [],
      } as any);

      await service.handleChargesAndTaxes({
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        debitAccount: 'debitAcc',
        currencyShortCode: 'NGN',
        lcChargesAndTaxes: {
          applicableCharges: [
            {
              id: 'ch1',
              chargeAmountField: ChargeAmountFieldEnum.CONFIRMATION_AMOUNT,
            },
          ] as any[],
          applicableTaxes: [],
        } as any,
        data: { localCcyEquivalent: 100, confirmationAmount: 200 } as any,
        token: 'token',
      });

      expect(
        productManagementService.calculateChargeEntries,
      ).toHaveBeenCalledWith('ch1', 200, 'NGN', 'token', 'debitAcc');
    });

    it('should push charge applicable tax debit and credit ledgers when present', async () => {
      productManagementService.calculateChargeEntries.mockResolvedValue({
        charge_name: 'F',
        charge: '1',
        charge_impacted_ledger: { ledger_code: 'L' },
        chargeApplicableTaxLedgerEntries: [
          {
            chargeApplicableTaxDebitLedgers: [{ amount: 0.5, tax_name: 'T1' }],
            chargeApplicableTaxCreditLedgers: [
              { ledger_code: 'LT', amount: 0.5, tax_name: 'T1' },
            ],
          },
        ],
      } as any);

      const result = await service.handleChargesAndTaxes({
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        debitAccount: 'debitAcc',
        currencyShortCode: 'NGN',
        lcChargesAndTaxes: {
          applicableCharges: [{ id: 'ch1' }] as any[],
          applicableTaxes: [],
        } as any,
        data: { localCcyEquivalent: 100 } as any,
        token: 'token',
      });

      expect(
        result.debitEntries.some((e: any) => e.debitNarration === 'T1'),
      ).toBe(true);
      expect(
        result.creditEntries.some((e: any) => e.creditNarration === 'T1'),
      ).toBe(true);
    });
  });

  describe('handleApproval', () => {
    it('should create letter of credit when data provided and actionType PRE_ISSUANCE', async () => {
      const data = {
        lcReferenceNumber: 'LC1',
        applicationNumber: 'APP1',
      } as any;
      letterOfCreditRepository.create.mockResolvedValue({
        referenceNumber: 'LC1',
      } as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.PRE_ISSUANCE,
        requestId: 'req1',
        token: 't',
        data,
      });

      expect(letterOfCreditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...data,
          referenceNumber: 'LC1',
          requestId: 'req1',
        }),
      );
    });

    it('should load data from request metadata when data not provided and actionType ISSUANCE', async () => {
      const metadata = {
        lcReferenceNumber: 'LC2',
        applicationNumber: 'APP2',
      } as any;
      letterOfCreditRequestRepository.findOne.mockResolvedValue({
        metadata,
      } as any);
      sequelize.query.mockResolvedValue([{ nextval: 1 }] as any);
      letterOfCreditRepository.create.mockResolvedValue({
        referenceNumber: 'LC2',
      } as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        requestId: 'req1',
        approverId: 'ap',
        initiatorBranch: 'br',
        initiatorId: 'in',
        approverBranch: 'abr',
        token: 't',
      });

      expect(letterOfCreditRequestRepository.findOne).toHaveBeenCalledWith({
        where: {
          requestId: 'req1',
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });
      expect(letterOfCreditRepository.create).toHaveBeenCalled();
    });

    it('should load data from amendment repository when data not provided and actionType AMENDMENT', async () => {
      const amendmentData = {
        requestId: 'req1',
        lcReferenceNumber: 'LC3',
      } as any;
      letterOfCreditAmendmentRepository.findOne.mockResolvedValue(
        amendmentData as any,
      );
      letterOfCreditRepository.findOne.mockResolvedValue({
        lcCurrencyCode: 'USD',
      } as any);
      letterOfCreditRepository.update.mockResolvedValue(undefined as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.AMENDMENT,
        requestId: 'req1',
        data: undefined,
      });

      expect(letterOfCreditAmendmentRepository.findOne).toHaveBeenCalledWith({
        where: { requestId: 'req1' },
      });
      expect(letterOfCreditRepository.update).toHaveBeenCalled();
    });

    it('should load data from cancellation repository and call bulkReverseJournalPosting when actionType CANCELLATION', async () => {
      const cancellationData = {
        requestId: 'req1',
        lcReferenceNumber: 'LC4',
        applicantAccount: 'acc',
      } as any;
      const postingEntryTransactionArray = [
        {
          isReversed: false,
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
          transactionId: 'tx1',
        },
      ];
      letterOfCreditCancellationRepository.findOne.mockResolvedValue(
        cancellationData as any,
      );
      letterOfCreditRepository.findOne
        .mockResolvedValueOnce({ lcCurrencyCode: 'USD' } as any)
        .mockResolvedValueOnce({
          lcCurrencyCode: 'USD',
          postingEntryTransactionArray,
        } as any);
      camsService.bulkReverseJournalPosting.mockResolvedValue({
        value: { transactionId: 'rev1' },
      } as any);
      letterOfCreditRepository.update.mockResolvedValue(undefined as any);
      jest
        .spyOn(service as any, 'handleDebitAndCreditEntries')
        .mockResolvedValue({
          chargesAndTaxesCreditEntries: [],
          chargesAndTaxesDebitEntries: [],
          postingEntryCreditEntries: [],
          postingEntryDebitEntries: [],
        });

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.CANCELLATION,
        requestId: 'req1',
        approverId: 'ap',
        data: undefined,
        chargeType: TradeProductFactoryChargesAndTaxesTypeEnum.CANCELLATION,
        tradeProductData: {
          chargesAndTaxes: [
            { type: TradeProductFactoryChargesAndTaxesTypeEnum.CANCELLATION },
          ],
          accountingEntries: [
            {
              type: TradeProductFactoryChargesAndTaxesTypeEnum.CANCELLATION,
              postingEntries: [],
            },
          ],
          localCurrency: 'NGN',
        },
        currencyShortCode: 'USD',
        token: 't',
      });

      expect(letterOfCreditCancellationRepository.findOne).toHaveBeenCalledWith(
        { where: { requestId: 'req1' } },
      );
      expect(camsService.bulkReverseJournalPosting).toHaveBeenCalled();
      expect(letterOfCreditRepository.update).toHaveBeenCalled();
    });

    it('should load data from adjustment repository when data not provided and actionType ADJUSTMENT', async () => {
      const adjustmentData = {
        requestId: 'req1',
        lcReferenceNumber: 'LC5',
        lcAmount: 1000,
      } as any;
      letterOfCreditAdjustmentRepository.findOne.mockResolvedValue(
        adjustmentData as any,
      );
      letterOfCreditRepository.findOne.mockResolvedValue({
        lcCurrencyCode: 'USD',
      } as any);
      letterOfCreditRepository.update.mockResolvedValue(undefined as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.ADJUSTMENT,
        requestId: 'req1',
        data: undefined,
      });

      expect(letterOfCreditAdjustmentRepository.findOne).toHaveBeenCalledWith({
        where: { requestId: 'req1' },
      });
      expect(letterOfCreditRepository.update).toHaveBeenCalled();
    });

    it('should load data from payment repository and add SWIFT jobs when actionType PAYMENT and paymentTransferMethod SWIFT', async () => {
      const paymentData = {
        requestId: 'req1',
        lcReferenceNumber: 'LC6',
        applicantAccount: 'acc',
        paymentTransferMethod: PaymentTransferMethodEnum.SWIFT,
        paymentActionType: PaymentActionTypeEnum.PAY,
      } as any;
      letterOfCreditPaymentRepository.findOne.mockResolvedValue(
        paymentData as any,
      );
      letterOfCreditRepository.findOne.mockResolvedValue({
        lcCurrencyCode: 'USD',
      } as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.PAYMENT,
        requestId: 'req1',
        data: undefined,
      });

      expect(letterOfCreditPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { requestId: 'req1' },
      });
      expect(swiftMessageQueueAdd).toHaveBeenCalledWith(
        SwiftMessageJobActionEnum.GENERATE_MT_752_AND_UPLOAD,
        paymentData,
      );
      expect(swiftMessageQueueAdd).toHaveBeenCalledWith(
        SwiftMessageJobActionEnum.GENERATE_MT_202_AND_UPLOAD,
        paymentData,
      );
    });

    it('should load data from document lodgement repository when data not provided and actionType DOCUMENT_LODGEMENT', async () => {
      const docData = {
        requestId: 'req1',
        lcReferenceNumber: 'LC7',
        applicantAccount: 'acc',
      } as any;
      letterOfCreditDocumentLodgementRepository.findOne.mockResolvedValue(
        docData as any,
      );
      letterOfCreditRepository.findOne.mockResolvedValue({
        lcCurrencyCode: 'USD',
      } as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.DOCUMENT_LODGEMENT,
        requestId: 'req1',
        data: undefined,
      });

      expect(
        letterOfCreditDocumentLodgementRepository.findOne,
      ).toHaveBeenCalledWith({ where: { requestId: 'req1' } });
    });

    it('should load data from free format repository and add MT799 job when actionType FREE_FORMAT', async () => {
      const freeFormatData = {
        requestId: 'req1',
        lcReferenceNumber: 'LC8',
        applicantAccount: 'acc',
        swiftMessageType: LetterOfCreditFreeFormaSwifttMessageTypeEnum.MT_799,
      } as any;
      letterOfCreditFreeFormatRepository.findOne.mockResolvedValue(
        freeFormatData as any,
      );
      letterOfCreditRepository.findOne.mockResolvedValue({
        lcCurrencyCode: 'USD',
      } as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.FREE_FORMAT,
        requestId: 'req1',
        data: undefined,
      });

      expect(letterOfCreditFreeFormatRepository.findOne).toHaveBeenCalledWith({
        where: { requestId: 'req1' },
      });
      expect(swiftMessageQueueAdd).toHaveBeenCalledWith(
        SwiftMessageJobActionEnum.GENERATE_MT_799_AND_UPLOAD,
        freeFormatData,
      );
    });

    it('should create LC and add MT700 and expiry queue when data provided and actionType ISSUANCE', async () => {
      const data = {
        lcReferenceNumber: 'LC9',
        applicationNumber: 'APP1',
        letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
        expiryDate: '2026-12-31',
      } as any;
      letterOfCreditRepository.create.mockResolvedValue({
        referenceNumber: 'LC9',
        ...data,
      } as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        requestId: 'req1',
        token: 't',
        data,
      });

      expect(letterOfCreditRepository.create).toHaveBeenCalled();
      expect(swiftMessageQueueAdd).toHaveBeenCalledWith(
        SwiftMessageJobActionEnum.GENERATE_MT_700_AND_UPLOAD,
        expect.any(Object),
      );
      expect(letterOfCreditExpiryQueueAdd).toHaveBeenCalledWith(
        'LC9',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should add MT202 and create template when ISSUANCE data has beneficiaryInstituitionAccount and saveAsTemplate', async () => {
      const data = {
        lcReferenceNumber: 'LC10',
        applicationNumber: 'APP1',
        letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
        expiryDate: '2026-12-31',
        beneficiaryInstituitionAccount: 'BENACC',
        saveAsTemplate: true,
        templateName: 'My Template',
        applicantName: 'Applicant',
      } as any;
      letterOfCreditRepository.create.mockResolvedValue({
        referenceNumber: 'LC10',
        ...data,
      } as any);
      letterOfCreditTemplateRepository.create.mockResolvedValue({} as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        requestId: 'req1',
        token: 't',
        data,
      });

      expect(swiftMessageQueueAdd).toHaveBeenCalledWith(
        SwiftMessageJobActionEnum.GENERATE_MT_202_AND_UPLOAD,
        expect.any(Object),
        { delay: 5000 },
      );
      expect(letterOfCreditTemplateRepository.create).toHaveBeenCalled();
    });

    it('should create LC and add MT730 when data provided and actionType ADVISEMENT', async () => {
      const data = {
        lcReferenceNumber: 'LC11',
        applicationNumber: 'APP1',
      } as any;
      letterOfCreditRepository.create.mockResolvedValue({
        referenceNumber: 'LC11',
      } as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.ADVISEMENT,
        requestId: 'req1',
        data,
      });

      expect(letterOfCreditRepository.create).toHaveBeenCalled();
      expect(swiftMessageQueueAdd).toHaveBeenCalledWith(
        SwiftMessageJobActionEnum.GENERATE_MT_730_AND_UPLOAD,
        expect.any(Object),
      );
    });

    it('should add MT707 and optional MT202 when actionType AMENDMENT with data and beneficiaryInstituitionAccount', async () => {
      const data = {
        lcReferenceNumber: 'LC12',
        beneficiaryInstituitionAccount: 'BENACC',
      } as any;
      letterOfCreditRepository.update.mockResolvedValue(undefined as any);

      await service.handleApproval({
        actionType: LetterOfCreditActionTypeEnum.AMENDMENT,
        requestId: 'req1',
        data,
      });

      expect(swiftMessageQueueAdd).toHaveBeenCalledWith(
        SwiftMessageJobActionEnum.GENERATE_MT_707_AND_UPLOAD,
        data,
      );
      expect(swiftMessageQueueAdd).toHaveBeenCalledWith(
        SwiftMessageJobActionEnum.GENERATE_MT_202_AND_UPLOAD,
        data,
      );
    });
  });

  describe('initiate success path', () => {
    it('should create request and call handleApproval when not draft and PRE_ISSUANCE', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        isCustomerAccountValid: true,
        isAccountRestrictionValid: true,
        isBalanceEnquiryValid: true,
        status: RegulatoryFormStatusEnum.REGISTERED,
        currencyCode: 'NGN',
      } as any);
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);
      tradeProductFactoryService.getProductDetails.mockResolvedValue({} as any);
      const createdRequest = {
        requestId: 'req1',
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.PRE_ISSUANCE,
      } as any;
      letterOfCreditRequestRepository.create.mockResolvedValue(createdRequest);
      jest.spyOn(service as any, 'handleApproval').mockResolvedValue(undefined);
      letterOfCreditRequestRepository.update.mockResolvedValue(
        undefined as any,
      );
      letterOfCreditRepository.update.mockResolvedValue(undefined as any);

      const result = await service.initiate({
        applicationNumber: 'APP1',
        letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.PRE_ISSUANCE,
        tradeProductId: 'tp1',
        token: 't',
        userPermissions: [PermissionEnum.AUTHORISE_LETTER_OF_CREDIT],
        initiator: 'u',
        initiatorId: 'u1',
        initiatorBranchCode: 'br',
        initiatorDepartment: 'd',
        tenantId: 'tn',
      } as any);

      expect(letterOfCreditRequestRepository.create).toHaveBeenCalled();
      expect((service as any).handleApproval).toHaveBeenCalled();
      expect(result).toEqual(createdRequest);
    });
  });

  describe('amend success path', () => {
    it('should create amendment request in transaction when not draft', async () => {
      const lc = {
        referenceNumber: 'LC1',
        applicationNumber: 'APP1',
        status: LetterOfCreditActionTypeEnum.ISSUANCE,
      } as any;
      letterOfCreditRepository.findOne.mockResolvedValue(lc as any);
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue(
        {} as any,
      );
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);
      tradeProductFactoryService.getProductDetails.mockResolvedValue({} as any);
      jest
        .spyOn(service as any, 'validateLetterOfCredit')
        .mockResolvedValue(undefined);
      sequelize.transaction.mockImplementation(((cb: any) =>
        typeof cb === 'function'
          ? cb({} as any)
          : Promise.resolve({} as any)) as any);
      const createdRequest = { requestId: 'am1' } as any;
      letterOfCreditRequestRepository.create.mockResolvedValue(createdRequest);
      letterOfCreditAmendmentRepository.create.mockResolvedValue({} as any);

      const result = await service.amend({
        lcReferenceNumber: 'LC1',
        requestId: 'req1',
        applicationNumber: 'APP1',
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.AMENDMENT,
        tradeProductId: 'tp1',
        token: 't',
        userPermissions: [],
        initiator: 'u',
        initiatorId: 'u1',
        initiatorBranchCode: 'br',
        initiatorDepartment: 'd',
        tenantId: 'tn',
      } as any);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(letterOfCreditRequestRepository.create).toHaveBeenCalled();
      expect(letterOfCreditAmendmentRepository.create).toHaveBeenCalled();
      expect(result).toEqual(createdRequest);
    });
  });

  describe('adjust success path', () => {
    it('should create adjustment request in transaction when not draft', async () => {
      const lc = {
        referenceNumber: 'LC1',
        applicationNumber: 'APP1',
        status: LetterOfCreditActionTypeEnum.ISSUANCE,
      } as any;
      letterOfCreditRepository.findOne.mockResolvedValue(lc as any);
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue(
        {} as any,
      );
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);
      tradeProductFactoryService.getProductDetails.mockResolvedValue({} as any);
      jest
        .spyOn(service as any, 'validateLetterOfCredit')
        .mockResolvedValue(undefined);
      sequelize.transaction.mockImplementation(((cb: any) =>
        typeof cb === 'function'
          ? cb({} as any)
          : Promise.resolve({} as any)) as any);
      const createdRequest = { requestId: 'adj1' } as any;
      letterOfCreditRequestRepository.create.mockResolvedValue(createdRequest);
      letterOfCreditAdjustmentRepository.create.mockResolvedValue({} as any);

      const result = await service.adjust({
        lcReferenceNumber: 'LC1',
        requestId: 'req1',
        applicationNumber: 'APP1',
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.ADJUSTMENT,
        tradeProductId: 'tp1',
        token: 't',
        userPermissions: [],
        initiator: 'u',
        initiatorId: 'u1',
        initiatorBranchCode: 'br',
        initiatorDepartment: 'd',
        tenantId: 'tn',
      } as any);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(letterOfCreditRequestRepository.create).toHaveBeenCalled();
      expect(letterOfCreditAdjustmentRepository.create).toHaveBeenCalled();
      expect(result).toEqual(createdRequest);
    });
  });

  describe('cancel success path', () => {
    it('should create cancellation request in transaction when no existing cancellation', async () => {
      const lc = {
        referenceNumber: 'LC1',
        applicationNumber: 'APP1',
        status: LetterOfCreditActionTypeEnum.ISSUANCE,
      } as any;
      letterOfCreditRequestRepository.findOne.mockResolvedValue(null as any);
      letterOfCreditRepository.findOne.mockResolvedValue(lc as any);
      sequelize.transaction.mockImplementation(((cb: any) =>
        typeof cb === 'function'
          ? cb({} as any)
          : Promise.resolve({} as any)) as any);
      const createdRequest = {
        requestId: 'can1',
        applicationNumber: 'APP1',
      } as any;
      letterOfCreditRequestRepository.create.mockResolvedValue(createdRequest);
      letterOfCreditCancellationRepository.create.mockResolvedValue({} as any);

      const result = await service.cancel({
        lcReferenceNumber: 'LC1',
        requestId: 'req1',
        cancellationReason: 'reason',
        userPermissions: [],
        initiator: 'u',
        initiatorId: 'u1',
        initiatorBranchCode: 'br',
        initiatorDepartment: 'd',
        tenantId: 'tn',
      } as any);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(letterOfCreditRequestRepository.create).toHaveBeenCalled();
      expect(letterOfCreditCancellationRepository.create).toHaveBeenCalled();
      expect(result).toEqual(createdRequest);
    });
  });

  describe('previewSwiftMessage', () => {
    it('should throw for invalid action type', async () => {
      await expect(
        service.previewSwiftMessage({
          letterOfCreditActionType: 'INVALID',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return mt730 for ADVISEMENT', async () => {
      const result = await service.previewSwiftMessage({
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.ADVISEMENT,
        advisingBankBicCode: 'BIC',
        referenceNumber: 'REF',
        relatedReference: 'REL',
        senderToReceiverInformation: 'info',
      } as any);

      expect(result).toHaveProperty('mt730');
    });

    it('should return mtn99 for FREE_FORMAT', async () => {
      const result = await service.previewSwiftMessage({
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.FREE_FORMAT,
        lcReferenceNumber: 'LC1',
        lcRelatedReferenceNumber: 'LC2',
        narrative: 'narr',
        receiversBankBicCode: 'BIC1',
        swiftMessageType: '799',
      } as any);

      expect(result).toHaveProperty('mtn99');
    });
  });

  describe('initiate', () => {
    it('should throw when regulatory form fails customer account validation', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        isCustomerAccountValid: false,
      } as any);

      await expect(
        service.initiate({
          applicationNumber: 'APP1',
          letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
          tradeProductId: 'tp1',
          tenantId: 't',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when regulatory form status is SUBMITTED', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        isCustomerAccountValid: true,
        isAccountRestrictionValid: true,
        isBalanceEnquiryValid: true,
        status: RegulatoryFormStatusEnum.SUBMITTED,
      } as any);

      await expect(
        service.initiate({
          applicationNumber: 'APP1',
          letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
          tradeProductId: 'tp1',
          tenantId: 't',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when matching request exists and not draft', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        isCustomerAccountValid: true,
        isAccountRestrictionValid: true,
        isBalanceEnquiryValid: true,
        status: RegulatoryFormStatusEnum.REGISTERED,
      } as any);
      letterOfCreditRequestRepository.findOne.mockResolvedValue({
        requestId: 'req1',
        approvalStatus: ApprovalStatusEnum.PENDING,
      } as any);

      await expect(
        service.initiate({
          applicationNumber: 'APP1',
          letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
          tradeProductId: 'tp1',
          tenantId: 't',
          isDraft: false,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDebitAndCreditEntries', () => {
    it('should call getProductDetails and handleDebitAndCreditEntries then return entries', async () => {
      const tradeProductData = {
        localCurrency: 'NGN',
        chargesAndTaxes: [
          { type: 'ISSUANCE', applicableCharges: [], applicableTaxes: [] },
        ],
        accountingEntries: [{ type: 'ISSUANCE', postingEntries: [] }],
      };
      tradeProductFactoryService.getProductDetails.mockResolvedValue(
        tradeProductData as any,
      );
      const handleSpy = jest
        .spyOn(service as any, 'handleDebitAndCreditEntries')
        .mockResolvedValue({
          chargesAndTaxesCreditEntries: [],
          chargesAndTaxesDebitEntries: [],
          postingEntryCreditEntries: [],
          postingEntryDebitEntries: [],
        });

      const result = await service.getDebitAndCreditEntries(
        {
          tradeProductId: 'tp1',
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
          applicantAccount: 'acc',
        } as any,
        'token',
      );

      expect(tradeProductFactoryService.getProductDetails).toHaveBeenCalledWith(
        'tp1',
        'token',
      );
      expect(handleSpy).toHaveBeenCalledWith(
        LetterOfCreditActionTypeEnum.ISSUANCE,
        'acc',
        tradeProductData,
        TradeProductFactoryChargesAndTaxesTypeEnum.ISSUANCE,
        {
          tradeProductId: 'tp1',
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
          applicantAccount: 'acc',
        },
        'token',
      );
      expect(result).toEqual({
        chargesAndTaxesCreditEntries: [],
        chargesAndTaxesDebitEntries: [],
        postingEntryCreditEntries: [],
        postingEntryDebitEntries: [],
      });
    });
  });

  describe('validateLetterOfCredit (extra branches)', () => {
    it('should throw when applicableRules is OTHER but otherApplicableRules missing', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        totalCAndF: 1000,
      } as any);
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 0 });
      camsService.getAccountDetails.mockResolvedValue({
        availableBalance: 10000,
      } as any);

      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            applicantAccount: 'acc',
            applicableRules: ApplicationRulesEnum.OTHER,
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when LC amount with max tolerance exceeds 110% of form amount', async () => {
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue({
        totalCAndF: 100,
      } as any);
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 0 });
      camsService.getAccountDetails.mockResolvedValue({
        availableBalance: 1000,
      } as any);

      await expect(
        service.validateLetterOfCredit(
          {
            applicationNumber: 'APP1',
            letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
            lcAmount: 100,
            maxCreditAmountTolerance: 20,
            applicantAccount: 'acc',
          } as any,
          {} as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use totalCF when totalCAndF not in regulatory form (EXPORT)', async () => {
      const form = { totalCF: 500 };
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue(
        form as any,
      );
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 0 });
      camsService.getAccountDetails.mockResolvedValue({
        availableBalance: 1000,
      } as any);

      const result = await service.validateLetterOfCredit(
        {
          applicationNumber: 'APP1',
          letterOfCreditProductType: LetterOfCreditProductTypeEnum.EXPORT,
          lcAmount: 100,
          applicantAccount: 'acc',
        } as any,
        {} as any,
      );

      expect(result).toBe(form);
    });

    it('should adjust lcAmount for AMENDMENT INCREASE', async () => {
      const form = { totalCAndF: 2000 };
      regulatoryFormService.getRegulatoryFormRecord.mockResolvedValue(
        form as any,
      );
      (service as any).calculateTotalChargesAndTaxes = jest
        .fn()
        .mockResolvedValue({ grandTotal: 0 });
      camsService.getAccountDetails.mockResolvedValue({
        availableBalance: 10000,
      } as any);

      const result = await service.validateLetterOfCredit(
        {
          applicationNumber: 'APP1',
          letterOfCreditProductType: LetterOfCreditProductTypeEnum.IMPORT,
          letterOfCreditActionType: LetterOfCreditActionTypeEnum.AMENDMENT,
          lcAmount: 100,
          lcAmountChange: LetterOfCreditAmountChangeEnum.INCREASE,
          lcChangeAmount: 50,
          applicantAccount: 'acc',
        } as any,
        {} as any,
      );

      expect(result).toBe(form);
    });
  });

  describe('handleAccountNumberRetrieval', () => {
    it('should throw when SWIFT BIC not defined for BENEFICIARY', async () => {
      await expect(
        service.handleAccountNumberRetrieval(
          EntryPartyEnum.BENEFICIARY,
          TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          { applicantAccount: 'acc' } as any,
          EntryTypeEnum.DEBIT,
          'token',
          'NGN',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return account for APPLICANT when customer and trade account found', async () => {
      customerManagementService.searchCustomerByAccountNumber.mockResolvedValue(
        {
          data: {
            customers: [{ customer_profiles: [{ customerNumber: 'C123' }] }],
          },
        } as any,
      );
      treasuryTradeService.getCustomerTradeAccounts.mockResolvedValue([
        {
          currencyCode: 'NGN',
          accountType: 'LC Import Client',
          accountNumber: '1234567890',
        },
      ] as any);

      const result = await service.handleAccountNumberRetrieval(
        EntryPartyEnum.APPLICANT,
        TradeAccountTypeEnum.LC_IMPORT_CLIENT,
        { applicantAccount: 'acc' } as any,
        EntryTypeEnum.DEBIT,
        'token',
        'NGN',
      );

      expect(result).toBe('1234567890');
    });

    it('should throw when APPLICANT customer data not found', async () => {
      customerManagementService.searchCustomerByAccountNumber.mockResolvedValue(
        null as any,
      );

      await expect(
        service.handleAccountNumberRetrieval(
          EntryPartyEnum.APPLICANT,
          TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          { applicantAccount: 'acc' } as any,
          EntryTypeEnum.DEBIT,
          'token',
          'NGN',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when APPLICANT trade accounts empty', async () => {
      customerManagementService.searchCustomerByAccountNumber.mockResolvedValue(
        {
          data: {
            customers: [{ customer_profiles: [{ customerNumber: 'C123' }] }],
          },
        } as any,
      );
      treasuryTradeService.getCustomerTradeAccounts.mockResolvedValue(
        [] as any,
      );

      await expect(
        service.handleAccountNumberRetrieval(
          EntryPartyEnum.APPLICANT,
          TradeAccountTypeEnum.LC_IMPORT_CLIENT,
          { applicantAccount: 'acc' } as any,
          EntryTypeEnum.DEBIT,
          'token',
          'NGN',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleDebitAndCreditEntries', () => {
    it('should throw when LC charges and taxes not found', async () => {
      const tradeProductData = { chargesAndTaxes: [], localCurrency: 'NGN' };

      await expect(
        (service as any).handleDebitAndCreditEntries(
          'acc',
          tradeProductData,
          'ISSUANCE' as any,
          {} as any,
          'token',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when applicant account is empty', async () => {
      const tradeProductData = {
        chargesAndTaxes: [
          { type: 'ISSUANCE', applicableCharges: [], applicableTaxes: [] },
        ],
        accountingEntries: [{ type: 'ISSUANCE', postingEntries: [] }],
        localCurrency: 'NGN',
      };
      const productMgmt = (service as any).productManagementService;
      if (productMgmt?.calculateChargeEntries)
        productMgmt.calculateChargeEntries.mockResolvedValue(null);
      (service as any).handleAccountNumberRetrieval = jest.fn();
      (service as any).handlePostingEntries = jest
        .fn()
        .mockResolvedValue({ debitEntries: [], creditEntries: [] });

      await expect(
        (service as any).handleDebitAndCreditEntries(
          '',
          tradeProductData,
          'ISSUANCE' as any,
          {} as any,
          'token',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLetterOfCreditRecords (date filters)', () => {
    it('should apply startDate and endDate to query', async () => {
      letterOfCreditRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getLetterOfCreditRecords({
        id: 'u',
        branch: 'b',
        page: 1,
        size: 10,
        recordScope: AuthorizationStatusEnum.CREATED_SYSTEM_WIDE,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      } as any);

      expect(letterOfCreditRepository.findAndCountAll).toHaveBeenCalled();
      const call = (letterOfCreditRepository.findAndCountAll as jest.Mock).mock
        .calls[0][0];
      expect(call.where.createdAt).toBeDefined();
    });
  });

  describe('getLetterOfCreditRequests (filters)', () => {
    it('should apply requestStatus and date filters', async () => {
      letterOfCreditRequestRepository.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      } as any);

      await service.getLetterOfCreditRequests({
        id: 'u',
        branch: 'b',
        page: 1,
        size: 10,
        recordScope: AuthorizationStatusEnum.CREATED_BY_ME,
        requestStatus: RequestStatusEnum.DRAFT,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      } as any);

      expect(
        letterOfCreditRequestRepository.findAndCountAll,
      ).toHaveBeenCalled();
      const call = (
        letterOfCreditRequestRepository.findAndCountAll as jest.Mock
      ).mock.calls[0][0];
      expect(call.where.requestStatus).toBe(RequestStatusEnum.DRAFT);
      expect(call.where.createdAt).toBeDefined();
    });
  });

  describe('previewSwiftMessage (ISSUANCE and PAYMENT)', () => {
    it('should return mt700 for ISSUANCE', async () => {
      const result = await service.previewSwiftMessage({
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.ISSUANCE,
        formOfDocumentaryCredit: 'IRREVOCABLE',
        issueDate: '2025-01-01',
        applicableRules: 'UCPURR',
        expiryDate: '2025-12-31',
        expiryPlace: 'Lagos',
        applicantBankBicCode: 'BIC',
        applicantName: 'Applicant',
        applicantAddress: 'Addr',
        beneficiaryName: 'Ben',
        beneficiaryAddress: 'BAddr',
        baseCcyCurrency: 'USD',
        lcAmount: 1000,
        lcCurrencyCode: 'USD',
        applicantAccount: 'acc',
        advisingBankBicCode: 'ADVIBICXXX',
        mixedPaymentDetails: [],
        draftMode: 'TENOR',
        tenorPeriod: 30,
        tenorPeriodType: 'DAYS',
      } as any);

      expect(result).toHaveProperty('mt700');
    });

    it('should return mt752 for PAYMENT', async () => {
      const result = await service.previewSwiftMessage({
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.PAYMENT,
        lcReferenceNumber: 'LC1',
        receivedFromBankBicCode: 'BIC',
        totalClaimedAmountCurrency: 'USD',
        totalClaimedAmount: 100,
        returnDate: '2025-01-01',
      } as any);

      expect(result).toHaveProperty('mt752');
    });
  });
});
