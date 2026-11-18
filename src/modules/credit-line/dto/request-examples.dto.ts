import { ApiBodyOptions } from '@nestjs/swagger';
import { ExamplesObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { RequestTypes } from './create-credit-line.dto';

export const CreateCreditLineApiBody: ApiBodyOptions = {
  description: 'Creation body examples',
  examples: {
    Creation: {
      summary: 'Creation Request Type',
      value: RequestTypes.creation,
    },
    Modification: {
      summary: 'Modification Request Type',
      value: RequestTypes.modification,
    },
    Deactivation: {
      summary: 'Deactivation Request Type',
      value: RequestTypes.deactivation,
    },
    Activation: {
      summary: 'Activation Request Type',
      value: RequestTypes.activation,
    },
  } as ExamplesObject,
};
