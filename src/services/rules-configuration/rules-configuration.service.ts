import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClientService } from '../http-client/http-client.service';
import {
  HttpRequestMethodEnum,
  RulesConfigurationAttributeFieldTypeEnum,
  RulesConfigurationAttributeRelationshipEnum,
  RulesConfigurationCompareWithEnum,
  RulesConfigurationOperatorEnum,
} from 'src/common/enums';
import { RulesConfiguration } from 'src/common/interfaces';

@Injectable()
export class RulesConfigurationService {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
    @Inject(Logger) private readonly loggerService: LoggerService,
  ) {
    this.baseUrl = this.configService.get<string>('baseUrl.tradeRules');
  }

  async getRulesConfigurationByCode(
    ruleCode: string,
    token: string,
  ): Promise<RulesConfiguration> {
    const url = `${this.baseUrl}/v1/rules-configuration/code/${ruleCode}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: { Authorization: token },
    });

    return data.data;
  }

  async evaluateRulesForLetterOfCredit(
    ruleCode: string,
    token: string,
    data: any,
  ): Promise<boolean> {
    const rule = await this.getRulesConfigurationByCode(ruleCode, token);
    const applicableAttributes = rule.attributes;

    if (!applicableAttributes?.length) {
      return true;
    }

    const normalizeValue = (
      value: unknown,
      fieldType: RulesConfigurationAttributeFieldTypeEnum,
    ): string | number | boolean | null => {
      if (value == null) {
        return null;
      }

      if (
        fieldType === RulesConfigurationAttributeFieldTypeEnum.STRING ||
        fieldType === RulesConfigurationAttributeFieldTypeEnum.PARTY
      ) {
        return String(value).toLowerCase();
      }

      if (
        fieldType === RulesConfigurationAttributeFieldTypeEnum.AMOUNT ||
        fieldType === RulesConfigurationAttributeFieldTypeEnum.INTEGER
      ) {
        const numericValue = Number(value);
        return Number.isNaN(numericValue) ? null : numericValue;
      }

      if (fieldType === RulesConfigurationAttributeFieldTypeEnum.DATE) {
        const timestamp = new Date(value as string | number | Date).getTime();
        return Number.isNaN(timestamp) ? null : timestamp;
      }

      if (fieldType === RulesConfigurationAttributeFieldTypeEnum.FLAG) {
        if (typeof value === 'boolean') {
          return value;
        }

        if (typeof value === 'string') {
          const normalized = value.trim().toLowerCase();
          if (normalized === 'true') {
            return true;
          }
          if (normalized === 'false') {
            return false;
          }
        }

        return null;
      }

      return null;
    };

    let isValid: boolean | null = null;

    for (const attribute of applicableAttributes) {
      let isRuleValid = true;

      this.loggerService.debug(
        `attribute.eventField: ${attribute.eventField}`,
        RulesConfigurationService.name,
      );
      this.loggerService.debug(
        `attribute.compareWith: ${attribute.compareWith}`,
        RulesConfigurationService.name,
      );
      this.loggerService.debug(
        `attribute.specificValue: ${attribute.specificValue}`,
        RulesConfigurationService.name,
      );
      this.loggerService.debug(
        `attribute.eventFieldToCompareWith: ${attribute.eventFieldToCompareWith}`,
        RulesConfigurationService.name,
      );
      this.loggerService.debug(
        `attribute.operator: ${attribute.operator}`,
        RulesConfigurationService.name,
      );
      this.loggerService.debug(
        `attribute.fieldType: ${attribute.fieldType}`,
        RulesConfigurationService.name,
      );

      if (attribute.operator) {
        const firstRawValue = data[attribute.eventField];
        let secondRawValue: unknown;

        if (
          attribute.compareWith ===
          RulesConfigurationCompareWithEnum.SPECIFIC_VALUE
        ) {
          secondRawValue = attribute.specificValue;
        } else if (
          attribute.compareWith ===
          RulesConfigurationCompareWithEnum.EVENT_FIELD
        ) {
          secondRawValue = data[attribute.eventFieldToCompareWith];
        } else {
          isRuleValid = false;
        }

        const firstValue = normalizeValue(firstRawValue, attribute.fieldType);
        const secondValue = normalizeValue(secondRawValue, attribute.fieldType);

        if (firstValue === null || secondValue === null) {
          isRuleValid = false;
        }

        const isOrderingOperator =
          attribute.operator === RulesConfigurationOperatorEnum.GREATER_THAN ||
          attribute.operator === RulesConfigurationOperatorEnum.LESS_THAN ||
          attribute.operator ===
            RulesConfigurationOperatorEnum.GREATER_THAN_OR_EQUAL_TO ||
          attribute.operator ===
            RulesConfigurationOperatorEnum.LESS_THAN_OR_EQUAL_TO;

        if (
          isOrderingOperator &&
          (attribute.fieldType ===
            RulesConfigurationAttributeFieldTypeEnum.STRING ||
            attribute.fieldType ===
              RulesConfigurationAttributeFieldTypeEnum.FLAG)
        ) {
          isRuleValid = false;
        }

        if (isRuleValid) {
          if (attribute.operator === RulesConfigurationOperatorEnum.EQUALS) {
            isRuleValid = firstValue === secondValue;
          } else if (
            attribute.operator === RulesConfigurationOperatorEnum.NOT_EQUALS
          ) {
            isRuleValid = firstValue !== secondValue;
          } else if (
            attribute.operator === RulesConfigurationOperatorEnum.GREATER_THAN
          ) {
            isRuleValid = firstValue > secondValue;
          } else if (
            attribute.operator === RulesConfigurationOperatorEnum.LESS_THAN
          ) {
            isRuleValid = firstValue < secondValue;
          } else if (
            attribute.operator ===
            RulesConfigurationOperatorEnum.GREATER_THAN_OR_EQUAL_TO
          ) {
            isRuleValid = firstValue >= secondValue;
          } else if (
            attribute.operator ===
            RulesConfigurationOperatorEnum.LESS_THAN_OR_EQUAL_TO
          ) {
            isRuleValid = firstValue <= secondValue;
          } else {
            isRuleValid = false;
          }
        }

        this.loggerService.debug(
          `firstValue: ${firstValue}`,
          RulesConfigurationService.name,
        );
        this.loggerService.debug(
          `secondValue: ${secondValue}`,
          RulesConfigurationService.name,
        );
        this.loggerService.debug(
          `isRuleValid: ${isRuleValid}`,
          RulesConfigurationService.name,
        );
      }

      if (isValid === null) {
        isValid = isRuleValid;
      } else if (
        attribute.attributeRelationship ===
        RulesConfigurationAttributeRelationshipEnum.OR
      ) {
        isValid = isValid || isRuleValid;
      } else {
        isValid = isValid && isRuleValid;
      }
    }

    return isValid ?? true;
  }
}
