import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  // BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Permissions } from '../decorators';
import { PermissionEnum } from '../enums';
// import { FormMRepository } from 'src/modules/form-m/form-m.repository';
// import {
//   // LetterOfCreditPreIssuanceRepository,
//   LetterOfCreditRepository,
// } from 'src/modules/letter-of-credit/letter-of-credit.repository';
// import { IssueLetterOfCreditDto } from 'src/modules/letter-of-credit/dto/issue-letter-of-credit.dto';
// import { LetterOfCreditActionTypeEnum } from '../enums';
// import { LetterOfCreditPreIssuance } from 'src/modules/letter-of-credit/models/letter-of-credit-pre-issuance.model';
// import { LetterOfCredit } from 'src/modules/letter-of-credit/models/letter-of-credit.model';
// import { LetterOfCreditActionTypeEnum } from '../enums';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.get<PermissionEnum[]>(
      Permissions,
      context.getHandler(),
    );
    if (!requiredPermissions || requiredPermissions?.length <= 0) return true;

    const req = context.switchToHttp().getRequest();

    const userPermissions = req.user?.user_permissions;
    if (!userPermissions || userPermissions?.length <= 0) return false;
    let hasPermission = false;

    for (const permission of requiredPermissions) {
      if (userPermissions.includes(permission)) {
        hasPermission = true;
        break;
      }
    }

    if (!hasPermission) {
      throw new ForbiddenException(
        `Action denied: User not permitted for this action.`,
      );
    }
    return true;
  }
}

// @Injectable()
// export class ValidateLetterOfCreditApplicationGuard implements CanActivate {
//   constructor(private readonly formMRepository: FormMRepository) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();

//     const formMReferenceNumber = request?.body?.formMApplicationNumber;

//     const correspondingFormM = await this.formMRepository.findOne({
//       where: {
//         applicationNumber: formMReferenceNumber,
//       },
//     });

//     if (!correspondingFormM) {
//       throw new BadRequestException(
//         `Form M with reference number ${request?.body?.formMReferenceNumber} not found.`,
//       );
//     }

//     if (
//       !correspondingFormM?.isChargeTaken &&
//       correspondingFormM?.status === 'QUERY'
//     ) {
//       throw new BadRequestException(
//         `Form M with reference number ${request?.body?.formMReferenceNumber} has not been charged (The Bank hasn't approved the Form M).`,
//       );
//     }

//     return true;
//   }
// }

// @Injectable()
// export class ValidateLetterOfCreditIssuanceGuard implements CanActivate {
//   constructor(
//     private readonly formMRepository: FormMRepository,
//     private readonly letterOfCreditRepository: LetterOfCreditRepository,
//     // private readonly letterOfCreditPreIssuanceRepository: LetterOfCreditPreIssuanceRepository,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const requestBody: IssueLetterOfCreditDto = request?.body;

//     // const lcAmount = requestBody.lcAmount;
//     // const maxTolerance = requestBody.maxCreditAmountTolerance ?? 0;
//     // const bidAmount = requestBody.bidAmount;
//     const formMApplicationNumber = requestBody.formMNumber;

//     const correspondingFormM = await this.formMRepository.findOne({
//       where: {
//         applicationNumber: formMApplicationNumber,
//       },
//     });

//     if (!correspondingFormM) {
//       throw new BadRequestException(
//         `Form M with application number ${requestBody.formMNumber} not found.`,
//       );
//     }

//     // const issuedLetterOfCredit: LetterOfCredit =
//     //   await this.letterOfCreditRepository.findOne({
//     //     where: {
//     //       formMApplicationNumber,
//     //     },
//     //   });

//     // if (
//     //   issuedLetterOfCredit &&
//     //   // Case 1: Trying to PRE_ISSUE again
//     //   (requestBody.letterOfCreditActionType ===
//     //     LetterOfCreditActionTypeEnum.PRE_ISSUANCE ||
//     //     // Case 2: Trying to ISSUE when already ISSUED
//     //     (requestBody.letterOfCreditActionType ===
//     //       LetterOfCreditActionTypeEnum.ISSUANCE &&
//     //       issuedLetterOfCredit.status ===
//     //         LetterOfCreditActionTypeEnum.ISSUANCE))
//     // ) {
//     //   throw new BadRequestException(
//     //     `Letter of Credit for Form M with reference number ${requestBody.formMApplicationNumber} is already in ${issuedLetterOfCredit.status} state, so a new Letter Of Credit cannot be ${requestBody.letterOfCreditActionType} from this Form M with application number ${formMApplicationNumber} anymore.`,
//     //   );
//     // }

//     if (
//       !correspondingFormM?.isChargeTaken &&
//       correspondingFormM?.status === 'QUERY'
//     ) {
//       throw new BadRequestException(
//         `Form M with reference number ${requestBody.formMApplicationNumber} has not been charged (The Bank hasn't approved the Form M).`,
//       );
//     }

//     // const maxBidAmount = 1.1 * lcAmount;

//     // const maxLcAmount = correspondingFormM?.totalCAndF * 1.1;

//     // const lcAmountWithMaxTolerance = lcAmount * (1 + maxTolerance);

//     // if (maxLcAmount < lcAmount) {
//     //   throw new BadRequestException(
//     //     `LC Amount cannot be greater than 110% of the Form M Amount.`,
//     //   );
//     // }

//     // if (maxLcAmount < lcAmountWithMaxTolerance) {
//     //   throw new BadRequestException(
//     //     `LC Amount (Max Credit Tolerance Inclusive) cannot be greater than 110% of the Form M Amount.`,
//     //   );
//     // }

//     // if (!bidAmount && bidAmount > maxBidAmount) {
//     //   throw new BadRequestException(
//     //     `Bid Amount can not be greater than 110% of LC Amount.`,
//     //   );
//     // }

//     /**
//      * Pre-negotiation amount must not be not greater that the Unutilized amount of the Credit line
//      */

//     return true;
//   }
// }
