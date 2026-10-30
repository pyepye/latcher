import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { cloudwatchMatcher } from './cloudwatch.js';

const latcher = new Latcher({ matchers: [cloudwatchMatcher] });

export const handler: Handler = latcher.handler();
