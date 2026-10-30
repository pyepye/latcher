import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { cognitoMatcher } from './cognito.js';

const latcher = new Latcher({ matchers: [cognitoMatcher] });

export const handler: Handler = latcher.handler();
