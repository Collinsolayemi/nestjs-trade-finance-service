import { BadRequestException } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { RequestStatusEnum, ApprovalStatusEnum } from 'src/common/enums';

@ValidatorConstraint({ name: 'isValidRequestStatus', async: false })
export class IsValidRequestStatusConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as any;
    const isAuthorizer = obj.isAuthorizer === 'true';
    const requestStatus = obj.requestStatus;
    const approvalStatus = obj.approvalStatus;

    if (isAuthorizer) {
      if (requestStatus !== undefined) {
        return false;
      }
      if (approvalStatus === undefined) {
        return true;
      }
      return Object.values(ApprovalStatusEnum).includes(approvalStatus);
    } else {
      if (approvalStatus !== undefined) {
        return false;
      }
      if (requestStatus === undefined) {
        return true;
      }
      return Object.values(RequestStatusEnum).includes(requestStatus);
    }
  }

  defaultMessage(args: ValidationArguments) {
    const obj = args.object as any;
    const isAuthorizer = obj.isAuthorizer === 'true';
    const requestStatus = obj.requestStatus;
    const approvalStatus = obj.approvalStatus;

    const requestStatusValues = Object.values(RequestStatusEnum).join(', ');
    const approvalStatusValues = Object.values(ApprovalStatusEnum).join(', ');

    if (isAuthorizer) {
      if (requestStatus !== undefined) {
        return `When isAuthorizer is true, use 'approvalStatus' with one of these values: ${approvalStatusValues}. 'requestStatus' should not be provided.`;
      }
      if (
        approvalStatus !== undefined &&
        !Object.values(ApprovalStatusEnum).includes(approvalStatus)
      ) {
        return `When isAuthorizer is true, 'approvalStatus' must be one of these values: ${approvalStatusValues}.`;
      }
    } else {
      if (approvalStatus !== undefined) {
        return `When isAuthorizer is false, use 'requestStatus' with one of these values: ${requestStatusValues}. 'approvalStatus' should not be provided.`;
      }
      if (
        requestStatus !== undefined &&
        !Object.values(RequestStatusEnum).includes(requestStatus)
      ) {
        return `When isAuthorizer is false, 'requestStatus' must be one of these values: ${requestStatusValues}.`;
      }
    }
    return `Invalid status configuration: When isAuthorizer is true, use 'approvalStatus' (${approvalStatusValues}); when false, use 'requestStatus' (${requestStatusValues}).`;
  }
}

export function IsValidRequestStatus(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRequestStatusConstraint,
    });
  };
}

/**
 * Validates text field constraints for Letter of Credit issuance.
 * Ensures text doesn't exceed maximum lines and character limits per line.
 * Each line (row) may be up to maxChars; \r\n is added after each line except the last in the stored/transmitted value.
 */
@ValidatorConstraint({ name: 'isValidLcTextField', async: false })
class IsValidLcTextFieldConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    if (value.endsWith('\r\n')) {
      throw new BadRequestException(
        `${args.property} must not end with \\r\\n (last line must not have a trailing line terminator)`,
      );
    }

    const [maxLines, maxChars] = args.constraints as [number, number];
    const fieldName = args.property;
    const lines = value.split('\r\n');

    if (lines.length > maxLines) {
      throw new BadRequestException(
        `${fieldName} must not exceed ${maxLines} lines`,
      );
    }

    lines.forEach((line, index) => {
      const lineLength = line.length;
      if (lineLength > maxChars) {
        throw new BadRequestException(
          `${fieldName} line ${index + 1} must not exceed ${maxChars} characters`,
        );
      }
    });

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const [maxLines, maxChars] = args.constraints as [number, number];
    const fieldName = args.property;
    return `${fieldName} must not exceed ${maxLines} lines or ${maxChars} characters per line`;
  }
}

/**

* Decorator to validate Letter of Credit text fields.
* @param maxLines Maximum number of allowed lines
* @param maxChars Maximum characters per line (including \r\n for non-last lines)
* @param validationOptions Optional validation configuration
* @returns Property decorator function
*/
export function IsValidLcTextField(
  maxLines: number,
  maxChars: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxLines, maxChars],
      validator: IsValidLcTextFieldConstraint,
    });
  };
}
