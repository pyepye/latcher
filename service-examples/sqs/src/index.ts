import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { sqsMatcher } from './sqs.js';

const latcher = new Latcher({ matchers: [sqsMatcher] });

export const handler: Handler = latcher.handler();
