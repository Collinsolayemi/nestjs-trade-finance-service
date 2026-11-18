import { Logger } from '@nestjs/common';
import * as moment from 'moment-timezone';
import {
  IANATimeZoneDatabaseEnum,
  ThirdPartySourceEnum,
  TransactionCategoryEnum,
  TransactionSourceEnum,
  TransactionSubSourceEnum,
} from '../enums';
import { CreateJournalPostingRequestBody, PostJournal } from '../interfaces';

const logger = new Logger('CreateJournalPostingRequestBody');

export default function createJournalPostingRequestBody(
  data: CreateJournalPostingRequestBody,
): PostJournal {
  const {
    debitAccount,
    transactionAmount,
    creditAccount,
    userId,
    branchCode,
    currencyShortCode,
    isCrossCurrency = false,
    requestId,
    reconciliationRemarks,
    creditEntries,
    debitEntries,
    initiatedBy,
    approvedByBranchCode,
    narration,
    transactionSubSource = TransactionSubSourceEnum.WITHIN_BANK_TRANSFER,
  } = data;

  const journalPostingRequestBody = {
    initiatedByBranchCode: branchCode,
    postedByBranchCode: branchCode,
    approvedByBranchCode: approvedByBranchCode ?? branchCode,
    requestId,
    currencyCode: currencyShortCode,
    initiatedBy: initiatedBy ?? userId,
    postedBy: initiatedBy ?? userId,
    approvedBy: userId,
    approvedDate: moment().tz(IANATimeZoneDatabaseEnum.LAGOS).toISOString(),
    initiatedDate: moment().tz(IANATimeZoneDatabaseEnum.LAGOS).toISOString(),
    postedDate: moment().tz(IANATimeZoneDatabaseEnum.LAGOS).toISOString(),
    multipleDebit: 0,
    valueDate: moment().tz(IANATimeZoneDatabaseEnum.LAGOS).toISOString(),
    reconciliationRemarks:
      reconciliationRemarks ??
      `Transfer ${currencyShortCode}${transactionAmount} from ${debitAccount} to ${creditAccount}`,
    isFuture: false,
    isCrossCurrency,
    transactionCategory: TransactionCategoryEnum.BI,
    transactionSource: TransactionSourceEnum.OVER_THE_COUNTER,
    transactionSubSource,
    thirdPartySource: ThirdPartySourceEnum.INTERNAL_CUSTOMER,
    creditEntries: creditEntries
      ? creditEntries
      : [
          {
            creditAccountNumber: creditAccount,
            creditAmount: transactionAmount,
            creditNarration:
              narration ??
              `Crediting ${creditAccount} with ${currencyShortCode}${transactionAmount} from ${debitAccount}`,
          },
        ],
    debitEntries: debitEntries
      ? debitEntries
      : [
          {
            debitAccountNumber: debitAccount,
            debitAmount: transactionAmount,
            debitNarration:
              narration ??
              `Debiting ${debitAccount} with  ${currencyShortCode}${transactionAmount} for ${creditAccount}`,
          },
        ],
  };

  logger.debug(
    `Journal Posting Request Body: ${JSON.stringify(journalPostingRequestBody)}`,
    'CreateJournalPostingRequestBody',
  );

  return journalPostingRequestBody;
}
